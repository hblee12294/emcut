"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VideoEditorCore, VideoMetadata, Frame } from "@repo/video-editor-core";
import { Button } from "@repo/ui/button";
import { Slider } from "@repo/ui/slider";
import { Card } from "@repo/ui/card";
import { PlayIcon, PauseIcon } from "@radix-ui/react-icons";

interface VideoEditorProps {
  className?: string;
}

export function VideoEditor({ className }: VideoEditorProps) {
  const editorRef = useRef<VideoEditorCore | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    editorRef.current = new VideoEditorCore();
    editorRef.current.setPlaybackCallback((time) => {
      setCurrentTime(time);
    });

    if (videoRef.current) {
      editorRef.current.setPreviewElement(videoRef.current);
    }

    return () => {
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && editorRef.current) {
      editorRef.current.setPreviewElement(videoRef.current);
    }
  }, [videoRef.current]);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !editorRef.current) return;

      const videoMetadata = await editorRef.current.loadVideo(file);
      setMetadata(videoMetadata);

      if (videoRef.current) {
        const url = URL.createObjectURL(file);
        videoRef.current.src = url;
      }
    },
    []
  );

  const handleTimelineChange = useCallback(
    (value: number) => {
      if (!editorRef.current || !metadata) return;

      setCurrentTime(value);
      editorRef.current.seekTo(value);
    },
    [metadata]
  );

  const handlePlayPause = useCallback(() => {
    if (!editorRef.current || !metadata) return;

    editorRef.current.togglePlayPause();
    setIsPlaying(editorRef.current.getIsPlaying());
  }, [metadata]);

  const handleFrameExport = useCallback(async () => {
    if (!editorRef.current || !metadata) return;

    const frame = await editorRef.current.extractFrame(currentTime);
    const blob = await editorRef.current.exportFrame(frame);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `frame-${currentTime.toFixed(2)}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentTime, metadata]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Preview Section */}
      <Card className="p-4">
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            className="w-full h-full"
            onClick={handlePlayPause}
            playsInline
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      </Card>

      {/* Timeline Section */}
      <Card className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePlayPause}
            className="w-10 h-10"
          >
            {isPlaying ? (
              <PauseIcon className="w-4 h-4" />
            ) : (
              <PlayIcon className="w-4 h-4" />
            )}
          </Button>
          <div className="text-sm text-gray-500">
            {formatTime(currentTime)} / {formatTime(metadata?.duration || 0)}
          </div>
        </div>
        <Slider
          min={0}
          max={metadata?.duration || 0}
          step={1 / (metadata?.fps || 30)}
          value={currentTime}
          onValueChange={handleTimelineChange}
        />
      </Card>

      {/* Functions Section */}
      <Card className="p-4">
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => document.getElementById("video-upload")?.click()}
          >
            Upload Video
          </Button>
          <Button onClick={handleFrameExport}>Export Current Frame</Button>
        </div>
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </Card>
    </div>
  );
}
