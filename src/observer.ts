/**
 * Visibility tracking using IntersectionObserver.
 *
 * Why IntersectionObserver?
 * - It tells us WHICH images are actually visible in the viewport.
 * - This lets us avoid upgrading images that the user never sees,
 *   which saves bandwidth and decoding work.
 *
 * This MVP keeps the rules simple:
 * - Single observer instance
 * - Visibility is a boolean (visible / not visible)
 * - No intersectionRatio logic yet
 */

export interface VisibilityChange {
  element: HTMLImageElement;
  isVisible: boolean;
}

export type VisibilityListener = (change: VisibilityChange) => void;

export interface VisibilityController {
  observeImage(img: HTMLImageElement): void;
  unobserveImage(img: HTMLImageElement): void;
  isVisible(img: HTMLImageElement): boolean;
  disconnect(): void;
}

/**
 * Create a single IntersectionObserver that tracks image visibility.
 *
 * @param listener - Called whenever an observed image enters or leaves the viewport.
 * @param threshold - Intersection threshold; 0 or 0.1 is fine for this MVP.
 */
export function createImageVisibilityObserver(
  listener: VisibilityListener,
  threshold: number = 0.1
): VisibilityController {
  const visibilityMap = new Map<HTMLImageElement, boolean>();

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const target = entry.target as HTMLImageElement;
        const isVisible = entry.isIntersecting;

        const previous = visibilityMap.get(target);
        visibilityMap.set(target, isVisible);

        if (previous !== isVisible) {
          listener({ element: target, isVisible });
        }
      }
    },
    {
      threshold,
    }
  );

  return {
    observeImage(img: HTMLImageElement) {
      visibilityMap.set(img, false);
      io.observe(img);
    },

    unobserveImage(img: HTMLImageElement) {
      visibilityMap.delete(img);
      io.unobserve(img);
    },

    isVisible(img: HTMLImageElement): boolean {
      return visibilityMap.get(img) === true;
    },

    disconnect() {
      visibilityMap.clear();
      io.disconnect();
    },
  };
}


