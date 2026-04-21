export function getSelectedTool(selectEl) {
  return selectEl.value;
}

export function wireUi(selectEl, citySelect, btnStep, btnAuto, btnReset, handlers) {
  citySelect.addEventListener("change", handlers.onCityChange);
  btnStep.addEventListener("click", handlers.onStep);
  btnAuto.addEventListener("click", handlers.onAuto);
  btnReset.addEventListener("click", handlers.onReset);
}
