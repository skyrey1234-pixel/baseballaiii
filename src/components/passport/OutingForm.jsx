import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

const cls = "bg-[#141C31] border-white/10 text-slate-100 placeholder:text-slate-500";
const today = () => new Date().toISOString().slice(0, 10);

export default function OutingForm({ playerName, age, onAdd }) {
  const [o, setO] = useState({ date: today(), organization: "", outing_type: "game", pitches: "", discomfort: "none" });
  const set = (k) => (v) => setO((x) => ({ ...x, [k]: v }));

  const submit = async () => {
    await onAdd({ player_name: playerName, age, date: o.date, organization: o.organization, outing_type: o.outing_type, pitches: Number(o.pitches), discomfort: o.discomfort });
    setO({ date: today(), organization: o.organization, outing_type: "game", pitches: "", discomfort: "none" });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#161E38] to-[#111829] p-6 grid md:grid-cols-6 gap-3 items-end">
      <div className="md:col-span-1">
        <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Date</label>
        <Input type="date" value={o.date} onChange={(e) => set("date")(e.target.value)} className={cls} />
      </div>
      <div className="md:col-span-2">
        <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Organization</label>
        <Input value={o.organization} onChange={(e) => set("organization")(e.target.value)} placeholder="School / travel / showcase" className={cls} />
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Type</label>
        <Select value={o.outing_type} onValueChange={set("outing_type")}>
          <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
          <SelectContent>{["game", "bullpen", "showcase", "warmup", "long_toss"].map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Pitches</label>
        <Input type="number" value={o.pitches} onChange={(e) => set("pitches")(e.target.value)} placeholder="0" className={cls} />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Arm</label>
          <Select value={o.discomfort} onValueChange={set("discomfort")}>
            <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
            <SelectContent>{["none", "mild", "notable"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="md:col-span-6">
        <Button onClick={submit} disabled={!playerName || !o.pitches}
          className="w-full h-11 font-semibold text-[#04121A] bg-gradient-to-r from-cyan-300 to-emerald-300 hover:from-cyan-200 hover:to-emerald-200">
          <Plus className="w-4 h-4 mr-2" /> Log outing
        </Button>
      </div>
    </div>
  );
}