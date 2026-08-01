import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Youtube } from "lucide-react";

export function parseYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

const inputCls = "bg-[#0C1220] border-white/10 text-slate-200 placeholder:text-slate-600";

export default function FilmUploader({ onAdded }) {
  const [tab, setTab] = useState("youtube");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const reset = () => { setTitle(""); setLink(""); setNotes(""); setFile(null); if (fileRef.current) fileRef.current.value = ""; };

  const save = async () => {
    setError("");
    if (!title.trim()) { setError("Give this film a title."); return; }
    setSaving(true);
    if (tab === "youtube") {
      const id = parseYouTubeId(link.trim());
      if (!id) { setError("That doesn't look like a valid YouTube link."); setSaving(false); return; }
      await base44.entities.GameFilm.create({ title: title.trim(), source: "youtube", video_url: link.trim(), youtube_id: id, notes });
    } else {
      if (!file) { setError("Choose a video file to upload."); setSaving(false); return; }
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.GameFilm.create({ title: title.trim(), source: "upload", video_url: file_url, notes });
    }
    setSaving(false);
    reset();
    onAdded();
  };

  const tabBtn = (key, Icon, label) => (
    <button onClick={() => setTab(key)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        tab === key ? "bg-emerald-400/10 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.25)]" : "text-slate-400 hover:text-slate-200"
      }`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0A0F18] p-6 space-y-4">
      <div className="flex gap-2">
        {tabBtn("youtube", Youtube, "YouTube link")}
        {tabBtn("upload", Upload, "Upload video")}
      </div>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title — e.g. vs Ridgeview Raptors, 7/28" className={inputCls} />
      {tab === "youtube" ? (
        <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={inputCls} />
      ) : (
        <input ref={fileRef} type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-400/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-emerald-300 hover:file:bg-emerald-400/20 cursor-pointer" />
      )}
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
        placeholder="Context for the AI — opponent, inning range, what to look for (optional)" className={inputCls + " resize-none"} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button onClick={save} disabled={saving} className="bg-emerald-500 hover:bg-emerald-400 text-[#06110C] font-semibold">
        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : "Add game film"}
      </Button>
    </div>
  );
}