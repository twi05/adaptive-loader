# Adaptive Image Loader

An intelligent image loading library that uses scroll velocity to optimize when images are upgraded from low-resolution to high-resolution versions. Perfect for improving initial page load performance while ensuring high-quality images are loaded when users slow down or pause scrolling.

## Features

- 🚀 **Scroll Velocity Detection**: Monitors scroll speed to determine when to upgrade images
- 👁️ **Visibility Tracking**: Uses IntersectionObserver to only upgrade visible images
- ⚡ **Performance Optimized**: Loads low-res images initially, upgrades only when appropriate
- 🎯 **Smart Upgrading**: Only upgrades when scroll is slow and stable for a configurable duration
- 🔧 **Zero Dependencies**: Pure TypeScript implementation with no external dependencies
- 📦 **Small Bundle**: Lightweight and efficient

## How It Works

The library monitors scroll velocity and only upgrades images from low-res to high-res when:

1. **Scroll is SLOW** - User is scrolling slowly or has paused
2. **Stable Duration** - Scroll has been slow for a minimum duration (configurable)
3. **Image is Visible** - Image is currently in the viewport

This ensures that:
- Fast scrolling doesn't waste bandwidth loading high-res images
- Users get high-quality images when they slow down or pause
- Initial page load is faster with low-res placeholders

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

This compiles TypeScript files from `src/` to `dist/src/`.

## Usage

### Basic Example

```typescript
import { initResourceLoader } from './dist/src/index.js';

// Initialize the loader
const loader = initResourceLoader({
  slowVelocityThreshold: 0.4, // px/ms - below this = SLOW
  slowDurationMs: 200,        // must be SLOW for 200ms before upgrades
});

// Register images with low and high resolution sources
const img = document.querySelector('img');
loader.registerImage(img, {
  lowSrc: 'path/to/low-res.jpg',
  highSrc: 'path/to/high-res.jpg'
});

// Cleanup when done
loader.destroy();
```

### HTML Example

```html
<img 
  data-low="low-res.jpg" 
  data-high="high-res.jpg"
  src="low-res.jpg"
  alt="Description"
/>
```

```typescript
const images = document.querySelectorAll('img[data-low][data-high]');
images.forEach((img) => {
  loader.registerImage(img, {
    lowSrc: img.dataset.low,
    highSrc: img.dataset.high
  });
});
```

## API Reference

### `initResourceLoader(config)`

Creates and returns a resource loader instance.

**Parameters:**
- `config.slowVelocityThreshold` (number): Scroll velocity threshold in px/ms. Values ≤ this threshold are considered "SLOW"
- `config.slowDurationMs` (number): Minimum duration (in milliseconds) that scroll must remain slow before upgrades are allowed

**Returns:** `ResourceLoaderApi`

### `ResourceLoaderApi`

#### `registerImage(imgElement, config)`

Registers an image element for adaptive loading.

**Parameters:**
- `imgElement` (HTMLImageElement): The image element to register
- `config.lowSrc` (string): URL of the low-resolution image
- `config.highSrc` (string): URL of the high-resolution image

#### `destroy()`

Cleans up all event listeners, observers, and timers. Call this when you're done with the loader (e.g., on page unload).

## Configuration Tips

### Choosing `slowVelocityThreshold`

- **Lower values (0.2-0.3)**: More aggressive upgrading, upgrades happen sooner
- **Higher values (0.5-0.8)**: More conservative, only upgrades when scrolling is very slow
- **Recommended**: Start with `0.4` and adjust based on your use case

### Choosing `slowDurationMs`

- **Lower values (100-200ms)**: Faster upgrades, but may upgrade during brief pauses
- **Higher values (300-500ms)**: More stable, ensures user has actually paused
- **Recommended**: Start with `200ms` for a good balance

## Demo

A working demo is included in the `demo/` directory. To run it:

1. Build the project: `npm run build`
2. Open `demo/index.html` in a browser
3. Open the browser console to see velocity and upgrade logs
4. Scroll quickly vs slowly to see the difference in behavior

The demo exposes the loader instance as `window.__resourfsceLoader` for experimentation in the browser console.

## Project Structure

```
├── src/              # TypeScript source files
│   ├── core.ts       # Main orchestrator
│   ├── velocity.ts   # Scroll velocity tracking
│   ├── observer.ts   # IntersectionObserver wrapper
│   ├── loader.ts     # Image loading logic
│   └── index.ts      # Public API
├── dist/             # Compiled JavaScript output
├── demo/             # Demo application
│   ├── index.html    # Demo page
│   └── demo.ts       # Demo implementation
└── package.json      # Project configuration
```

## Development

### Watch Mode

```bash
npm run watch
```

This will automatically recompile TypeScript files when changes are detected.

### TypeScript Configuration

The project uses strict TypeScript settings. See `tsconfig.json` for details.

## Browser Support

- Modern browsers with ES2017+ support
- Requires `IntersectionObserver` API (widely supported)
- No polyfills included (add your own if needed for older browsers)



