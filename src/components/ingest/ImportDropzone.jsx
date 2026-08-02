import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UploadCloud } from "lucide-react";

const cls = "bg-[#0C1220] border-white/10 text-slate-200 placeholder:text-slate-600";

export const DEVICES = [
  ["trackman", "TrackMan"],
  ["rapsodo", "Rapsodo"],
  ["hawkeye", "Hawk-Eye"],
  ["blast_motion", "Blast Motion"],
  ["other", "Other export"],
];

export default function ImportDropzone({ players, device, setDevice, player, setPlayer, onFile, loading }) {
  const input = useRef(null);

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#16203C] to-[#111829] p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Source device</label>
          <Select value={device} onValueChange={setDevice}>
            <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
            <SelectContent>{DEVICES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Athlete (if the file has no name column)</label>
          <Select value={player} onValueChange={setPlayer}>
            <SelectTrigger className={cls}><SelectValue placeholder="Optional" /></SelectTrigger>
            <SelectContent>{(players || []).map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={loading}
        className="w-full rounded-xl border border-dashed border-cyan-400/30 bg-cyan-400/[0.05] py-10 flex flex-col items-center gap-2 hover:bg-cyan-400/10 transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin text-cyan-300" /> : <UploadCloud className="w-6 h-6 text-cyan-300" />}
        <p className="text-sm text-slate-300">{loading ? "Reading the session export…" : "Drop a CSV or Excel session export"}</p>
        <p className="text-[11px] text-slate-500">Pitch and swing rows are mapped automatically</p>
      </button>
      <Input ref={input} type="file" accept=".csv,.xlsx,.json" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
    </div>
  );
}