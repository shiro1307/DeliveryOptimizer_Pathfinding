import { defaultDistanceMode } from "./config.js";
import { loadGraphData } from "./graphData.js";
import { resetSearchState, aStarStep } from "./astar.js";
import { drawGraph, drawError, canvasPixelSize } from "./render.js";
import { attachCanvasClick } from "./input.js";
import { wireUi, getSelectedTool } from "./ui.js";

const canvas = document.getElementById("grid-canvas");
const ctx = canvas.getContext("2d");
const toolSelect = document.getElementById("tool-select");
const btnStep = document.getElementById("btn-step");
const btnAuto = document.getElementById("btn-auto");
const btnReset = document.getElementById("btn-reset");

const size = canvasPixelSize();
canvas.width = size.width;
canvas.height = size.height;

let graph = null;
let startId = null;
let endId = null;
let searchState = null;

function redraw() {
  if (!graph || startId === null || endId === null || !searchState) return;
  drawGraph(ctx, graph, startId, endId, searchState);
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
  let bestId = null;
  let bestDist = Infinity;
  for (const n of graph.projectedNodes) {
    const dx = n.sx - px;
    const dy = n.sy - py;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestDist) {
      bestDist = d2;
      bestId = n.id;
    }
  }
  return bestId;
}

function handlePlace(tool, px, py) {
  const nodeId = findNearestNodeId(px, py);
  if (nodeId === null) return;

  if (tool === "start") {
    if (nodeId === endId) return;
    startId = nodeId;
  } else {
    if (nodeId === startId) return;
    endId = nodeId;
  }
  syncSearchAfterMove();
  redraw();
}

attachCanvasClick(
  canvas,
  () => getSelectedTool(toolSelect),
  handlePlace
);

wireUi(toolSelect, btnStep, btnAuto, btnReset, {
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

async function init() {
  try {
    graph = await loadGraphData(size.width, size.height);
    if (graph.nodes.length < 2) {
      throw new Error("Need at least two nodes to run A*");
    }

    startId = graph.nodes[0].id;
    endId = graph.nodes[graph.nodes.length - 1].id;
    if (startId === endId) {
      endId = graph.nodes[1].id;
    }
    syncSearchAfterMove();
    redraw();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to initialize graph";
    drawError(ctx, message);
    btnStep.disabled = true;
    btnAuto.disabled = true;
    btnReset.disabled = true;
    toolSelect.disabled = true;
  }
}

init();
