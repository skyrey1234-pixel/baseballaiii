import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import FilmUploader from "@/components/film/FilmUploader";
import FilmCard from "@/components/film/FilmCard";

export default function GameFilm() {
  const qc = useQueryClient();
  const { data: films, isLoading } = useQuery({
    queryKey: ["films"],
    queryFn: () => base44.entities.GameFilm.list("-created_date", 50),
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["films"] });

  return (
    <div className="p-5 md:p-10 max-w-6xl mx-auto space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.3em] uppercase text-emerald-400 mb-2">Game Film</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Turn game video into coaching decisions</h1>
      </header>

      <FilmUploader onAdded={refresh} />

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-5">
          {[0, 1].map((i) => <div key={i} className="rounded-2xl bg-[#0C1220] h-80 animate-pulse" />)}
        </div>
      ) : films?.length ? (
        <div className="grid md:grid-cols-2 gap-5">
          {films.map((f) => <FilmCard key={f.id} film={f} onChanged={refresh} />)}
        </div>
      ) : (
        <p className="text-sm text-slate-600 text-center py-6">No game film yet — paste a YouTube link or upload a video above.</p>
      )}
    </div>
  );
}