import React, { useRef } from "react";
import { Film } from "lucide-react";

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
  if (!evidence?.video_url && !evidence?.youtube_id) {
    return (
      <div className="aspect-video rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-slate-600">
        <Film className="w-5 h-5" />
        <p className="text-xs">No clip linked yet</p>
      </div>
    );
  }

  const start = evidence.timestamp_sec || 0;

  return (
    <div className="space-y-2">
      <div className="aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
        {evidence.youtube_id ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${evidence.youtube_id}?start=${start}`}
            title={evidence.film_title || "Game clip"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={ref}
            src={evidence.video_url}
            controls
            className="w-full h-full"
            onLoadedMetadata={() => { if (ref.current) ref.current.currentTime = start; }}
          />
        )}
      </div>
      <p className="text-[11px] text-slate-500">
        {evidence.film_title} · starts at {toClock(start)}
        {evidence.note ? ` — ${evidence.note}` : ""}
      </p>
    </div>
  );
}