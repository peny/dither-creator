# Dither Creator

An interactive web application for creating dithered images with SVG export functionality. Upload an image, segment different body parts (hair, face, body, arms, legs, accessories), apply dither patterns, and export as SVG files.

## Features

- **Image Upload**: Drag and drop or click to upload images
- **Interactive Segmentation**: Click and drag to mark different body parts
- **Dither Patterns**: Apply various dither patterns (dots, lines, grid, crosshatch, waves, solid)
- **SVG Export**: Export individual segments or complete image as SVG files
- **Modern UI**: Clean, responsive interface built with React and TypeScript

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with custom properties
- **Icons**: Lucide React
- **File Handling**: File-saver for downloads

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## Usage

1. **Upload an Image**: Drag and drop an image or click to select one
2. **Segment Body Parts**: 
   - Select a body part type (hair, face, body, arms, legs, accessories)
   - Click and drag on the image to mark the area
   - Repeat for each body part you want to segment
3. **Apply Dither Patterns**: Choose from various dither patterns for each segmented area
4. **Export**: Download as individual SVG files or as a complete image

## Available Dither Patterns

- **Dots**: Circular dot pattern
- **Lines**: Diagonal line pattern
- **Grid**: Square grid pattern
- **Crosshatch**: Crossed diagonal lines
- **Waves**: Curved wave pattern
- **Solid**: Solid fill

## Export Options

- **Export All as SVG**: Single file with all segments and patterns
- **Export Separate Files**: Individual SVG file for each segment
- **Export with Patterns**: Only segments with dither patterns applied

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # React components
│   ├── ImageUpload.tsx
│   ├── SegmentationCanvas.tsx
│   ├── SegmentationControls.tsx
│   ├── DitherPatterns.tsx
│   └── ExportControls.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
├── hooks/              # Custom React hooks (future)
├── utils/              # Utility functions (future)
├── App.tsx             # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
