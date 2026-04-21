# A\* Grid Pathfinding Visualizer

A web-based visualization tool for the A\* pathfinding algorithm on a 20x20 grid with interactive controls.

## Features

- Interactive grid-based pathfinding visualization
- A\* algorithm implementation with step-by-step exploration
- Two distance modes: Euclidean and Manhattan
- Two obstacle generation modes: Perlin noise and maze generation
- Real-time path rendering with color-coded cells
- Manual positioning of start and end points by clicking on the grid

## Project Structure

- `index.html` - Main HTML document with canvas and toolbar
- `styles.css` - Basic styling for the UI
- `js/main.js` - Entry point and main application logic
- `js/config.js` - Configuration constants (grid size, distance modes, obstacle modes)
- `js/grid.js` - Grid creation and management, obstacle generation
- `js/astar.js` - A\* algorithm implementation
- `js/render.js` - Canvas rendering and visualization
- `js/input.js` - Canvas click event handling
- `js/ui.js` - UI element management
- `js/noise.js` - Procedural noise function for obstacle generation

## How to Use

1. Open `index.html` in a web browser
2. Select a tool from the dropdown (Start position or End position)
3. Click on the grid to place start and end points
4. Use the buttons to control pathfinding:
   - Step: Execute one step of the A\* algorithm
   - Auto explore: Run the algorithm continuously until path is found
   - Reset search: Clear the search state and start over
5. The algorithm will display:
   - Yellow cells: Start position
   - Purple cells: End position
   - Green cells: Open nodes (frontier)
   - Red cells: Closed nodes (explored)
   - Blue cells: Final path

## Color Legend

- Black: Walls/obstacles
- White: Walkable space
- Yellow: Start position
- Purple: Goal position
- Green: Open set (frontier for exploration)
- Red: Closed set (already explored)
- Blue: Final path from start to goal

## Technical Details

- Grid Size: 20x20 cells
- Cell Display Size: 30 pixels each
- Total Canvas: 600x600 pixels
- Pathfinding Heuristic: Euclidean or Manhattan distance
- Supports 8-directional movement (including diagonals)
