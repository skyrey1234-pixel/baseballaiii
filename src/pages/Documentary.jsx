import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Clapperboard, Trash2, Sparkles, CameraOff } from "lucide-react";
import ChapterCard from "@/components/story/ChapterCard";

const cls = "bg-[#141C31] border-white/10 text-slate-100 placeholder:text-slate-500";
const CUTS = [
  ["team_documentary", "Team documentary"],
  ["player_film", "Individual player film"],
  ["recruiting_video", "Recruiting video"],
  ["social_clips", "Social clips"],
  ["senior_tribute", "Senior tribute"],
];

export default function Documentary() {
  const qc = useQueryClient();
  const { data: players } = useQuery({ queryKey: ["players"], queryFn: () => base44.entities.Player.list("readiness", 100) });
  const { data: films } = useQuery({ queryKey: ["films"], queryFn: () => base44.entities.GameFilm.list("-created_date", 30) });
  const { data: games } = useQuery({ queryKey: ["allGames"], queryFn: () => base44.entities.Game.list("-created_date", 30) });
  const { data: stories } = useQuery({ queryKey: ["stories"], queryFn: () => base44.entities.SeasonStory.list("-created_date", 10) });

  const [form, setForm] = useState({ cut_type: "team_documentary", subject: "", season: "2026", moments: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const story = (stories || []).find((s) => s.id === activeId) || stories?.[0];

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const filmList = (films || []).map((f) => `"${f.title}"${f.notes ? ` — ${f.notes}` : ""}`).join("; ") || "none logged";
      const gameList = (games || []).map((g) => `vs ${g.opponent} (${g.our_score}-${g.their_score}, ${g.status})`).join("; ") || "none logged";
      const roster = (players || []).slice(0, 20).map((p) => `${p.name} (${p.position}${p.key_stat ? `, ${p.key_stat}` : ""})`).join("; ");

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are DiamondMind AI turning a real season into an edit-ready film.

Cut type: ${CUTS.find(([v]) => v === form.cut_type)[1]}.
Subject: ${form.subject || "the team"}. Season: ${form.season}.
Games on record: ${gameList}.
Film on record: ${filmList}.
Roster: ${roster || "not logged"}.
Moments the coach wants included: ${form.moments || "none specified"}.

Write a title, a one-sentence logline, a target runtime appropriate for this cut type, and 4-6 chapters. Each chapter needs a title, the story beat it delivers, narration voiceover written to be read aloud, a shot list of 3-5 specific shots, and a music direction.

Ground every shot in footage or moments that actually exist in the records above. When a needed shot does not exist yet, do NOT pretend it does — list it under missing_footage so the team can go capture it. Also list the standout highlight_moments worth cutting first.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" }, logline: { type: "string" }, runtime: { type: "string" },
            chapters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" }, beat: { type: "string" }, narration: { type: "string" },
                  footage: { type: "array", items: { type: "string" } }, music: { type: "string" },
                },
              },
            },
            highlight_moments: { type: "array", items: { type: "string" } },
            missing_footage: { type: "array", items: { type: "string" } },
          },
        },
      });
      const created = await base44.entities.SeasonStory.create({ ...res, cut_type: form.cut_type, subject: form.subject, season: form.season });
      await qc.invalidateQueries({ queryKey: ["stories"] });
      setActiveId(created.id);
    } catch (e) {
      setError("The connection dropped while writing the film. Please try again.");
    }
    setLoading(false);
  };

  const remove = async (s) => {
    await base44.entities.SeasonStory.delete(s.id);
    setActiveId(null);
    qc.invalidateQueries({ queryKey: ["stories"] });
  };

  return (
    <div className="p-5 md:p-10 max-w-5xl mx-auto space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.3em] uppercase text-indigo-300 mb-2">Season Documentary</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-rose-200 bg-clip-text text-transparent">
          Turn the season into a film.
        </h1>
      </header>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1B1740] to-[#121828] p-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Cut</label>
            <Select value={form.cut_type} onValueChange={set("cut_type")}>
              <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
              <SelectContent>{CUTS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Subject</label>
            <Input value={form.subject} onChange={(e) => set("subject")(e.target.value)} placeholder="Player or team name" className={cls} />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Season</label>
            <Input value={form.season} onChange={(e) => set("season")(e.target.value)} className={cls} />
          </div>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Moments that have to be in it</label>
          <Textarea rows={3} value={form.moments} onChange={(e) => set("moments")(e.target.value)}
            placeholder="Walk-off in the district final, the losing streak in April, senior night…" className={cls + " resize-none"} />
        </div>
        <Button onClick={generate} disabled={loading}
          className="w-full h-11 font-semibold text-[#160B24] bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-rose-300 hover:opacity-90">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Writing the film…</> : <><Clapperboard className="w-4 h-4 mr-2" /> Build the documentary</>}
        </Button>
      </div>

      {error && <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-5 text-sm text-rose-200">{error}</div>}

      {stories?.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {stories.map((s) => (
            <button key={s.id} onClick={() => setActiveId(s.id)}
              className={`text-xs px-3.5 py-2 rounded-full border transition-colors ${s.id === story?.id ? "border-fuchsia-300/50 bg-fuchsia-400/15 text-fuchsia-200" : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"}`}>
              {s.title}
            </button>
          ))}
        </div>
      )}

      {story && !loading && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-fuchsia-400/25 bg-gradient-to-br from-[#241844] to-[#141A2E] p-6 flex items-start gap-4">
            <Sparkles className="w-5 h-5 text-fuchsia-300 shrink-0 mt-1" />
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-white">{story.title}</h2>
              <p className="text-sm text-slate-300 mt-1.5">{story.logline}</p>
              <p className="text-[11px] uppercase tracking-widest text-slate-500 mt-2">{story.runtime} · {story.season}</p>
            </div>
            <button onClick={() => remove(story)} className="ml-auto text-slate-600 hover:text-rose-400 transition-colors shrink-0" aria-label="Delete story">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {(story.chapters || []).map((c, i) => <ChapterCard key={i} chapter={c} index={i} />)}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {story.highlight_moments?.length > 0 && (
              <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-5">
                <p className="text-[10px] uppercase tracking-widest text-emerald-300 mb-2.5">Cut these first</p>
                <ul className="space-y-1.5">{story.highlight_moments.map((m, i) => <li key={i} className="text-sm text-emerald-50">• {m}</li>)}</ul>
              </div>
            )}
            {story.missing_footage?.length > 0 && (
              <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <CameraOff className="w-3.5 h-3.5 text-amber-300" />
                  <p className="text-[10px] uppercase tracking-widest text-amber-300">Still need to shoot</p>
                </div>
                <ul className="space-y-1.5">{story.missing_footage.map((m, i) => <li key={i} className="text-sm text-amber-50">• {m}</li>)}</ul>
              </div>
            )}
          </div>
        </div>
      )}

      {!story && !loading && (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-slate-500">
          No film written yet. The documentary is built from your logged games, film, and roster.
        </div>
      )}
    </div>
  );
}