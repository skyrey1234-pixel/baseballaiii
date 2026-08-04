import React, { useRef, useState, useEffect } from "react";
import { Film, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const toSeconds = (s) => {
  if (!s) return 0;
  const parts = String(s).split(":").map((n) => parseInt(n, 10) || 0);
  return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0];
};

export const toClock = (sec) => {
  const s = Math.max(0, Math.round(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function ClipViewer({ evidence }) {
  const ref = useRef(null);
  const start = Math.round(evidence?.timestamp_sec || 0);
  // Bumping the nonce remounts the player so it re-seeks to the exact moment.
  const [nonce, setNonce] = useState(0);

  // When the saved timestamp changes, seek the uploaded video immediately.
  useEffect(() => {
    if (ref.current) ref.current.currentTime = start;
  }, [start]);

  if (!evidence?.video_url && !evidence?.youtube_id) {
    return (
      <div className="aspect-video rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-slate-600">
        <Film className="w-5 h-5" />
        <p className="text-xs">No clip linked yet</p>
      </div>
    );
  }

  const jump = () => {
    if (evidence.youtube_id) {
      setNonce((n) => n + 1);
    } else if (ref.current) {
      ref.current.currentTime = start;
      ref.current.play();
    }
  };

  return (
    <div className="space-y-2">
      <div className="aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
        {evidence.youtube_id ? (
          <iframe
            key={`${start}-${nonce}`}
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${evidence.youtube_id}?start=${start}${nonce > 0 ? "&autoplay=1" : ""}`}
            title={evidence.film_title || "Game clip"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={ref}
            key={start}
            src={`${evidence.video_url}#t=${start}`}
            controls
            preload="metadata"
            className="w-full h-full"
            onLoadedMetadata={() => { if (ref.current) ref.current.currentTime = start; }}
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500 min-w-0 truncate">
          {evidence.film_title}
          {evidence.note ? ` — ${evidence.note}` : ""}
        </p>
        <Button size="sm" variant="outline" onClick={jump}
          className="h-7 px-2.5 shrink-0 text-[11px] border-cyan-400/30 bg-cyan-400/[0.06] text-cyan-200 hover:bg-cyan-400/15 hover:text-cyan-100">
          <MapPin className="w-3 h-3 mr-1.5" />
          Jump to {toClock(start)}
        </Button>
      </div>
    </div>
  );
}