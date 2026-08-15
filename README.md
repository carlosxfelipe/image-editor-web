# Image Editor Web App 🎨

*(🔗 [Live Demo](https://image-editor-web-app.netlify.app/))*

An ultra-fast image editor running 100% client-side right in your browser. Built with React, Vite, and KonvaJS, this project features a beautiful Glassmorphism-based UI, providing not only great utility but also a premium and visually engaging user experience.

## ✨ Features

* **Full Image Editing Suite:**
  * **Crop:** Interactive cropping tool to select the perfect frame for your initial image.
  * **Rotate:** Rotate the main image with automatic Canvas readjustment.
  * **Add Text:** Insert text annotations and position them anywhere.
  * **Add Arrows:** Create awesome pointers. Select any arrow to quickly change its color, make it dashed, or turn it into a double-ended arrow.
  * **Obfuscation Tools (Blur & Pixelate):** Spawn draggable "magic lenses" to safely blur or pixelate sensitive information (like faces, documents or license plates). You can seamlessly toggle the active filter between blur and pixelate using the context panel.
  * **Image Overlay:** Paste or upload secondary images (like logos or stickers) over the original image.
* **Dynamic Properties Panel:** When an element is selected on the canvas, a floating properties bar appears, allowing you to instantly change its color using a predefined palette and toggle styles in real-time.
* **Premium UI:** Modern and vibrant Glassmorphism design featuring Violet and Fuchsia gradients.
* **Interaction Sounds:** Subtle auditory feedback when dragging files into the Dropzone or clicking buttons, powered by the `cuelume` library.
* **Instant Download:** The edited canvas is rapidly exported as a high-resolution PNG.

## 🛠 Tech Stack

* **[React 19](https://react.dev/)** + **[Vite](https://vitejs.dev/)**: For lightning-fast initialization and an amazing developer experience.
* **[Konva.js](https://konvajs.org/)** & **[react-konva](https://github.com/konvajs/react-konva)**: Powers the entire graphic rendering engine and handles 2D Canvas transformations (drag, drop, resize).
* **[react-image-crop](https://github.com/DominicTobias/react-image-crop)**: Used in the cropping modal.
* **[Lucide React](https://lucide.dev/)**: For lightweight, scalable SVG icons in the toolbar.
* **[Cuelume](https://github.com/joshwcomeau/cuelume)**: Provides subtle sound effects for Drag & Drop events, improving accessibility and overall UX.
* **TypeScript** & **Vanilla CSS**: Fully typed components and highly optimized styles with zero utility-framework overhead, leveraging raw CSS variables.

## 🚀 Running Locally

To clone the project and run it on your machine:

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Format code (using Prettier)
npm run format
```
