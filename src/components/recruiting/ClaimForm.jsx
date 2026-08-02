import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeCheck } from "lucide-react";

const cls = "bg-[#141C31] border-white/10 text-slate-100 placeholder:text-slate-500";
const DEVICES = ["trackman", "rapsodo", "hawkeye", "stalker_radar", "pocket_radar", "blast_motion", "hand_timed", "estimated"];
const SETTINGS = ["game", "showcase", "bullpen", "practice", "cage"];
const blank = {
  metric: "", peak_value: "", average_value: "", sample_size: "", date: new Date().toISOString().slice(0, 10),
  location: "", device: "pocket_radar", setting: "practice", video_url: "", witness: "",
};

const Field = ({ label, children }) => (
  <div>
    <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">{label}</label>
    {children}
  </div>
);

export default function ClaimForm({ playerName, onAdd }) {
  const [c, setC] = useState(blank);
  const set = (k) => (v) => setC((x) => ({ ...x, [k]: v }));

  const submit = async () => {
    await onAdd({ ...c, player_name: playerName, sample_size: Number(c.sample_size) || 0 });
    setC({ ...blank, location: c.location, device: c.device });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#141F3C] to-[#111829] p-6 space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <Field label="Metric"><Input value={c.metric} onChange={(e) => set("metric")(e.target.value)} placeholder="Fastball velocity" className={cls} /></Field>
        <Field label="Peak claimed"><Input value={c.peak_value} onChange={(e) => set("peak_value")(e.target.value)} placeholder="92 mph" className={cls} /></Field>
        <Field label="Session average"><Input value={c.average_value} onChange={(e) => set("average_value")(e.target.value)} placeholder="88.4 mph" className={cls} /></Field>
        <Field label="Measurements taken"><Input type="number" value={c.sample_size} onChange={(e) => set("sample_size")(e.target.value)} placeholder="24" className={cls} /></Field>
        <Field label="Date"><Input type="date" value={c.date} onChange={(e) => set("date")(e.target.value)} className={cls} /></Field>
        <Field label="Location"><Input value={c.location} onChange={(e) => set("location")(e.target.value)} placeholder="Facility or field" className={cls} /></Field>
        <Field label="Device">
          <Select value={c.device} onValueChange={set("device")}>
            <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
            <SelectContent>{DEVICES.map((d) => <SelectItem key={d} value={d}>{d.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Setting">
          <Select value={c.setting} onValueChange={set("setting")}>
            <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
            <SelectContent>{SETTINGS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Witness"><Input value={c.witness} onChange={(e) => set("witness")(e.target.value)} placeholder="Evaluating coach" className={cls} /></Field>
        <div className="md:col-span-3">
          <Field label="Video of the rep"><Input value={c.video_url} onChange={(e) => set("video_url")(e.target.value)} placeholder="Link to footage of the measured rep" className={cls} /></Field>
        </div>
      </div>
      <Button onClick={submit} disabled={!playerName || !c.metric.trim() || !c.peak_value.trim()}
        className="w-full h-11 font-semibold text-[#04121A] bg-gradient-to-r from-cyan-300 to-emerald-300 hover:from-cyan-200 hover:to-emerald-200">
        <BadgeCheck className="w-4 h-4 mr-2" /> Add claim with evidence
      </Button>
    </div>
  );
}