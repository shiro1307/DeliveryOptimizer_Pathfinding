function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

export function createCamera() {
  return {
    scale: 1,
    tx: 0,
    ty: 0,
    minScale: 0.6,
    maxScale: 8,
  };
}

export function screenToWorld(camera, sx, sy) {
  return {
    x: (sx - camera.tx) / camera.scale,
    y: (sy - camera.ty) / camera.scale,
  };
}

export function attachGestures(canvas, camera, callbacks) {
  const pointers = new Map();
  let dragStartX = 0;
  let dragStartY = 0;
  let moved = false;
  let pinchStartDistance = 0;
  let pinchStartScale = 1;

  function zoomAround(sx, sy, factor) {
    const nextScale = clamp(camera.scale * factor, camera.minScale, camera.maxScale);
    const worldX = (sx - camera.tx) / camera.scale;
    const worldY = (sy - camera.ty) / camera.scale;
    camera.scale = nextScale;
    camera.tx = sx - worldX * camera.scale;
    camera.ty = sy - worldY * camera.scale;
    callbacks.onCameraChange();
  }

  function onWheel(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const sx = event.clientX - rect.left;
    const sy = event.clientY - rect.top;
    const factor = event.deltaY < 0 ? 1.1 : 0.9;
    zoomAround(sx, sy, factor);
  }

  function onPointerDown(event) {
    canvas.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    moved = false;

    if (pointers.size === 2) {
      const pts = [...pointers.values()];
      const dx = pts[1].x - pts[0].x;
      const dy = pts[1].y - pts[0].y;
      pinchStartDistance = Math.hypot(dx, dy);
      pinchStartScale = camera.scale;
    }
  }

  function onPointerMove(event) {
    callbacks.onHover(event);
    if (!pointers.has(event.pointerId)) return;
    const prev = pointers.get(event.pointerId);
    const dx = event.clientX - prev.x;
    const dy = event.clientY - prev.y;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size >= 2) {
      const pts = [...pointers.values()];
      const cx = (pts[0].x + pts[1].x) * 0.5;
      const cy = (pts[0].y + pts[1].y) * 0.5;
      const pdx = pts[1].x - pts[0].x;
      const pdy = pts[1].y - pts[0].y;
      const dist = Math.hypot(pdx, pdy);
      if (pinchStartDistance > 0 && dist > 0) {
        const rect = canvas.getBoundingClientRect();
        const sx = cx - rect.left;
        const sy = cy - rect.top;
        const targetScale = clamp(
          pinchStartScale * (dist / pinchStartDistance),
          camera.minScale,
          camera.maxScale
        );
        const worldX = (sx - camera.tx) / camera.scale;
        const worldY = (sy - camera.ty) / camera.scale;
        camera.scale = targetScale;
        camera.tx = sx - worldX * camera.scale;
        camera.ty = sy - worldY * camera.scale;
        callbacks.onCameraChange();
      }
      return;
    }

    if (Math.hypot(event.clientX - dragStartX, event.clientY - dragStartY) > 6) {
      moved = true;
    }
    camera.tx += dx;
    camera.ty += dy;
    callbacks.onCameraChange();
  }

  function onPointerUp(event) {
    if (!moved && pointers.size === 1) {
      callbacks.onTap(event);
    }
    pointers.delete(event.pointerId);
    if (pointers.size < 2) {
      pinchStartDistance = 0;
    }
  }

  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", callbacks.onLeave);

  return function detach() {
    canvas.removeEventListener("wheel", onWheel);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    canvas.removeEventListener("pointerleave", callbacks.onLeave);
  };
}
