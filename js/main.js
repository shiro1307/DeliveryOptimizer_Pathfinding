import { defaultDistanceMode } from "./config.js";
import { loadGraphData } from "./graphData.js";
import { loadLabelData } from "./labelData.js";
import { CITY_DATASETS, DEFAULT_CITY_KEY, getCityDataset } from "./datasetConfig.js";
import { resetSearchState, aStarStep } from "./astar.js";
import { drawGraph, drawError, canvasPixelSize } from "./render.js";
import { createCamera, attachGestures, screenToWorld } from "./gestureController.js";
import { wireUi, getSelectedTool } from "./ui.js";

const canvas = document.getElementById("grid-canvas");
const ctx = canvas.getContext("2d");
const toolSelect = document.getElementById("tool-select");
const citySelect = document.getElementById("city-select");
const btnStep = document.getElementById("btn-step");
const btnAuto = document.getElementById("btn-auto");
const btnReset = document.getElementById("btn-reset");

const size = canvasPixelSize();
canvas.width = size.width;
canvas.height = size.height;

let graph = null;
let labels = [];
let startId = null;
let endId = null;
let searchState = null;
let hoverScreen = null;
const camera = createCamera();

function setUiEnabled(enabled) {
  citySelect.disabled = !enabled;
  toolSelect.disabled = !enabled;
  btnStep.disabled = !enabled;
  btnAuto.disabled = !enabled;
  btnReset.disabled = !enabled;
}

function resetCamera() {
  camera.scale = 1;
  camera.tx = 0;
  camera.ty = 0;
}

function populateCities() {
  citySelect.innerHTML = "";
  for (const c of CITY_DATASETS) {
    const opt = document.createElement("option");
    opt.value = c.key;
    opt.textContent = c.name;
    citySelect.appendChild(opt);
  }
  citySelect.value = DEFAULT_CITY_KEY;
}

function redraw() {
  if (!graph || startId === null || endId === null || !searchState) return;
  drawGraph(ctx, graph, startId, endId, searchState, camera, labels, hoverScreen);
}

function syncSearchAfterMove() {
  searchState = resetSearchState(
    graph,
    startId,
    endId,
    defaultDistanceMode
  );
}

function findNearestNodeId(px, py) {
  const w = screenToWorld(camera, px, py);
  let bestId = null;
  let bestDist = Infinity;
  for (const n of graph.projectedNodes) {
    const dx = n.sx - w.x;
    const dy = n.sy - w.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestDist) {
      bestDist = d2;
      bestId = n.id;
    }
  }
  return bestId;
}

function handlePlace(tool, event) {
  const rect = canvas.getBoundingClientRect();
  const sx = (event.clientX - rect.left) * (canvas.width / rect.width);
  const sy = (event.clientY - rect.top) * (canvas.height / rect.height);
  const px = Math.max(0, Math.min(canvas.width, sx));
  const py = Math.max(0, Math.min(canvas.height, sy));
  const nodeId = findNearestNodeId(px, py);
  if (nodeId === null) return;

  if (tool === "start") {
    if (nodeId === endId) return;
    startId = nodeId;
  } else {
    if (nodeId === startId) return;
    endId = nodeId;
  }
  redraw();
}

wireUi(toolSelect, citySelect, btnStep, btnAuto, btnReset, {
  onCityChange() {
    initCity(citySelect.value);
  },
  onStep() {
    if (!searchState) return;
    if (searchState.finished) {
      return;
    }
    aStarStep(searchState);
    redraw();
  },
  onAuto() {
    if (!searchState) return;
    syncSearchAfterMove();
    redraw();
    function tick() {
      if (searchState.finished) {
        redraw();
        return;
      }
      aStarStep(searchState);
      redraw();
      if (!searchState.finished) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  },
  onReset() {
    if (!searchState) return;
    syncSearchAfterMove();
    redraw();
  },
});

attachGestures(canvas, camera, {
  onCameraChange() {
    redraw();
  },
  onTap(event) {
    handlePlace(getSelectedTool(toolSelect), event);
  },
  onHover(event) {
    const rect = canvas.getBoundingClientRect();
    hoverScreen = {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
    redraw();
  },
  onLeave() {
    hoverScreen = null;
    redraw();
  },
});

async function initCity(cityKey) {
  setUiEnabled(false);
  try {
    const dataset = getCityDataset(cityKey);
    const [nextGraph, nextLabels] = await Promise.all([
      loadGraphData(dataset.graphPath, size.width, size.height),
      loadLabelData(dataset.labelsPath),
    ]);
    graph = nextGraph;
    labels = Array.isArray(graph.labels) && graph.labels.length > 0
      ? graph.labels
      : nextLabels.labels;
    if (graph.nodes.length < 2) {
      throw new Error("Need at least two nodes to run A*");
    }

    startId = graph.nodes[0].id;
    endId = graph.nodes[graph.nodes.length - 1].id;
    if (startId === endId) {
      endId = graph.nodes[1].id;
    }
    resetCamera();
    syncSearchAfterMove();
    redraw();
    setUiEnabled(true);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to initialize graph";
    drawError(ctx, message);
    setUiEnabled(false);
  }
}

function init() {
  populateCities();
  initCity(citySelect.value);
}

init();
