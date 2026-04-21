function computeBounds(nodes) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  }
  return { minX, maxX, minY, maxY };
}

function projectNodes(nodes, bounds, canvasWidth, canvasHeight, padding) {
  const spanX = Math.max(1e-9, bounds.maxX - bounds.minX);
  const spanY = Math.max(1e-9, bounds.maxY - bounds.minY);
  const drawableW = Math.max(1, canvasWidth - 2 * padding);
  const drawableH = Math.max(1, canvasHeight - 2 * padding);
  const scale = Math.min(drawableW / spanX, drawableH / spanY);
  const offsetX = (canvasWidth - spanX * scale) / 2;
  const offsetY = (canvasHeight - spanY * scale) / 2;

  const projectedById = new Map();
  const projectedNodes = [];
  for (const n of nodes) {
    const sx = offsetX + (n.x - bounds.minX) * scale;
    const sy = canvasHeight - (offsetY + (n.y - bounds.minY) * scale);
    const p = { id: n.id, sx, sy };
    projectedById.set(n.id, p);
    projectedNodes.push(p);
  }
  return { projectedById, projectedNodes };
}

export async function loadGraphData(canvasWidth, canvasHeight) {
  const response = await fetch("./graph.json");
  if (!response.ok) {
    throw new Error(`Failed to load graph.json (${response.status})`);
  }

  const raw = await response.json();
  const nodes = Array.isArray(raw.nodes) ? raw.nodes : [];
  const edges = Array.isArray(raw.edges) ? raw.edges : [];
  if (nodes.length === 0) {
    throw new Error("graph.json has no nodes");
  }

  const nodesById = new Map();
  for (const n of nodes) {
    nodesById.set(n.id, n);
  }

  const adj = new Map();
  for (const n of nodes) {
    adj.set(n.id, []);
  }

  for (const e of edges) {
    if (!nodesById.has(e.u) || !nodesById.has(e.v)) continue;
    const length = Number.isFinite(e.length) ? e.length : 0;
    adj.get(e.u).push({ to: e.v, length });
  }

  const bounds = computeBounds(nodes);
  const { projectedById, projectedNodes } = projectNodes(
    nodes,
    bounds,
    canvasWidth,
    canvasHeight,
    18
  );

  return {
    nodes,
    edges,
    nodesById,
    adj,
    bounds,
    projectedById,
    projectedNodes,
    canvasWidth,
    canvasHeight,
  };
}
