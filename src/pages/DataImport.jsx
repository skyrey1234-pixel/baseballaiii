import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Database, CheckCircle2 } from "lucide-react";
import ImportDropzone from "@/components/ingest/ImportDropzone";
import ImportPreview from "@/components/ingest/ImportPreview";

const ROW_SCHEMA = {
  type: "object",
  properties: {
    reps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          player_name: { type: "string" },
          rep_type: { type: "string", enum: ["pitch", "swing"] },
          pitch_type: { type: "string" },
          velocity: { type: "string" },
          spin_rate: { type: "string" },
          spin_axis: { type: "string" },
          extension: { type: "string" },
          release_height: { type: "string" },
          vertical_movement: { type: "string" },
          horizontal_movement: { type: "string" },
          vertical_approach_angle: { type: "string" },
          exit_velocity: { type: "string" },
          launch_angle: { type: "string" },
          launch_direction: { type: "string" },
          result: { type: "string" },
        },
      },
    },
  },
};

export default function DataImport() {
  const qc = useQueryClient();
  const { data: players } = useQuery({ queryKey: ["players"], queryFn: () => base44.entities.Player.list("readiness", 100) });

  const [device, setDevice] = useState("trackman");
  const [player, setPlayer] = useState("");
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(0);

  const handleFile = async (file) => {
    setLoading(true);
    setError("");
    setDone(0);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url, json_schema: ROW_SCHEMA });
      if (res.status !== "success") throw new Error(res.details);

      const parsed = (res.output?.reps || []).map((r) => ({
        player_name: r.player_name || player,
        rep_type: r.rep_type || (r.exit_velocity ? "swing" : "pitch"),
        pitch_type: r.pitch_type || "",
        intent: `Imported ${device.replace(/_/g, " ")} rep`,
        actual_result: r.result || "",
        data_source: "sensor_imported",
        metrics: {
          velocity: r.velocity, spin_rate: r.spin_rate, spin_axis: r.spin_axis, extension: r.extension,
          release_height: r.release_height, vertical_movement: r.vertical_movement,
          horizontal_movement: r.horizontal_movement, vertical_approach_angle: r.vertical_approach_angle,
          exit_velocity: r.exit_velocity, launch_angle: r.launch_angle, launch_direction: r.launch_direction,
        },
        confidence: "high",
      })).filter((r) => r.player_name);

      if (!parsed.length) setError("No rows with an athlete name were found. Pick an athlete above and try again.");
      setRows(parsed.length ? parsed : null);
    } catch (e) {
      setError("That file could not be read. Export it again as CSV or Excel and retry.");
    }
    setLoading(false);
  };

  const confirm = async () => {
    setSaving(true);
    setError("");
    try {
      await base44.entities.PitchRep.bulkCreate(rows);
      qc.invalidateQueries({ queryKey: ["reps"] });
      setDone(rows.length);
      setRows(null);
    } catch (e) {
      setError("The import failed partway through. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="p-5 md:p-10 max-w-5xl mx-auto space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.3em] uppercase text-cyan-300 mb-2">Data Import</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Your tracking data, already in the system.</h1>
        <p className="text-sm text-slate-500 mt-2">Pull a TrackMan, Rapsodo, Hawk-Eye, or Blast session export straight into the Rep Lab — no retyping.</p>
      </header>

      <ImportDropzone players={players} device={device} setDevice={setDevice} player={player} setPlayer={setPlayer}
        onFile={handleFile} loading={loading} />

      {error && <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-5 text-sm text-rose-200">{error}</div>}

      {done > 0 && (
        <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-5 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <p className="text-sm text-emerald-100">{done} rep{done === 1 ? "" : "s"} imported. They are now in the Rep Lab, tagged as sensor imported.</p>
        </div>
      )}

      {rows && <ImportPreview rows={rows} onConfirm={confirm} onCancel={() => setRows(null)} saving={saving} />}

      {!rows && !loading && done === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
          <Database className="w-5 h-5 text-slate-600" />
          Upload a session file and every measured rep is mapped, previewed, and stored.
        </div>
      )}
    </div>
  );
}