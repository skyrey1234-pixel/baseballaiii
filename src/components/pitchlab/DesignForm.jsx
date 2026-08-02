import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FlaskConical } from "lucide-react";

const PRESETS = [
  "A pitch that tunnels with his fastball but finishes below a left-handed hitter's barrel",
  "A slower breaking ball to steal called strikes early in the count",
  "A putaway pitch that runs off the outer edge against right-handed hitters",
];

export default function DesignForm({ pitchers, pitcher, setPitcher, goal, setGoal, onSubmit, loading }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0A0F18] p-6 space-y-4">
      <div>
        <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Pitcher</label>
        <Select value={pitcher} onValueChange={setPitcher}>
          <SelectTrigger className="bg-[#0C1220] border-white/10 text-slate-200"><SelectValue placeholder="Select a pitcher" /></SelectTrigger>
          <SelectContent>
            {(pitchers || []).map((p) => <SelectItem key={p.id} value={p.name}>{p.name} — #{p.number} {p.key_stat}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Design brief</label>
        <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={3}
          placeholder="Describe the pitch you want to build…"
          className="bg-[#0C1220] border-white/10 text-slate-200 placeholder:text-slate-600 resize-none" />
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p} onClick={() => setGoal(p)}
            className="text-xs px-3.5 py-2 rounded-full border border-white/10 text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300 transition-colors text-left">
            {p}
          </button>
        ))}
      </div>

      <Button onClick={onSubmit} disabled={loading || !pitcher || !goal.trim()}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#06110C] font-semibold h-11">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Designing…</> : <><FlaskConical className="w-4 h-4 mr-2" /> Design the pitch</>}
      </Button>
    </div>
  );
}