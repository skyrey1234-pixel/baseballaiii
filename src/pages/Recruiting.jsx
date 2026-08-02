import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ClaimForm from "@/components/recruiting/ClaimForm";
import ClaimCard from "@/components/recruiting/ClaimCard";
import { scoreClaim } from "@/lib/evidence";

export default function Recruiting() {
  const qc = useQueryClient();
  const { data: players } = useQuery({ queryKey: ["players"], queryFn: () => base44.entities.Player.list("readiness", 100) });
  const { data: claims } = useQuery({ queryKey: ["claims"], queryFn: () => base44.entities.VerifiedClaim.list("-date", 200) });

  const [name, setName] = useState("");
  const mine = useMemo(() => (claims || []).filter((c) => c.player_name === name), [claims, name]);
  const avg = mine.length ? Math.round(mine.reduce((n, c) => n + scoreClaim(c).score, 0) / mine.length) : 0;

  const add = async (data) => {
    await base44.entities.VerifiedClaim.create(data);
    qc.invalidateQueries({ queryKey: ["claims"] });
  };
  const remove = async (c) => {
    await base44.entities.VerifiedClaim.delete(c.id);
    qc.invalidateQueries({ queryKey: ["claims"] });
  };

  return (
    <div className="p-5 md:p-10 max-w-5xl mx-auto space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.3em] uppercase text-cyan-300 mb-2">Recruiting Truth</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-200 via-emerald-200 to-lime-200 bg-clip-text text-transparent">
          Every number links to evidence.
        </h1>
        <p className="text-sm text-slate-400 mt-2">No profile gets built on one suspicious radar reading — each claim carries its footage, device, setting, and sample size.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="text-[11px] uppercase tracking-widest text-slate-400 block mb-1.5">Athlete</label>
          <Select value={name} onValueChange={setName}>
            <SelectTrigger className="bg-[#141C31] border-white/10 text-slate-100"><SelectValue placeholder="Select an athlete" /></SelectTrigger>
            <SelectContent>{(players || []).map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {name && mine.length > 0 && (
          <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/[0.07] px-5 py-3">
            <p className="text-2xl font-bold text-white">{avg}<span className="text-sm text-slate-500">/100</span></p>
            <p className="text-[10px] uppercase tracking-widest text-cyan-300">Profile evidence score</p>
          </div>
        )}
      </div>

      {name ? (
        <>
          <div className="space-y-3">
            {mine.map((c) => <ClaimCard key={c.id} claim={c} onDelete={remove} />)}
            {!mine.length && (
              <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">
                No verified claims for {name} yet.
              </div>
            )}
          </div>
          <ClaimForm playerName={name} onAdd={add} />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-slate-500">
          Select an athlete to open their verified profile.
        </div>
      )}
    </div>
  );
}