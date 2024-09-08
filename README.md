# Map Builder Web Application

## Overview

Map Builder is a web-based application that allows users to create, edit, and
visualize 2D maps using a grid-based system. It's built with React, TypeScript,
and Vite, providing a fast and efficient development experience.

## Features

- Create multi-layered maps with customizable grid sizes
- Add, edit, and delete tiles with various properties (type, color, texture)
- Support for multiple layers with easy navigation
- Real-time statistics and visualization of tile distribution
- Save and load map configurations
- Responsive design for various screen sizes

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/map-builder-webapp.git
   cd map-builder-webapp
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Map Editor**: Click on tiles in the grid to paint them with the selected
   tile type.
2. **Toolbar**: Select tile types, adjust map size, and access save/load
   functions.
3. **Layers**: Add or remove layers to create depth in your maps.
4. **Statistics**: View real-time statistics of tile distribution in your map.

## Building for Production

To create a production build, run:

```
npm run build
```

This will generate optimized files in the `dist` directory.

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Recharts for statistics visualization

## Project Structure

```
map-builder-webapp/
├── src/
│   ├── components/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   ├── main.tsx
│   └── globals.css
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Key Components

The `MapBuilder` component is the main container for the application, managing
the state and logic for the map editor.

The `Editor` component handles the rendering and interaction with the map grid.

The `Toolbar` component provides controls for tile selection, map size
adjustment, and file operations.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Vite](https://vitejs.dev/) - super easy build tooling for SPAs
- [shadcn/ui](https://ui.shadcn.com/) - nice, easy to customize components
- [Recharts](https://recharts.org/) - charting library
- [Lucide](https://lucide.dev/) - icons
