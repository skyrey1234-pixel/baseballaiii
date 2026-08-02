import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import RepForm from "@/components/replab/RepForm";
import RepCard from "@/components/replab/RepCard";

const EMPTY = { player_name: "", rep_type: "pitch", pitch_type: "", intent: "", actual_result: "", data_source: "coach_entered", metrics: {} };

export default function RepLab() {
  const qc = useQueryClient();
  const { data: players } = useQuery({ queryKey: ["players"], queryFn: () => base44.entities.Player.list("readiness", 100) });
  const { data: reps } = useQuery({ queryKey: ["reps"], queryFn: () => base44.entities.PitchRep.list("-created_date", 25) });

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setField = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setMetric = (k) => (v) => setForm((f) => ({ ...f, metrics: { ...f.metrics, [k]: v } }));

  const analyze = async () => {
    setLoading(true);
    setError("");
    try {
      const player = (players || []).find((p) => p.name === form.player_name);
      const measured = Object.entries(form.metrics).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`).join(", ") || "no measurements provided";

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are DiamondMind AI, the coaching intelligence layer that sits on top of ball-tracking data. A single ${form.rep_type} rep was just captured.

Athlete: ${form.player_name}${player ? ` — ${player.position}, throws ${player.throws}, bats ${player.bats}, ${player.key_stat}, readiness ${player.readiness}/100, mechanics ${player.mechanical_stability}` : ""}.
${form.pitch_type ? `Pitch type: ${form.pitch_type}.` : ""}
Declared intent BEFORE the rep: "${form.intent}"
Actual result: ${form.actual_result || "not recorded"}
Measurements (${form.data_source.replace(/_/g, " ")}): ${measured}

Do the following:
1. plain_explanation — explain in coach-to-coach baseball language what these numbers mean and why the ball behaved this way. Reference the actual numbers given. Never invent measurements that weren't provided; if something is unmeasured, say what you'd need.
2. simple_explanation — the same thing explained to a 14-year-old, no jargon.
3. likely_cause — the most probable mechanical or decision-making cause.
4. execution_grade — 0-100 grading the PROCESS against the declared intent, NOT the outcome. A badly located pitch that got a swing-and-miss should grade low; a well-executed pitch that got hit hard should grade high.
5. grade_reason — one or two sentences justifying the grade.
6. prescribed_drill — one specific drill to run next, with reps/constraints.
7. drill_success_check — the measurable thing to look for next session that proves the correction worked.
8. confidence — "high" if measurements are radar/camera measured and complete, "moderate" if partial or coach-entered, "experimental" if mostly inferred.`,
        response_json_schema: {
          type: "object",
          properties: {
            plain_explanation: { type: "string" },
            simple_explanation: { type: "string" },
            likely_cause: { type: "string" },
            execution_grade: { type: "number" },
            grade_reason: { type: "string" },
            prescribed_drill: { type: "string" },
            drill_success_check: { type: "string" },
            confidence: { type: "string", enum: ["high", "moderate", "experimental"] },
          },
        },
      });

      await base44.entities.PitchRep.create({ ...form, ...res });
      qc.invalidateQueries({ queryKey: ["reps"] });
      setForm((f) => ({ ...EMPTY, player_name: f.player_name, rep_type: f.rep_type, pitch_type: f.pitch_type, data_source: f.data_source }));
    } catch (e) {
      setError("The connection dropped while grading the rep. Please try again.");
    }
    setLoading(false);
  };

  const remove = async (rep) => {
    await base44.entities.PitchRep.delete(rep.id);
    qc.invalidateQueries({ queryKey: ["reps"] });
  };

  return (
    <div className="p-5 md:p-10 max-w-6xl mx-auto space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.3em] uppercase text-emerald-400 mb-2">Rep Lab</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Intent in. Diagnosis, grade, and drill out.</h1>
        <p className="text-sm text-slate-500 mt-2">Log a pitch or swing from radar, camera, sensors, or your own eyes — every rep is graded on execution, not luck.</p>
      </header>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2">
          <RepForm players={players} form={form} setField={setField} setMetric={setMetric} onSubmit={analyze} loading={loading} />
        </div>
        <div className="lg:col-span-3 space-y-5">
          {error && <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5 text-sm text-red-300">{error}</div>}
          {loading && (
            <div className="rounded-2xl border border-white/5 bg-[#0C1220] p-10 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Comparing intent to execution…</p>
            </div>
          )}
          {reps?.length ? reps.map((r) => <RepCard key={r.id} rep={r} onDelete={remove} />) : (
            !loading && <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-600">
              Declare an intent, log what happened, and the lab grades the rep.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}