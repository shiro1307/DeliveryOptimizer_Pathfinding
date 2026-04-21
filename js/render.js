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
const COLOR_LABEL = "#202020";

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

function drawBubble(ctx, x, y, text, bg, fg, isHovered) {
  ctx.font = "12px sans-serif";
  const w = ctx.measureText(text).width + 18;
  const h = 22;
  const bx = x + 8;
  const by = y - 34;
  ctx.globalAlpha = isHovered ? 0.45 : 1;
  ctx.fillStyle = bg;
  ctx.fillRect(bx, by, w, h);
  ctx.globalAlpha = 1;
  ctx.fillStyle = fg;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, bx + 9, by + h * 0.5);
  return { x: bx, y: by, w, h };
}

function bubbleContains(rect, hover) {
  if (!rect || !hover) return false;
  return (
    hover.x >= rect.x &&
    hover.x <= rect.x + rect.w &&
    hover.y >= rect.y &&
    hover.y <= rect.y + rect.h
  );
}

function drawPlaceLabels(ctx, graph, labels, camera) {
  if (!labels || labels.length === 0) return;
  
  // Compute alpha fades based on camera.scale
  // Places fade in from 0.3 to 0.7 (staying visible much longer when zoomed out)
  const placeAlpha = Math.min(1, Math.max(0, (camera.scale - 0.3) / (0.6 - 0.3)));
  // POIs fade in from 1.2 to 2.2
  const poiAlpha = Math.min(1, Math.max(0, (camera.scale - 1.2) / (2.2 - 1.2)));

  if (placeAlpha <= 0 && poiAlpha <= 0) return;

  const sorted = [...labels].sort((a, b) => {
    const ak = a.kind === "place" ? 0 : 1;
    const bk = b.kind === "place" ? 0 : 1;
    if (ak !== bk) return ak - bk;
    return String(a.name).localeCompare(String(b.name));
  });

  // Dynamically limit the rendering count to declutter when zoomed out
  const maxPlaces = Math.max(5, Math.floor(10 + (camera.scale - 0.3) * 60));
  const maxPois = Math.max(0, Math.floor((camera.scale - 0.8) * 80));

  let placesDrawn = 0;
  let poisDrawn = 0;

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  for (let i = 0; i < sorted.length; i++) {
    const l = sorted[i];
    if (!l || !l.name) continue;

    let targetAlpha = 0;
    if (l.kind === "place") {
      if (placesDrawn >= maxPlaces) continue;
      targetAlpha = placeAlpha;
      placesDrawn++;
      ctx.font = "bold 12px sans-serif";
    } else {
      if (poisDrawn >= maxPois) continue;
      targetAlpha = poiAlpha;
      poisDrawn++;
      ctx.font = "11px sans-serif";
    }

    if (targetAlpha <= 0) continue;

    const wx = graph.project.offsetX + (l.x - graph.bounds.minX) * graph.project.scale;
    const wyRaw = graph.project.offsetY + (l.y - graph.bounds.minY) * graph.project.scale;
    const wy = graph.canvasHeight - wyRaw;

    // Convert world coordinates to screen coordinates
    const sx = wx * camera.scale + camera.tx;
    const sy = wy * camera.scale + camera.ty;

    ctx.globalAlpha = targetAlpha;
    
    // Draw background bubble
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    const metrics = ctx.measureText(l.name);
    // Add small padding for bold vs normal
    const pad = l.kind === "place" ? 8 : 6;
    ctx.fillRect(sx + 2, sy - 7, metrics.width + pad, 14);

    // Draw text
    ctx.fillStyle = COLOR_LABEL;
    ctx.fillText(l.name, sx + 5, sy);
  }
  
  // reset alpha
  ctx.globalAlpha = 1;
}

export function drawGraph(ctx, graph, startId, endId, searchState, camera, labels, hoverScreen) {
  ctx.clearRect(0, 0, graph.canvasWidth, graph.canvasHeight);
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, graph.canvasWidth, graph.canvasHeight);

  ctx.save();
  ctx.setTransform(camera.scale, 0, 0, camera.scale, camera.tx, camera.ty);

  ctx.strokeStyle = COLOR_EDGE;
  ctx.lineWidth = 1.8 / camera.scale;
  ctx.globalAlpha = 0.4;
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
  for (const p of graph.projectedNodes) {
    if (p.id === startId || p.id === endId) continue;
    
    const s = nodeState?.get(p.id);
    let color = "rgba(0, 0, 0, 0.4)"; // Normal node matches edge gray
    let radius = 2.1 / camera.scale;

    if (s && s.isClosed) {
      color = COLOR_CLOSED;
      radius = 3.4 / camera.scale;
    } else if (s && s.isOpen) {
      color = COLOR_OPEN;
      radius = 3.4 / camera.scale;
    }

    drawNodeCircle(ctx, p.sx, p.sy, radius, color);
  }

  drawPathPolyline(ctx, graph, searchState?.path);

  const sp = graph.projectedById.get(startId);
  if (sp) drawNodeCircle(ctx, sp.sx, sp.sy, 5.5 / camera.scale, COLOR_START);
  const ep = graph.projectedById.get(endId);
  if (ep) drawNodeCircle(ctx, ep.sx, ep.sy, 5.5 / camera.scale, COLOR_END);

  ctx.restore();

  drawPlaceLabels(ctx, graph, labels, camera);

  let startBubble = null;
  let endBubble = null;
  if (sp) {
    const sx = sp.sx * camera.scale + camera.tx;
    const sy = sp.sy * camera.scale + camera.ty;
    startBubble = drawBubble(ctx, sx, sy, "Start", COLOR_START, "#000000", false);
  }
  if (ep) {
    const ex = ep.sx * camera.scale + camera.tx;
    const ey = ep.sy * camera.scale + camera.ty;
    endBubble = drawBubble(ctx, ex, ey, "End", COLOR_END, "#ffffff", false);
  }

  if (startBubble || endBubble) {
    if (startBubble) {
      drawBubble(
        ctx,
        sp.sx * camera.scale + camera.tx,
        sp.sy * camera.scale + camera.ty,
        "Start",
        COLOR_START,
        "#000000",
        bubbleContains(startBubble, hoverScreen)
      );
    }
    if (endBubble) {
      drawBubble(
        ctx,
        ep.sx * camera.scale + camera.tx,
        ep.sy * camera.scale + camera.ty,
        "End",
        COLOR_END,
        "#ffffff",
        bubbleContains(endBubble, hoverScreen)
      );
    }
  }

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
