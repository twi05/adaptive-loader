import { createCore, InitConfig, RegisterImageOptions, CoreController } from "./core.js";

/**
 * Public API
 *
 * initResourceLoader({
 *   slowVelocityThreshold: number,
 *   slowDurationMs: number
 * })
 *
 * Returns an object with:
 * - registerImage(imgElement, { lowSrc, highSrc })
 * - destroy()
 */

export interface InitResourceLoaderConfig extends InitConfig {}

export interface RegisterImageConfig extends RegisterImageOptions {}

export interface ResourceLoaderApi {
  registerImage(
    imgElement: HTMLImageElement,
    config: RegisterImageConfig
  ): void;
  destroy(): void;
}

export function initResourceLoader(
  config: InitResourceLoaderConfig
): ResourceLoaderApi {
  const core: CoreController = createCore(config);
    console.log("core", core);
  return {
    registerImage(imgElement: HTMLImageElement, config: RegisterImageConfig) {
      core.registerImage(imgElement, config);
    },

    destroy() {
      core.destroy();
    },
  };
}


