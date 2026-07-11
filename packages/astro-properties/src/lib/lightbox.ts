export interface LightboxImage {
  src: string;
  alt: string;
}

export interface LightboxState {
  images: LightboxImage[];
  index: number;
  isOpen: boolean;
}

export function createLightboxState(images: LightboxImage[]): LightboxState {
  return { images, index: 0, isOpen: false };
}

export function openLightbox(
  state: LightboxState,
  index: number,
): LightboxState {
  if (state.images.length === 0) return state;
  const clamped = Math.min(Math.max(index, 0), state.images.length - 1);
  return { ...state, index: clamped, isOpen: true };
}

export function closeLightbox(state: LightboxState): LightboxState {
  return { ...state, isOpen: false };
}

/** Steps forward (`delta: 1`) or backward (`delta: -1`), wrapping around at either end. */
export function stepLightbox(
  state: LightboxState,
  delta: number,
): LightboxState {
  if (state.images.length === 0) return state;
  const index =
    (state.index + delta + state.images.length) % state.images.length;
  return { ...state, index };
}

export function currentLightboxImage(
  state: LightboxState,
): LightboxImage | undefined {
  return state.images[state.index];
}
