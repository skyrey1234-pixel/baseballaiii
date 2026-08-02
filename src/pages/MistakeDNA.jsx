import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, GitBranch, Trash2 } from "lucide-react";
import ChainCard from "@/components/mistake/ChainCard";
import { buildFilmIntel } from "@/lib/filmIntel";

const cls = "bg-[#141C31] border-white/10 text-slate-100 placeholder:text-slate-500";

export default function MistakeDNA() {
  const qc = useQueryClient();
  const { data: players } = useQuery({ queryKey: ["players"], queryFn: () => base44.entities.Player.list("readiness", 100) });
  const { data: films } = useQuery({ queryKey: ["films"], queryFn: () => base44.entities.GameFilm.list("-created_date", 20) });
  const { data: patterns } = useQuery({ queryKey: ["mistakes"], queryFn: () => base44.entities.MistakePattern.list("-created_date", 20) });

  const [form, setForm] = useState({ player_name: "", player_role: "hitter", trigger: "", observations: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const analyze = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are DiamondMind AI building a player's "Mistake DNA" — the repeating causal chain behind a recurring failure, not a description of a single error.

Player: ${form.player_name} (${form.player_role}).
Triggering situation: ${form.trigger}.
What the coach keeps seeing: "${form.observations}"
${buildFilmIntel(films)}

Return a chain of 4-6 ordered links running from the trigger to the bad outcome — each link is a specific physical or decision-making event caused by the previous one. Mark exactly ONE link as is_root_cause: the earliest link that, if corrected, collapses the rest of the chain. Also give the pattern a short memorable name, an honest frequency estimate in plain language, why the pattern keeps repeating (habit, cue, pressure, physical limit), one intervention that attacks the root cause, and how the next session verifies the chain is broken.

Do not invent measurements. Stay in plain baseball language a 15-year-old can follow.`,
        response_json_schema: {
          type: "object",
          properties: {
            pattern_name: { type: "string" },
            frequency: { type: "string" },
            chain: { type: "array", items: { type: "object", properties: { step: { type: "string" }, detail: { type: "string" }, is_root_cause: { type: "boolean" } } } },
            root_cause: { type: "string" },
            why_it_repeats: { type: "string" },
            intervention: { type: "string" },
            verification: { type: "string" },
            confidence: { type: "string", enum: ["high", "moderate", "experimental"] },
          },
        },
      });
      await base44.entities.MistakePattern.create({ ...res, player_name: form.player_name, player_role: form.player_role, trigger: form.trigger });
      qc.invalidateQueries({ queryKey: ["mistakes"] });
      setForm((f) => ({ ...f, observations: "" }));
    } catch (e) {
      setError("The connection dropped while tracing the chain. Please try again.");
    }
    setLoading(false);
  };

  const remove = async (p) => {
    await base44.entities.MistakePattern.delete(p.id);
    qc.invalidateQueries({ queryKey: ["mistakes"] });
  };

  return (
    <div className="p-5 md:p-10 max-w-6xl mx-auto space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.3em] uppercase text-fuchsia-300 mb-2">Mistake DNA</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Not <span className="text-slate-500 line-through">"you made an error."</span> <span className="bg-gradient-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">The chain that caused it.</span>
        </h1>
      </header>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#161E38] to-[#111829] p-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Player</label>
            <Select value={form.player_name} onValueChange={set("player_name")}>
              <SelectTrigger className={cls}><SelectValue placeholder="Select player" /></SelectTrigger>
              <SelectContent>{(players || []).map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Role</label>
            <Select value={form.player_role} onValueChange={set("player_role")}>
              <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
              <SelectContent>{["hitter", "pitcher", "fielder"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Trigger situation</label>
            <Input value={form.trigger} onChange={(e) => set("trigger")(e.target.value)} placeholder="e.g. breaking ball below the zone" className={cls} />
          </div>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">What keeps happening</label>
          <Textarea rows={3} value={form.observations} onChange={(e) => set("observations")(e.target.value)}
            placeholder="Describe the repeating failure across multiple reps — what the body does, what the result is."
            className={cls + " resize-none"} />
        </div>
        <Button onClick={analyze} disabled={loading || !form.player_name || !form.trigger.trim() || !form.observations.trim()}
          className="w-full h-11 font-semibold text-[#150A22] bg-gradient-to-r from-fuchsia-400 to-cyan-300 hover:from-fuchsia-300 hover:to-cyan-200">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Tracing the chain…</> : <><GitBranch className="w-4 h-4 mr-2" /> Trace the failure chain</>}
        </Button>
      </div>

      {error && <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-5 text-sm text-rose-200">{error}</div>}

      <div className="space-y-5">
        {(patterns || []).map((p) => (
          <div key={p.id} className="relative">
            <ChainCard pattern={p} />
            <button onClick={() => remove(p)} className="absolute top-5 right-5 text-slate-600 hover:text-rose-400 transition-colors" aria-label="Delete pattern">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {!patterns?.length && !loading && (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-slate-500">
            No patterns traced yet. Describe a repeating mistake above.
          </div>
        )}
      </div>
    </div>
  );
}