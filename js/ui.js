export function getSelectedTool(selectEl) {
  return selectEl.value;
}

export function wireUi(selectEl, btnStep, btnAuto, btnReset, handlers) {
  btnStep.addEventListener("click", handlers.onStep);
  btnAuto.addEventListener("click", handlers.onAuto);
  btnReset.addEventListener("click", handlers.onReset);
}
