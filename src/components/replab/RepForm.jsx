import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Activity } from "lucide-react";

const cls = "bg-[#0C1220] border-white/10 text-slate-200 placeholder:text-slate-600";

const SOURCES = [
  ["radar_measured", "Radar measured"],
  ["camera_measured", "Camera measured"],
  ["sensor_imported", "Sensor imported"],
  ["ai_estimated", "AI estimated"],
  ["coach_entered", "Coach entered"],
  ["player_reported", "Player reported"],
];

const PITCH_FIELDS = [
  ["velocity", "Velocity (mph)"],
  ["spin_rate", "Spin rate (rpm)"],
  ["spin_axis", "Spin axis / tilt"],
  ["extension", "Extension (ft)"],
  ["release_height", "Release height (ft)"],
  ["vertical_movement", "Vert. movement (in)"],
  ["horizontal_movement", "Horiz. movement (in)"],
  ["vertical_approach_angle", "Vert. approach angle (°)"],
];

const SWING_FIELDS = [
  ["exit_velocity", "Exit velocity (mph)"],
  ["launch_angle", "Launch angle (°)"],
  ["launch_direction", "Launch direction (°)"],
];

export default function RepForm({ players, form, setField, setMetric, onSubmit, loading }) {
  const fields = form.rep_type === "pitch" ? PITCH_FIELDS : SWING_FIELDS;

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0A0F18] p-6 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Athlete</label>
          <Select value={form.player_name} onValueChange={setField("player_name")}>
            <SelectTrigger className={cls}><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{(players || []).map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Rep type</label>
          <Select value={form.rep_type} onValueChange={setField("rep_type")}>
            <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="pitch">Pitch</SelectItem><SelectItem value="swing">Swing</SelectItem></SelectContent>
          </Select>
        </div>
      </div>

      {form.rep_type === "pitch" && (
        <div>
          <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Pitch type</label>
          <Input value={form.pitch_type} onChange={(e) => setField("pitch_type")(e.target.value)} placeholder="e.g. Slider" className={cls} />
        </div>
      )}

      <div>
        <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Intent — declared before the rep</label>
        <Input value={form.intent} onChange={(e) => setField("intent")(e.target.value)}
          placeholder={form.rep_type === "pitch" ? "Fastball, upper glove-side corner" : "Drive the outer-half fastball the other way"} className={cls} />
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">What actually happened</label>
        <Input value={form.actual_result} onChange={(e) => setField("actual_result")(e.target.value)}
          placeholder="e.g. Missed arm side, middle-middle, swinging strike" className={cls} />
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Data source</label>
        <Select value={form.data_source} onValueChange={setField("data_source")}>
          <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
          <SelectContent>{SOURCES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Measurements <span className="text-slate-600 normal-case tracking-normal">(leave blank if unmeasured)</span></p>
        <div className="grid grid-cols-2 gap-2.5">
          {fields.map(([key, label]) => (
            <Input key={key} value={form.metrics[key] || ""} onChange={(e) => setMetric(key)(e.target.value)} placeholder={label} className={cls + " h-9 text-sm"} />
          ))}
        </div>
      </div>

      <Button onClick={onSubmit} disabled={loading || !form.player_name || !form.intent.trim()}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#06110C] font-semibold h-11">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Grading rep…</> : <><Activity className="w-4 h-4 mr-2" /> Explain & grade this rep</>}
      </Button>
    </div>
  );
}