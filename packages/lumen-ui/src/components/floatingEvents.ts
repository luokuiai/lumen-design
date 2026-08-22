export const FLOATING_LAYER_OPEN_EVENT = 'lumen-floating-layer-open';

export const announceFloatingLayerOpen = (layerId: string) => {
  window.dispatchEvent(
    new CustomEvent(FLOATING_LAYER_OPEN_EVENT, { detail: layerId }),
  );
};
