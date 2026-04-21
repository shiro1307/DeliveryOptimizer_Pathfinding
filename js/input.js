export function attachCanvasClick(canvas, getTool, onPlace) {
  function handler(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (event.clientX - rect.left) * scaleX;
    const py = (event.clientY - rect.top) * scaleY;
    if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) return;
    const tool = getTool();
    onPlace(tool, px, py);
  }
  canvas.addEventListener("click", handler);
  return function detach() {
    canvas.removeEventListener("click", handler);
  };
}
