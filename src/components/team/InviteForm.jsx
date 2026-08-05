import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

export default function InviteForm({ canInviteAdmins, onInvited }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState("");
  const [error, setError] = useState("");

  const send = async () => {
    setSending(true);
    setError("");
    setSent("");
    try {
      await base44.users.inviteUser(email.trim(), role);
      setSent(`Invite sent to ${email.trim()}.`);
      setEmail("");
      onInvited?.();
    } catch (e) {
      setError("That invite did not go through. Check the email address and try again.");
    }
    setSending(false);
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0A0F18] p-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Email address</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="coach@program.com"
            className="bg-[#0C1220] border-white/10 text-slate-200"
          />
        </div>
        <div className="sm:w-44">
          <label className="text-[11px] uppercase tracking-widest text-slate-500 block mb-1.5">Access level</label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="bg-[#0C1220] border-white/10 text-slate-200"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Staff</SelectItem>
              {canInviteAdmins && <SelectItem value="admin">Admin</SelectItem>}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={send}
          disabled={sending || !email.trim()}
          className="bg-emerald-500 hover:bg-emerald-400 text-[#06110C] font-semibold h-11 sm:px-6"
        >
          {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : <><Send className="w-4 h-4 mr-2" /> Send invite</>}
        </Button>
      </div>
      {sent && (
        <p className="flex items-center gap-2 text-sm text-emerald-300">
          <CheckCircle2 className="w-4 h-4" /> {sent}
        </p>
      )}
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}