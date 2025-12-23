
export interface StoryParagraph {
  id: number;
  text: string;
}

export enum PlaybackStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
}
