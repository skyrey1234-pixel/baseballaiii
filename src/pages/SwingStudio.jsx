import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Pause, Wrench, Trash2 } from "lucide-react";
import SwingScene from "@/components/swing/SwingScene";
import SwingCallout from "@/components/swing/SwingCallout";
import PhaseTimeline from "@/components/swing/PhaseTimeline";
import SwingInputs from "@/components/swing/SwingInputs";
import EvidenceDemo from "@/components/evidence/EvidenceDemo";

const VIEWS = [["side", "Side"], ["catcher", "Catcher"], ["top", "Overhead"]];

export default function SwingStudio() {
  const qc = useQueryClient();
  const { data: players } = useQuery({ queryKey: ["players"], queryFn: () => base44.entities.Player.list("readiness", 100) });
  const { data: swings } = useQuery({ queryKey: ["swings"], queryFn: () => base44.entities.SwingAnalysis.list("-created_date", 10) });

  const hitters = (players || []).filter((p) => p.role !== "pitcher");
  const [form, setForm] = useState({ player_name: "", situation: "", observation: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [view, setView] = useState("side");
  const [progress, setProgress] = useState(0);
  const [pinned, setPinned] = useState(null);

  const setField = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const swing = (swings || []).find((s) => s.id === activeId) || swings?.[0];

  const liveIndex = useMemo(() => {
    const phases = swing?.phases || [];
    if (!phases.length) return 0;
    const pct = progress * 100;
    let idx = 0;
    phases.forEach((p, i) => { if (pct >= p.timing_pct) idx = i; });
    return idx;
  }, [progress, swing]);

  const activeIndex = pinned ?? liveIndex;

  const analyze = async () => {
    setLoading(true);
    setError("");
    try {
      const p = hitters.find((x) => x.name === form.player_name);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are DiamondMind AI reconstructing a hitter's swing in 3D so a coach can watch it back with animated callouts.

Hitter: ${form.player_name}${p ? ` — bats ${p.bats}, ${p.position}, ${p.key_stat}` : ""}.
Situation: ${form.situation || "not specified"}.
Coach's observation of the swing: "${form.observation}"

Infer a physically plausible swing and return:
- headline: one sharp line on what this swing was.
- overall_grade: 0-100 grading swing execution against the situation, not the lucky outcome.
- fix_priority: the single most important change.
- swing_params: the geometry used to animate it — attack_angle_deg (negative is a downward path), bat_speed_mph, swing_length_ft, contact_depth_ft (feet in front of the plate, negative means caught deep), contact_height_ft, contact_side_ft (negative = inside), pitch_velocity_mph, launch_angle_deg, launch_direction_deg (negative = pull side), exit_velocity_mph. Use the coach's numbers wherever they gave them; otherwise infer realistic values consistent with the description.
- phases: exactly 5 ordered phases named "Load", "Stride", "Launch", "Contact", "Extension", each with timing_pct (roughly 5, 28, 45, 58, 82), a verdict of "good", "flaw", or "neutral", what_happened (one concrete sentence about the body/barrel in that phase), and cue (what the hitter should feel instead — for good phases, what to keep doing).
- drill: one specific drill with reps and constraints.
- confidence: "high" only if real measurements were provided, otherwise "moderate" or "experimental".

Be honest about flaws. Never invent measurements the coach did not give as if they were recorded — they are your estimates.`,
        response_json_schema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            overall_grade: { type: "number" },
            fix_priority: { type: "string" },
            swing_params: {
              type: "object",
              properties: {
                attack_angle_deg: { type: "number" }, bat_speed_mph: { type: "number" }, swing_length_ft: { type: "number" },
                contact_depth_ft: { type: "number" }, contact_height_ft: { type: "number" }, contact_side_ft: { type: "number" },
                pitch_velocity_mph: { type: "number" }, launch_angle_deg: { type: "number" }, launch_direction_deg: { type: "number" },
                exit_velocity_mph: { type: "number" },
              },
            },
            phases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" }, timing_pct: { type: "number" },
                  verdict: { type: "string", enum: ["good", "flaw", "neutral"] },
                  what_happened: { type: "string" }, cue: { type: "string" },
                },
              },
            },
            drill: { type: "string" },
            confidence: { type: "string", enum: ["high", "moderate", "experimental"] },
          },
        },
      });

      const created = await base44.entities.SwingAnalysis.create({ ...res, player_name: form.player_name, situation: form.situation });
      await qc.invalidateQueries({ queryKey: ["swings"] });
      setActiveId(created.id);
      setPinned(null);
      setPlaying(true);
    } catch (e) {
      setError("The connection dropped while rebuilding the swing. Please try again.");
    }
    setLoading(false);
  };

  const remove = async (s) => {
    await base44.entities.SwingAnalysis.delete(s.id);
    setActiveId(null);
    qc.invalidateQueries({ queryKey: ["swings"] });
  };

  return (
    <div className="p-5 md:p-10 max-w-7xl mx-auto space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.3em] uppercase text-emerald-400 mb-2">Swing Studio</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Watch the swing. See the fix.</h1>
        <p className="text-sm text-slate-500 mt-2">A 3D rebuild of the swing with animated coaching callouts at every phase.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-5">
          <SwingInputs hitters={hitters} form={form} setField={setField} onSubmit={analyze} loading={loading} />
          {swings?.length > 1 && (
            <div className="rounded-2xl border border-white/5 bg-[#0A0F18] p-5">
              <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-3">Saved swings</p>
              <div className="space-y-1.5">
                {swings.map((s) => (
                  <button key={s.id} onClick={() => { setActiveId(s.id); setPinned(null); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${s.id === swing?.id ? "bg-emerald-400/10 text-emerald-300" : "text-slate-400 hover:bg-white/5"}`}>
                    {s.player_name} — {s.situation || "swing"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">
          {error && <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5 text-sm text-red-300">{error}</div>}

          {loading && (
            <div className="rounded-2xl border border-white/5 bg-[#0C1220] p-10 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Reconstructing barrel path, timing, and contact point…</p>
            </div>
          )}

          {!loading && swing && (
            <>
              <div className="rounded-2xl border border-emerald-400/20 bg-[#0A0F18] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-400">{swing.player_name}{swing.situation ? ` · ${swing.situation}` : ""}</p>
                    <p className="text-lg text-white font-semibold mt-1.5">{swing.headline}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-3xl font-bold tracking-tight ${swing.overall_grade >= 80 ? "text-emerald-400" : swing.overall_grade >= 55 ? "text-sky-400" : "text-amber-400"}`}>
                      {swing.overall_grade}<span className="text-sm text-slate-600">/100</span>
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-600">Swing grade</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <SwingScene params={swing.swing_params || {}} playing={playing && pinned === null} view={view} onProgress={setProgress} />
                <SwingCallout phase={(swing.phases || [])[activeIndex]} />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Button size="sm" onClick={() => { setPinned(null); setPlaying(!playing); }}
                    className="bg-black/50 backdrop-blur border border-white/10 hover:bg-black/70 text-white h-8">
                    {playing && pinned === null ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </Button>
                  {VIEWS.map(([v, label]) => (
                    <button key={v} onClick={() => setView(v)}
                      className={`text-[11px] px-3 h-8 rounded-md border backdrop-blur transition-colors ${view === v ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300" : "border-white/10 bg-black/50 text-slate-300 hover:bg-black/70"}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end max-w-[45%]">
                  {Object.entries(swing.swing_params || {}).slice(0, 4).map(([k, v]) => (
                    <span key={k} className="text-[10px] px-2.5 py-1 rounded-full bg-black/50 backdrop-blur border border-white/10 text-slate-300">
                      {k.replace(/_/g, " ").replace(" deg", "°").replace(" ft", "")}: {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2.5">Phase breakdown <span className="normal-case tracking-normal">(click to hold a phase)</span></p>
                  <PhaseTimeline phases={swing.phases} activeIndex={activeIndex}
                    onSelect={(i) => setPinned(pinned === i ? null : i)} />
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-4">
                    <p className="text-[10px] uppercase tracking-widest text-amber-400/80 mb-1.5">Fix this first</p>
                    <p className="text-sm text-amber-100/90">{swing.fix_priority}</p>
                  </div>
                  {swing.drill && (
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-4 flex gap-3">
                      <Wrench className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-200">{swing.drill}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 text-slate-400">{swing.confidence} confidence</span>
                    <button onClick={() => remove(swing)} className="text-slate-600 hover:text-red-400 transition-colors" aria-label="Delete swing">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <EvidenceDemo
                entityName="SwingAnalysis"
                record={swing}
                subject={`${swing.player_name} hitting${swing.situation ? ` — ${swing.situation}` : ""}`}
                fix={swing.fix_priority || swing.drill}
              />
            </>
          )}

          {!loading && !swing && (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-slate-600">
              Describe a swing and the studio will rebuild it in 3D with coaching callouts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}