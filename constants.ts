export const TIMELINE_ZOOM_DEFAULT = 20; // 20 pixels per second
export const TIMELINE_HEIGHT = 280;
export const HEADER_HEIGHT = 48;
export const SIDEBAR_WIDTH = 320;

export const DEFAULT_TRACKS = [
  { id: 'track-1', type: 'video', name: 'Video Track 1', isMuted: false, isHidden: false },
  { id: 'track-2', type: 'text', name: 'Text Overlay', isMuted: false, isHidden: false },
  { id: 'track-3', type: 'audio', name: 'Audio Track', isMuted: false, isHidden: false },
] as const;
