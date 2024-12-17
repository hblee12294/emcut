export interface Frame {
  timestamp: number;
  imageData: ImageData;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
}

export interface TimelineClip {
  id: string;
  startTime: number;
  endTime: number;
  source: string;
  type: "video" | "audio" | "image";
}

export class EditorCore {
  private videoElement: HTMLVideoElement;
  private previewElement: HTMLVideoElement | null = null;
  private canvas: OffscreenCanvas;
  private context: OffscreenCanvasRenderingContext2D;
  private metadata: VideoMetadata | null = null;
  private timeline: TimelineClip[] = [];
  private isPlaying: boolean = false;
  private playbackCallback: ((currentTime: number) => void) | null = null;

  constructor() {
    this.videoElement = document.createElement("video");
    this.canvas = new OffscreenCanvas(1, 1);
    this.context = this.canvas.getContext(
      "2d"
    ) as OffscreenCanvasRenderingContext2D;

    // Setup video event listeners
    this.videoElement.addEventListener("timeupdate", () => {
      this.playbackCallback?.(this.videoElement.currentTime);
    });

    this.videoElement.addEventListener("ended", () => {
      this.isPlaying = false;
      this.playbackCallback?.(this.videoElement.currentTime);
      this.previewElement?.pause();
    });
  }

  setPreviewElement(element: HTMLVideoElement) {
    this.previewElement = element;
    // Sync the preview with the source video
    this.previewElement.src = this.videoElement.src;
  }

  setPlaybackCallback(callback: (currentTime: number) => void) {
    this.playbackCallback = callback;
  }

  play() {
    if (!this.metadata) return;
    this.isPlaying = true;
    this.videoElement.play();
    this.previewElement?.play();
  }

  pause() {
    this.isPlaying = false;
    this.videoElement.pause();
    this.previewElement?.pause();
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getDuration(): number {
    return this.metadata?.duration || 0;
  }

  getCurrentTime(): number {
    return this.videoElement.currentTime;
  }

  async loadVideo(file: File): Promise<VideoMetadata> {
    const url = URL.createObjectURL(file);

    return new Promise((resolve, reject) => {
      this.videoElement.src = url;
      if (this.previewElement) {
        this.previewElement.src = url;
      }

      this.videoElement.onloadedmetadata = () => {
        this.metadata = {
          duration: this.videoElement.duration,
          width: this.videoElement.videoWidth,
          height: this.videoElement.videoHeight,
          fps: 30, // Default FPS, could be detected from video
        };

        this.canvas.width = this.metadata.width;
        this.canvas.height = this.metadata.height;

        resolve(this.metadata);
      };

      this.videoElement.onerror = reject;
    });
  }

  async extractFrame(timestamp: number): Promise<Frame> {
    if (!this.metadata) throw new Error("No video loaded");

    this.videoElement.currentTime = timestamp;

    return new Promise((resolve) => {
      this.videoElement.onseeked = () => {
        this.context.drawImage(this.videoElement, 0, 0);
        const imageData = this.context.getImageData(
          0,
          0,
          this.metadata!.width,
          this.metadata!.height
        );

        resolve({
          timestamp,
          imageData,
        });
      };
    });
  }

  async exportFrame(frame: Frame): Promise<Blob> {
    const canvas = new OffscreenCanvas(
      frame.imageData.width,
      frame.imageData.height
    );
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    ctx.putImageData(frame.imageData, 0, 0);
    return canvas.convertToBlob({ type: "image/png" });
  }

  seekTo(timestamp: number): void {
    if (this.videoElement) {
      this.videoElement.currentTime = timestamp;
      if (this.previewElement) {
        this.previewElement.currentTime = timestamp;
      }
    }
  }

  addClip(clip: Omit<TimelineClip, "id">): string {
    const id = crypto.randomUUID();
    this.timeline.push({ ...clip, id });
    return id;
  }

  removeClip(id: string): void {
    this.timeline = this.timeline.filter((clip) => clip.id !== id);
  }

  getTimeline(): TimelineClip[] {
    return [...this.timeline];
  }

  getCurrentFrame(): ImageData | null {
    if (!this.metadata) return null;

    this.context.drawImage(this.videoElement, 0, 0);
    return this.context.getImageData(
      0,
      0,
      this.metadata.width,
      this.metadata.height
    );
  }
}
