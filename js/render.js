import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./config.js";

const COLOR_BG = "#ffffff";
const COLOR_EDGE = "#000000";
const COLOR_CLOSED = "#e03030";
const COLOR_OPEN = "#30a030";
const COLOR_PATH = "#2060c0";
const COLOR_START = "#f0d000";
const COLOR_END = "#8040c0";
const COLOR_NODE = "#ffffff";
const COLOR_BORDER = "#000000";

function drawNodeCircle(ctx, px, py, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawPathPolyline(ctx, graph, path) {
  if (!path || path.length < 2) return;
  ctx.strokeStyle = COLOR_PATH;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i < path.length; i++) {
    const p = graph.projectedById.get(path[i]);
    if (!p) continue;
    if (i === 0) ctx.moveTo(p.sx, p.sy);
    else ctx.lineTo(p.sx, p.sy);
  }
  ctx.stroke();
}

export function drawGraph(ctx, graph, startId, endId, searchState) {
  ctx.clearRect(0, 0, graph.canvasWidth, graph.canvasHeight);
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, graph.canvasWidth, graph.canvasHeight);

  ctx.strokeStyle = COLOR_EDGE;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.35;
  for (const e of graph.edges) {
    const a = graph.projectedById.get(e.u);
    const b = graph.projectedById.get(e.v);
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const nodeState = searchState?.nodeState;
  if (nodeState) {
    for (const p of graph.projectedNodes) {
      if (p.id === startId || p.id === endId) continue;
      const s = nodeState.get(p.id);
      if (!s || !s.isClosed) continue;
      drawNodeCircle(ctx, p.sx, p.sy, 2.2, COLOR_CLOSED);
    }
  }

  if (nodeState) {
    for (const p of graph.projectedNodes) {
      if (p.id === startId || p.id === endId) continue;
      const s = nodeState.get(p.id);
      if (!s || !s.isOpen || s.isClosed) continue;
      drawNodeCircle(ctx, p.sx, p.sy, 2.2, COLOR_OPEN);
    }
  }

  drawPathPolyline(ctx, graph, searchState?.path);

  for (const p of graph.projectedNodes) {
    if (p.id === startId || p.id === endId) continue;
    drawNodeCircle(ctx, p.sx, p.sy, 1.3, COLOR_NODE);
  }

  const sp = graph.projectedById.get(startId);
  if (sp) drawNodeCircle(ctx, sp.sx, sp.sy, 4, COLOR_START);
  const ep = graph.projectedById.get(endId);
  if (ep) drawNodeCircle(ctx, ep.sx, ep.sy, 4, COLOR_END);

  ctx.strokeStyle = COLOR_BORDER;
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, graph.canvasWidth - 1, graph.canvasHeight - 1);
}

export function drawError(ctx, message) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = "#a00000";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(message, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}

export function canvasPixelSize() {
  return { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
}
