import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { LayoutGrid, Swords, Crosshair, Users, Diamond } from "lucide-react";

const nav = [
  { to: "/", label: "Command Center", icon: LayoutGrid },
  { to: "/war-room", label: "War Room", icon: Swords },
  { to: "/pitch-predictor", label: "Pitch Predictor", icon: Crosshair },
  { to: "/players", label: "Roster Intel", icon: Users },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#070B12] text-slate-200 flex flex-col md:flex-row">
      <aside className="md:w-60 md:min-h-screen border-b md:border-b-0 md:border-r border-white/5 bg-[#0A0F18] flex md:flex-col shrink-0">
        <div className="hidden md:flex items-center gap-2.5 px-6 py-7">
          <Diamond className="w-6 h-6 text-emerald-400 rotate-0" strokeWidth={2.5} />
          <div>
            <p className="font-bold tracking-widest text-white text-sm uppercase">DiamondMind</p>
            <p className="text-[10px] tracking-[0.3em] text-emerald-400/80 uppercase">AI · OS</p>
          </div>
        </div>
        <nav className="flex md:flex-col w-full overflow-x-auto md:overflow-visible px-2 md:px-3 py-2 md:py-0 gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-medium tracking-wide whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-400/10 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="hidden md:block mt-auto px-6 py-6 text-[10px] tracking-widest uppercase text-slate-600">
          See the next play<br />before it happens.
        </p>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}