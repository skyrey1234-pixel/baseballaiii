import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, RotateCcw } from "lucide-react";

export default function DemoVideo({ url, onGenerate, generating, disabled }) {
  return (
    <div className="space-y-2">
      {url ? (
        <div className="aspect-video rounded-xl overflow-hidden border border-emerald-400/25 bg-black">
          <video src={url} controls loop className="w-full h-full" />
        </div>
      ) : (
        <div className="aspect-video rounded-xl border border-dashed border-emerald-400/25 bg-emerald-400/[0.04] flex flex-col items-center justify-center gap-2 px-6 text-center">
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-emerald-300" />
              <p className="text-xs text-slate-400">Filming the correct rep — this takes about a minute…</p>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <p className="text-xs text-slate-500">Generate a realistic demonstration of the corrected rep.</p>
            </>
          )}
        </div>
      )}
      <Button onClick={onGenerate} disabled={generating || disabled} size="sm" variant="outline"
        className="w-full border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-200 hover:bg-emerald-400/15 hover:text-emerald-100">
        {generating ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : url ? <RotateCcw className="w-3.5 h-3.5 mr-2" /> : <Sparkles className="w-3.5 h-3.5 mr-2" />}
        {url ? "Regenerate demonstration" : "Show what right looks like"}
      </Button>
    </div>
  );
}