import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, CheckCircle2 } from "lucide-react";
import ClipViewer, { toSeconds, toClock } from "@/components/evidence/ClipViewer";
import DemoVideo from "@/components/evidence/DemoVideo";

const cls = "bg-[#0C1220] border-white/10 text-slate-200 placeholder:text-slate-600 h-9";

export default function EvidenceDemo({ entityName, record, subject, fix }) {
  const qc = useQueryClient();
  const { data: films } = useQuery({ queryKey: ["films"], queryFn: () => base44.entities.GameFilm.list("-created_date", 30) });

  const ev = record.evidence || {};
  const [filmId, setFilmId] = useState(ev.film_id || "");
  const [stamp, setStamp] = useState(ev.timestamp_sec ? toClock(ev.timestamp_sec) : "");
  const [note, setNote] = useState(ev.note || "");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const refresh = () => qc.invalidateQueries();

  const saveClip = async () => {
    const film = (films || []).find((f) => f.id === filmId);
    if (!film) return;
    setSaving(true);
    setError("");
    try {
      await base44.entities[entityName].update(record.id, {
        evidence: {
          film_id: film.id,
          film_title: film.title,
          video_url: film.video_url,
          youtube_id: film.youtube_id || "",
          timestamp_sec: toSeconds(stamp),
          note,
        },
      });
      refresh();
    } catch (e) {
      setError("Could not save the clip. Please try again.");
    }
    setSaving(false);
  };

  const generate = async () => {
    setGenerating(true);
    setError("");
    try {
      const { url } = await base44.integrations.Core.GenerateVideo({
        prompt: `Photorealistic slow-motion baseball instructional footage on a sunlit field, locked-off broadcast side angle, shallow depth of field, no text or graphics overlaid.

Show the CORRECT execution: ${fix}

Context: ${subject}. The athlete performs the movement cleanly and repeatably, exactly as a coach would want it modeled. Natural body mechanics, correct sequencing, realistic ball flight.`,
      });
      await base44.entities[entityName].update(record.id, { demo_video_url: url });
      refresh();
    } catch (e) {
      setError("The demonstration could not be generated. Please try again.");
    }
    setGenerating(false);
  };

  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-300" />
            <p className="text-[10px] uppercase tracking-widest text-cyan-300">Where it happened</p>
          </div>
          <ClipViewer evidence={ev} />
          <div className="flex gap-2">
            <Select value={filmId} onValueChange={setFilmId}>
              <SelectTrigger className={cls + " flex-1"}><SelectValue placeholder="Link game film" /></SelectTrigger>
              <SelectContent>
                {(films || []).map((f) => <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input value={stamp} onChange={(e) => setStamp(e.target.value)} placeholder="1:24" className={cls + " w-20"} />
            <Button size="sm" onClick={saveClip} disabled={saving || !filmId} className="h-9 bg-cyan-400/90 hover:bg-cyan-300 text-[#04121A] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What to look for at that timestamp" className={cls} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <p className="text-[10px] uppercase tracking-widest text-emerald-300">What right looks like</p>
          </div>
          <DemoVideo url={record.demo_video_url} onGenerate={generate} generating={generating} disabled={!fix} />
          {fix && <p className="text-[11px] text-slate-500">Modeling: {fix}</p>}
        </div>
      </div>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  );
}