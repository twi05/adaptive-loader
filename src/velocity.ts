/**
 * Scroll velocity tracking.
 *
 * This module is intentionally small and focused:
 * - Listens to scroll events
 * - Calculates velocity in px/ms
 * - Classifies the current scroll as FAST or SLOW
 *
 * It does NOT debounce or delay decisions. That is handled
 * by the core orchestrator so it can express different policies.
 */

export type ScrollSpeed = "FAST" | "SLOW";

export interface VelocityState {
  velocity: number; // pixels per millisecond
  speed: ScrollSpeed;
}

export type VelocityListener = (state: VelocityState) => void;

export interface VelocityController {
  /**
   * Stop listening to scroll and release references.
   */
  destroy(): void;
}

/**
 * Start listening to window scroll and compute scroll velocity.
 *
 * @param slowVelocityThreshold - Velocity below or equal to this (px/ms) is considered SLOW.
 * @param listener - Called on every scroll event with current velocity and FAST/SLOW state.
 */
export function initScrollVelocity(
  slowVelocityThreshold: number,
  listener: VelocityListener
): VelocityController {
  let lastY = window.scrollY;
  let lastTime = performance.now();

  let lastSpeed: ScrollSpeed = "SLOW";

  const handleScroll = () => {
    const now = performance.now();
    const currentY = window.scrollY;

    const dy = Math.abs(currentY - lastY);
    const dt = now - lastTime;

    // Avoid division by zero; if dt is 0, treat as zero velocity.
    const velocity = dt > 0 ? dy / dt : 0;
    const speed: ScrollSpeed =
      velocity <= slowVelocityThreshold ? "SLOW" : "FAST";

    // Update state for next event.
    lastY = currentY;
    lastTime = now;
    lastSpeed = speed;

    listener({ velocity, speed });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  // Emit an initial state so the system has a starting point.
  listener({
    velocity: 0,
    speed: lastSpeed,
  });

  return {
    destroy() {
      window.removeEventListener("scroll", handleScroll);
    },
  };
}


