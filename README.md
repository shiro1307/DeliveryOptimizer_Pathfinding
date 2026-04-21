# DeliveryOptimizer City - A\* Pathfinding Visualizer

A web-based interactive visualization tool for the **A\* pathfinding algorithm** on real city street networks. Visualize how the algorithm explores roads and finds optimal routes between delivery points using actual OpenStreetMap data.

## Features

- **Real City Maps** - Load street networks from OpenStreetMap data (nodes & edges)
- **Graph-Based Pathfinding** - A\* algorithm on road networks (not grids)
- **Interactive Map Controls** - Pan, zoom, and gesture support
- **Multi-City Support** - Easy dataset switching with a dropdown (pre-configured: City 1, City 2, City 3, Brasilia)
- **Custom JSON Maps** - Add your own city maps by specifying graph JSON file paths
- **Step-by-Step Visualization** - Explore one A\* iteration at a time or run auto-explore
- **Real-Time Path Rendering** - Color-coded nodes showing search state (open/closed/path)
- **Manual Point Placement** - Click on the map to set start and end delivery points

## Project Structure

### Core Files

- `index.html` - Main HTML with canvas and interactive toolbar
- `styles.css` - UI styling
- `js/main.js` - Application entry point, city initialization, and event handling

### Graph & Pathfinding

- `js/graphData.js` - Loads graph JSON files (nodes & edges from OSM)
- `js/astar.js` - A\* algorithm implementation with step-by-step execution
- `js/datasetConfig.js` - City dataset configuration (paths to JSON files)
- `js/labelData.js` - Loads location labels for map display

### Rendering & Interaction

- `js/render.js` - Canvas rendering, graph visualization, color-coded cells
- `js/gestureController.js` - Pan, zoom, and mouse/touch gesture handling
- `js/ui.js` - UI element management (buttons, dropdowns)
- `js/input.js` - Canvas click event handling for start/end point placement

### Data Files

- `graph.json` - Default city graph (nodes & edges)
- `brasilia.json` - Real OpenStreetMap data for Brasilia
- `cache/` - Cached OSM data files

### Utilities

- `js/config.js` - Global configuration constants
- `import_map_json.py` - Python script to convert OpenStreetMap data to graph JSON format

## How to Use

### 1. **Open the Application**

```bash
# Simply open in a web browser
open index.html
```

### 2. **Select a City**

- Use the "City" dropdown to switch between pre-configured cities
- Currently available: City 1, City 2, City 3, Brasilia

### 3. **Add Custom City Maps**

Edit `js/datasetConfig.js` and add an entry to `CITY_DATASETS`:

```javascript
{
  key: "mymap",
  name: "My City",
  graphPath: "./mymap.json",
  labelsPath: "./mymap.json"  // if labels in same file
}
```

### 4. **Set Start & End Points**

- Select "Start position" or "End position" from the Tool dropdown
- Click on the map to place the point
- Map is interactive: drag to pan, scroll to zoom

### 5. **Run Pathfinding**

- **Step** - Execute one A\* iteration
- **Auto explore** - Run continuously until path found
- **Reset search** - Clear and start over

## Color Legend

| Color      | Meaning                                      |
| ---------- | -------------------------------------------- |
| **Yellow** | Start delivery point                         |
| **Purple** | End delivery point                           |
| **Green**  | Open set (frontier - nodes being considered) |
| **Red**    | Closed set (already explored nodes)          |
| **Blue**   | Final shortest path found                    |
| **Gray**   | Unvisited nodes                              |

## Graph JSON Format

Your graph JSON files should have this structure:

```json
{
  "nodes": [
    { "id": 1, "x": -47.8809, "y": -15.7933 },
    { "id": 2, "x": -47.8767, "y": -15.7947 }
  ],
  "edges": [
    { "u": 1, "v": 2, "length": 500.5 },
    { "u": 2, "v": 3, "length": 750.2 }
  ],
  "labels": [{ "text": "Store A", "x": -47.88, "y": -15.79 }]
}
```

- `nodes`: Array of intersection points (lat/lon coordinates)
- `edges`: Array of connections between nodes with street length
- `labels`: Optional location labels for the map

## Generating Your Own Maps

Use the included Python script to convert OpenStreetMap data to graph JSON:

```bash
python import_map_json.py
```

This fetches real road network data and converts it to the graph format.

## Technical Details

- **Algorithm**: A\* with Euclidean distance heuristic
- **Canvas Resolution**: 360x360 pixels (responsive scaling)
- **Movement**: 8-directional (including diagonals on road networks)
- **Projection**: Lat/Lon to screen space with automatic bounds fitting
- **Data Source**: OpenStreetMap (via Overpass API)

## Course Context

**Course**: Advanced Data Structures & Algorithms (ADSAA)  
**Project**: Delivery Optimizer - City Route Visualization  
**Focus**: A\* pathfinding algorithm visualization on real-world graph data

---

**Ready to pathfind?** Open `index.html` and start exploring!
