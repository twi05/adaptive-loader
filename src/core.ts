import {

  initScrollVelocity,
  ScrollSpeed,
  VelocityState,
  VelocityController,
} from "./velocity.js";
import {
  createImageVisibilityObserver,
  VisibilityController,
} from "./observer.js";
import {
  createImageLoader,
  ImageLoaderController,
  ImageResourceConfig,
} from "./loader.js";

/**
 * Core orchestrator.
 *
 * Responsibilities:
 * - Uses scroll velocity to decide WHEN upgrades are allowed.
 * - Uses IntersectionObserver to decide WHICH images are eligible.
 * - Calls the image loader to actually perform low → high upgrades.
 *
 * Policy rules for this MVP:
 * - Only upgrade when:
 *   - scroll is SLOW
 *   - scroll has been SLOW for at least `slowDurationMs`
 *   - image is visible in the viewport
 * - Upgrades are one-way; we never downgrade images.
 */

export interface InitConfig {
  slowVelocityThreshold: number; // px/ms below or equal = SLOW
  slowDurationMs: number; // how long scroll must be SLOW before upgrades are allowed
}

export interface RegisterImageOptions extends ImageResourceConfig {}

export interface CoreController {
  registerImage(
    element: HTMLImageElement,
    options: RegisterImageOptions
  ): void;
  destroy(): void;
}

export function createCore(config: InitConfig): CoreController {
  const { slowVelocityThreshold, slowDurationMs } = config;

  const loader: ImageLoaderController = createImageLoader();
  const registeredImages = new Set<HTMLImageElement>();

  // Visibility tracking: which images are currently visible.
  const visibility: VisibilityController = createImageVisibilityObserver(
    ({ element, isVisible }) => {
      console.log(
        "[observer] visibility change",
        { isVisible },
        element.getAttribute("data-label") || element.src
      );

      // If we are already in a stable SLOW state, a newly visible image
      // can be upgraded immediately.
      if (isVisible && isSlowStable) {
        tryUpgradeImage(element, "visibility");
      }
    },
    0.1
  );

  // Velocity tracking: current speed and velocity value.
  let currentSpeed: ScrollSpeed = "SLOW";
  let currentVelocity = 0;
  let isSlowStable = false;
  let slowTimer: number | null = null;

  const velocityController: VelocityController = initScrollVelocity(                             
    slowVelocityThreshold,
    (state: VelocityState) => {
      const previousSpeed = currentSpeed;
      currentSpeed = state.speed;
      currentVelocity = state.velocity;

      console.log("[velocity] value", {
        velocity: currentVelocity.toFixed(3),
        speed: currentSpeed,
      });

      if (previousSpeed !== currentSpeed) {
        console.log("[velocity] speed transition", previousSpeed, "→", currentSpeed);
      }

      handleSpeedChange();
    }
  );

  function handleSpeedChange() {
    // If scroll is FAST again, we immediately block upgrades and clear timers.
    if (currentSpeed === "FAST") {
      if (isSlowStable) {
        console.log("[core] leaving stable SLOW due to FAST scroll");
      }
      isSlowStable = false;
      if (slowTimer !== null) {
        window.clearTimeout(slowTimer);
        slowTimer = null;
      }
      return;
    }

    // If scroll is SLOW, we don't trust it immediately.
    // We require it to stay SLOW for slowDurationMs before
    // allowing upgrades. This acts like a debounce and avoids
    // rapid toggling if the user is still flicking the page.
    if (currentSpeed === "SLOW") {
      if (isSlowStable) {
        // Already stable; nothing to do.
        return;
      }

      if (slowTimer === null) {
        slowTimer = window.setTimeout(() => {
          slowTimer = null;

          // Only become stable SLOW if we are still SLOW at the end.
          if (currentSpeed === "SLOW") {
            isSlowStable = true;
            console.log("[core] entered stable SLOW state, upgrades allowed");
            attemptUpgradesForVisibleImages("slow-stable");
          }
        }, slowDurationMs);
      }
    }
  }

  function attemptUpgradesForVisibleImages(reason: string) {
    registeredImages.forEach((img) => {
      if (!visibility.isVisible(img)) return;
      tryUpgradeImage(img, reason);
    });
  }

  function tryUpgradeImage(img: HTMLImageElement, reason: string) {
    if (!isSlowStable) {
      // Guard: upgrades are only allowed in stable SLOW.
      return;
    }
    if (!registeredImages.has(img)) return;
    if (loader.isUpgraded(img)) return;

    const upgraded = loader.upgradeImage(img);
    if (upgraded) {
      console.log(
        "[loader] upgraded image due to",
        reason,
        img.getAttribute("data-label") || img.src
      );
    }
  }

  return {
    registerImage(element: HTMLImageElement, options: RegisterImageOptions) {
      registeredImages.add(element);
      // Tag for easier debugging in logs.
      if (!element.getAttribute("data-label")) {
        element.setAttribute("data-label", options.highSrc);
      }

      loader.registerImage(element, {
        lowSrc: options.lowSrc,
        highSrc: options.highSrc,
      });

      visibility.observeImage(element);

      // If we are already in a stable SLOW state and the image is
      // visible at registration time, attempt an immediate upgrade.
      if (isSlowStable && visibility.isVisible(element)) {
        tryUpgradeImage(element, "register-visible");
      }
    },

    destroy() {
      registeredImages.clear();
      visibility.disconnect();
      loader.clear();
      velocityController.destroy();

      if (slowTimer !== null) {
        window.clearTimeout(slowTimer);
        slowTimer = null;
      }
    },
  };
}


