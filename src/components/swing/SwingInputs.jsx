import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Boxes } from "lucide-react";

const cls = "bg-[#0C1220] border-white/10 text-slate-200 placeholder:text-slate-600";

export default function SwingInputs({ hitters, form, setField, onSubmit, loading }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0A0F18] p-6 space-y-4">
      <div>
        <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Hitter</label>
        <Select value={form.player_name} onValueChange={setField("player_name")}>
          <SelectTrigger className={cls}><SelectValue placeholder="Select a hitter" /></SelectTrigger>
          <SelectContent>{(hitters || []).map((p) => <SelectItem key={p.id} value={p.name}>{p.name} — #{p.number} ({p.bats})</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Pitch & count</label>
        <Input value={form.situation} onChange={(e) => setField("situation")(e.target.value)}
          placeholder="e.g. 1-2 count, 88 mph fastball, up and in" className={cls} />
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">What you saw</label>
        <Textarea value={form.observation} onChange={(e) => setField("observation")(e.target.value)} rows={4}
          placeholder="Describe the swing — timing, barrel path, finish, result. Add any measured numbers you have (exit velo, launch angle, bat speed)."
          className={cls + " resize-none"} />
      </div>

      <Button onClick={onSubmit} disabled={loading || !form.player_name || !form.observation.trim()}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#06110C] font-semibold h-11">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Rebuilding swing…</> : <><Boxes className="w-4 h-4 mr-2" /> Build 3D swing</>}
      </Button>
    </div>
  );
}