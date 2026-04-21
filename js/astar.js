export function dist(distanceMode, x1, y1, x2, y2) {
  if (distanceMode === 1) {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
  }
  return Math.hypot(x2 - x1, y2 - y1);
}

function buildPathFromEnd(nodeState, endId) {
  const path = [];
  let cursor = endId;
  let guard = 0;
  const maxGuard = nodeState.size * 4;
  while (guard++ < maxGuard) {
    path.push(cursor);
    const c = nodeState.get(cursor);
    if (!c || c.parentId === null) break;
    cursor = c.parentId;
  }
  path.reverse();
  return path;
}

export function resetSearchState(
  graph,
  startId,
  endId,
  distanceMode
) {
  const nodeState = new Map();
  for (const n of graph.nodes) {
    nodeState.set(n.id, {
      parentId: null,
      isOpen: false,
      isClosed: false,
      g: Infinity,
    });
  }
  const start = nodeState.get(startId);
  start.isOpen = true;
  start.g = 0;

  return {
    graph,
    startId,
    endId,
    distanceMode,
    nodeState,
    openSet: new Set([startId]),
    finished: false,
    success: false,
    path: null,
  };
}

export function aStarStep(state) {
  if (state.finished) {
    return { done: true, success: state.success, noOpen: false };
  }

  const { graph, endId, distanceMode, startId, nodeState, openSet } = state;

  if (startId === endId) {
    state.finished = true;
    state.success = true;
    state.path = [startId];
    return { done: true, success: true, noOpen: false };
  }

  const endNode = graph.nodesById.get(endId);
  let bestId = null;
  let bestCost = Infinity;
  for (const id of openSet) {
    const s = nodeState.get(id);
    const n = graph.nodesById.get(id);
    const nc = s.g + dist(distanceMode, n.x, n.y, endNode.x, endNode.y);
    if (nc <= bestCost) {
      bestCost = nc;
      bestId = id;
    }
  }

  if (bestId === null) {
    state.finished = true;
    state.success = false;
    return { done: true, success: false, noOpen: true };
  }

  if (bestId === endId) {
    const best = nodeState.get(bestId);
    best.isOpen = false;
    best.isClosed = true;
    openSet.delete(bestId);
    state.finished = true;
    state.success = true;
    state.path = buildPathFromEnd(nodeState, endId);
    return { done: true, success: true, noOpen: false };
  }

  const best = nodeState.get(bestId);
  best.isOpen = false;
  best.isClosed = true;
  openSet.delete(bestId);

  let reachedGoal = 0;
  const neighbors = graph.adj.get(bestId) || [];
  for (const edge of neighbors) {
    const nei = nodeState.get(edge.to);
    if (!nei || nei.isClosed) continue;

    const ng = best.g + edge.length;
    if (ng < nei.g || !nei.isOpen) {
      nei.parentId = bestId;
      nei.g = ng;
      nei.isOpen = true;
      nei.isClosed = false;
      openSet.add(edge.to);
    }

    if (edge.to === endId) {
      reachedGoal = 1;
    }
  }

  if (reachedGoal === 1) {
    state.finished = true;
    state.success = true;
    state.path = buildPathFromEnd(nodeState, endId);
    return { done: true, success: true, noOpen: false };
  }

  return { done: false, success: false, noOpen: false };
}
