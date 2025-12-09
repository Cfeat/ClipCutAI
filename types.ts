export enum ClipType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  AUDIO = 'AUDIO'
}

export interface Clip {
  id: string;
  trackId: string;
  type: ClipType;
  src?: string; // For video/image/audio
  content?: string; // For text
  name: string;
  startTime: number; // In seconds relative to timeline start
  duration: number; // In seconds
  offset: number; // Start offset within the source media (trimming)
  properties: {
    x: number;
    y: number;
    scale: number;
    opacity: number;
    rotation: number;
  };
}

export interface Track {
  id: string;
  type: 'video' | 'audio' | 'text';
  name: string;
  isMuted: boolean;
  isHidden: boolean;
}

export interface ProjectState {
  tracks: Track[];
  clips: Clip[];
  duration: number; // Total project duration in seconds
  currentTime: number; // Playhead position
  isPlaying: boolean;
  selectedClipId: string | null;
  zoom: number; // Pixels per second
}

export interface Asset {
  id: string;
  type: 'video' | 'image';
  url: string;
  name: string;
}
