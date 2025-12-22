/**
 * Image loader: low-quality → high-quality.
 *
 * This module is intentionally dumb and one-way:
 * - It always starts images at a LOW quality source
 * - It only upgrades to HIGH quality once
 * - It never downgrades back to LOW
 *
 * Scroll velocity and visibility rules are handled by the core
 * orchestrator, not here. This keeps the responsibilities clear.
 */

export interface ImageResourceConfig {
  lowSrc: string;
  highSrc: string;
}

interface TrackedImage extends ImageResourceConfig {
  element: HTMLImageElement;
  upgraded: boolean;
}

export interface ImageLoaderController {
  registerImage(
    element: HTMLImageElement,
    config: ImageResourceConfig
  ): void;
  upgradeImage(element: HTMLImageElement): boolean;
  isUpgraded(element: HTMLImageElement): boolean;
  unregisterImage(element: HTMLImageElement): void;
  clear(): void;
}

export function createImageLoader(): ImageLoaderController {
  const images = new Map<HTMLImageElement, TrackedImage>();

  return {
    registerImage(element: HTMLImageElement, config: ImageResourceConfig) {
      // Start with the LOW quality source.
      element.src = config.lowSrc;

      images.set(element, {
        element,
        lowSrc: config.lowSrc,
        highSrc: config.highSrc,
        upgraded: false,
      });
    },

    upgradeImage(element: HTMLImageElement): boolean {
      const tracked = images.get(element);
      if (!tracked) return false;
      if (tracked.upgraded) return false;

      tracked.upgraded = true;
      tracked.element.src = tracked.highSrc;
      return true;
    },

    isUpgraded(element: HTMLImageElement): boolean {
      const tracked = images.get(element);
      return tracked ? tracked.upgraded : false;
    },

    unregisterImage(element: HTMLImageElement) {
      images.delete(element);
    },

    clear() {
      images.clear();
    },
  };
}


