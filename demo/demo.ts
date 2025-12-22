import { initResourceLoader } from "../src/index";

/**
 * Demo wiring.
 *
 * This file shows how a consumer would use the minimal public API:
 *
 *   const loader = initResourceLoader({ slowVelocityThreshold, slowDurationMs });
 *   loader.registerImage(imgElement, { lowSrc, highSrc });
 *
 * For learning purposes we also log out the key decisions so you can
 * see how scroll velocity and visibility interact.
 */

function main() {
  console.log("[demo] starting demo");

  // This threshold is intentionally not too low:
  // - If the user flicks quickly, we want FAST
  // - If they gently scroll or pause, we want SLOW
  //
  // You can tweak this live to see how it changes behavior.
  const loader = initResourceLoader({
    slowVelocityThreshold: 0.4, // px/ms
    slowDurationMs: 200, // must remain SLOW for 200ms before upgrades
  });

  const images = Array.from(
    document.querySelectorAll<HTMLImageElement>("img[data-low][data-high]")
  );

  images.forEach((img, index) => {
    const lowSrc = img.dataset.low;
    const highSrc = img.dataset.high;

    if (!lowSrc || !highSrc) {
      console.warn(
        "[demo] image missing data-low or data-high attributes, skipping",
        img
      );
      return;
    }

    console.log("[demo] register image", index + 1, {
      label: img.getAttribute("data-label"),
      lowSrc,
      highSrc,
    });

    loader.registerImage(img, { lowSrc, highSrc });

    // For visual debugging: mark when the image has received its high-res source.
    const observer = new MutationObserver(() => {
      if (img.src === highSrc) {
        img.dataset.state = "high";
        observer.disconnect();
      }
    });
    observer.observe(img, { attributes: true, attributeFilter: ["src"] });
  });

  // Expose for quick experimentation in devtools.
  (window as any).__resourfsceLoader = loader;

  window.addEventListener("beforeunload", () => {
    loader.destroy();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}


