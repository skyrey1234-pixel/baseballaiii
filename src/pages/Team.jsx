import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import InviteForm from "@/components/team/InviteForm";
import MemberRow from "@/components/team/MemberRow";

export default function Team() {
  const qc = useQueryClient();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const { data: members, isLoading } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => base44.entities.User.list("-created_date", 100),
  });

  const isAdmin = me?.role === "admin";

  return (
    <div className="p-5 md:p-10 max-w-4xl mx-auto space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.3em] uppercase text-emerald-400 mb-2">Staff Access</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Bring your staff into the system.</h1>
        <p className="text-sm text-slate-500 mt-2">
          Invited coaches get an email with a link to create their account. Admins can manage everyone; staff work inside the app.
        </p>
      </header>

      <InviteForm
        canInviteAdmins={isAdmin}
        onInvited={() => qc.invalidateQueries({ queryKey: ["teamMembers"] })}
      />

      <div className="rounded-2xl border border-white/5 bg-[#0A0F18] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <p className="text-[11px] uppercase tracking-widest text-slate-500">On the staff</p>
        </div>
        {isLoading && (
          <div className="p-10 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400 mx-auto" />
          </div>
        )}
        {!isLoading && (members || []).map((m) => <MemberRow key={m.id} member={m} />)}
        {!isLoading && !(members || []).length && (
          <p className="p-10 text-center text-sm text-slate-600">No one here yet — send the first invite above.</p>
        )}
      </div>
    </div>
  );
}