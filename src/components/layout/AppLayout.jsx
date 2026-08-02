import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { LayoutGrid, Swords, Crosshair, Users, Diamond, Clapperboard, FlaskConical, Activity, Dna, Boxes, GitBranch, ShieldCheck, Flame, BadgeCheck, Film, Database } from "lucide-react";

// Each destination carries its own accent so the sidebar reads as a colorful map, not a list.
const nav = [
  { to: "/", label: "Command Center", icon: LayoutGrid, color: "text-emerald-300", active: "bg-emerald-400/15 text-emerald-200 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.35)]" },
  { to: "/war-room", label: "War Room", icon: Swords, color: "text-rose-300", active: "bg-rose-400/15 text-rose-200 shadow-[inset_0_0_0_1px_rgba(251,113,133,0.35)]" },
  { to: "/pitch-predictor", label: "Pitch Predictor", icon: Crosshair, color: "text-sky-300", active: "bg-sky-400/15 text-sky-200 shadow-[inset_0_0_0_1px_rgba(125,211,252,0.35)]" },
  { to: "/players", label: "Roster Intel", icon: Users, color: "text-amber-300", active: "bg-amber-400/15 text-amber-200 shadow-[inset_0_0_0_1px_rgba(252,211,77,0.35)]" },
  { to: "/mistake-dna", label: "Mistake DNA", icon: GitBranch, color: "text-fuchsia-300", active: "bg-fuchsia-400/15 text-fuchsia-200 shadow-[inset_0_0_0_1px_rgba(240,171,252,0.35)]" },
  { to: "/passport", label: "Pitching Passport", icon: ShieldCheck, color: "text-cyan-300", active: "bg-cyan-400/15 text-cyan-200 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.35)]" },
  { to: "/pitch-lab", label: "Pitch Design Lab", icon: FlaskConical, color: "text-violet-300", active: "bg-violet-400/15 text-violet-200 shadow-[inset_0_0_0_1px_rgba(196,181,253,0.35)]" },
  { to: "/rep-lab", label: "Rep Lab", icon: Activity, color: "text-lime-300", active: "bg-lime-400/15 text-lime-200 shadow-[inset_0_0_0_1px_rgba(190,242,100,0.35)]" },
  { to: "/pitch-dna", label: "Pitch DNA", icon: Dna, color: "text-teal-300", active: "bg-teal-400/15 text-teal-200 shadow-[inset_0_0_0_1px_rgba(94,234,212,0.35)]" },
  { to: "/swing-studio", label: "Swing Studio", icon: Boxes, color: "text-orange-300", active: "bg-orange-400/15 text-orange-200 shadow-[inset_0_0_0_1px_rgba(253,186,116,0.35)]" },
  { to: "/game-film", label: "Game Film", icon: Clapperboard, color: "text-indigo-300", active: "bg-indigo-400/15 text-indigo-200 shadow-[inset_0_0_0_1px_rgba(165,180,252,0.35)]" },
  { to: "/pressure-lab", label: "Pressure Lab", icon: Flame, color: "text-orange-300", active: "bg-orange-400/15 text-orange-200 shadow-[inset_0_0_0_1px_rgba(253,186,116,0.35)]" },
  { to: "/recruiting", label: "Recruiting Truth", icon: BadgeCheck, color: "text-emerald-300", active: "bg-emerald-400/15 text-emerald-200 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.35)]" },
  { to: "/documentary", label: "Season Film", icon: Film, color: "text-pink-300", active: "bg-pink-400/15 text-pink-200 shadow-[inset_0_0_0_1px_rgba(249,168,212,0.35)]" },
  { to: "/data-import", label: "Data Import", icon: Database, color: "text-cyan-300", active: "bg-cyan-400/15 text-cyan-200 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.35)]" },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#101A33] via-[#0E1526] to-[#160F2B] text-slate-200 flex flex-col md:flex-row">
      <aside className="md:w-64 md:min-h-screen border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-b from-[#182348] via-[#131B33] to-[#1B1338] flex md:flex-col shrink-0">
        <div className="hidden md:flex items-center gap-2.5 px-6 py-7">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-300 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Diamond className="w-5 h-5 text-[#0B1220]" strokeWidth={2.6} />
          </div>
          <div>
            <p className="font-bold tracking-widest text-white text-sm uppercase">DiamondMind</p>
            <p className="text-[10px] tracking-[0.3em] uppercase bg-gradient-to-r from-emerald-300 to-fuchsia-300 bg-clip-text text-transparent">AI · OS</p>
          </div>
        </div>
        <nav className="flex md:flex-col w-full overflow-x-auto md:overflow-visible px-2 md:px-3 py-2 md:py-0 gap-1">
          {nav.map(({ to, label, icon: Icon, color, active }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium tracking-wide whitespace-nowrap transition-all duration-200 ${
                  isActive ? active : "text-slate-300 hover:text-white hover:bg-white/10"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? "" : color}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <p className="hidden md:block mt-auto px-6 py-6 text-[10px] tracking-widest uppercase text-slate-500">
          See the next play<br />before it happens.
        </p>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}