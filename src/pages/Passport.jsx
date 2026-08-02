import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import OutingForm from "@/components/passport/OutingForm";
import WorkloadSummary from "@/components/passport/WorkloadSummary";
import { buildPassport } from "@/lib/pitchSmart";

const cls = "bg-[#141C31] border-white/10 text-slate-100";

export default function Passport() {
  const qc = useQueryClient();
  const { data: players } = useQuery({ queryKey: ["players"], queryFn: () => base44.entities.Player.list("readiness", 100) });
  const { data: outings } = useQuery({ queryKey: ["outings"], queryFn: () => base44.entities.PitchOuting.list("-date", 200) });

  const pitchers = (players || []).filter((p) => p.role === "pitcher");
  const [name, setName] = useState("");
  const [age, setAge] = useState(16);

  const mine = useMemo(() => (outings || []).filter((o) => o.player_name === name), [outings, name]);
  const passport = useMemo(() => buildPassport(mine, age), [mine, age]);

  const add = async (data) => {
    await base44.entities.PitchOuting.create(data);
    qc.invalidateQueries({ queryKey: ["outings"] });
  };
  const remove = async (o) => {
    await base44.entities.PitchOuting.delete(o.id);
    qc.invalidateQueries({ queryKey: ["outings"] });
  };

  return (
    <div className="p-5 md:p-10 max-w-6xl mx-auto space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.3em] uppercase text-cyan-300 mb-2">Pitching Passport</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          One arm. <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">Every team.</span>
        </h1>
        <p className="text-sm text-slate-400 mt-2">School, travel, showcase, and bullpen work rolled into a single workload record with Pitch Smart rest tracking.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Pitcher</label>
          <Select value={name} onValueChange={setName}>
            <SelectTrigger className={cls}><SelectValue placeholder="Select a pitcher" /></SelectTrigger>
            <SelectContent>{pitchers.map((p) => <SelectItem key={p.id} value={p.name}>{p.name} — #{p.number}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Age</label>
          <Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value) || 0)} className={cls} />
        </div>
      </div>

      {name && (
        <>
          {passport ? <WorkloadSummary passport={passport} /> : (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">
              No outings logged for {name} yet.
            </div>
          )}

          <OutingForm playerName={name} age={age} onAdd={add} />

          {mine.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Outing history</h2>
              <div className="space-y-2">
                {mine.map((o) => (
                  <div key={o.id} className="rounded-xl border border-white/5 bg-[#131A2C] px-5 py-3 flex items-center gap-4">
                    <span className="text-xs font-mono text-cyan-300 w-24 shrink-0">{o.date}</span>
                    <span className="text-sm text-white font-semibold w-14 shrink-0">{o.pitches}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 capitalize">{(o.outing_type || "game").replace("_", " ")}</span>
                    <span className="text-xs text-slate-400 truncate">{o.organization}</span>
                    {o.discomfort && o.discomfort !== "none" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-200 capitalize">{o.discomfort} discomfort</span>
                    )}
                    <button onClick={() => remove(o)} className="ml-auto text-slate-600 hover:text-rose-400 transition-colors" aria-label="Delete outing">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!name && (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-slate-500">
          Select a pitcher to open their workload passport.
        </div>
      )}
    </div>
  );
}