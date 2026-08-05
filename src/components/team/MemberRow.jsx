import React from "react";
import { ShieldCheck, User as UserIcon } from "lucide-react";

export default function MemberRow({ member }) {
  const isAdmin = member.role === "admin";
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isAdmin ? "bg-cyan-400/15 text-cyan-300" : "bg-white/5 text-slate-400"}`}>
        {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-200 truncate">{member.full_name || member.email}</p>
        <p className="text-xs text-slate-500 truncate">{member.email}</p>
      </div>
      <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full ${isAdmin ? "bg-cyan-400/10 text-cyan-300" : "bg-white/5 text-slate-400"}`}>
        {isAdmin ? "Admin" : "Staff"}
      </span>
    </div>
  );
}