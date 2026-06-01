import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Lightbulb,
  Sliders,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";

const navItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    testId: "sidebar-dashboard-link",
  },
  {
    path: "/copilot",
    label: "AI Copilot",
    icon: MessageSquare,
    testId: "sidebar-copilot-link",
  },
  {
    path: "/recommendations",
    label: "Recommendations",
    icon: Lightbulb,
    testId: "sidebar-recommendations-link",
  },
  {
    path: "/simulator",
    label: "What-If Simulator",
    icon: Sliders,
    testId: "sidebar-simulator-link",
  },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#050505] border-r border-white/5 flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#00FF9C]/10 border border-[#00FF9C]/30 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(0,255,156,0.1)]">
              <TrendingUp className="w-4 h-4 text-[#00FF9C]" />
            </div>
            <div className="leading-tight">
              <div className="text-xs uppercase tracking-[0.15em] text-[#525C57] font-body">
                Math of
              </div>
              <div className="text-sm font-bold text-white font-heading tracking-tight">
                Marketing
              </div>
            </div>
          </div>
          <button
            className="ml-auto lg:hidden text-[#8B9A92] hover:text-white"
            onClick={() => setSidebarOpen(false)}
            data-testid="sidebar-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 space-y-0.5 overflow-y-auto">
          <div className="px-3 mb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#525C57] font-body">
              Navigation
            </span>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              data-testid={item.testId}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "flex items-center gap-3 px-4 py-2.5 text-[#00FF9C] bg-gradient-to-r from-[#00FF9C]/10 to-transparent border-l-2 border-[#00FF9C] ml-3 mr-3 rounded-r-lg transition-all duration-200"
                  : "flex items-center gap-3 px-4 py-2.5 text-[#8B9A92] hover:text-white hover:bg-white/5 ml-3 mr-3 rounded-lg transition-all duration-200"
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium font-body">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: AI Badge */}
        <div className="p-4 border-t border-white/5">
          <div className="bg-[#0A0D0B] rounded-xl p-3 border border-[#00FF9C]/10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 bg-[#00FF9C] rounded-full animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-[#00FF9C] font-body">
                AI Active
              </span>
            </div>
            <p className="text-xs text-[#525C57] font-body">
              GPT-4o analyzing your marketing data in real-time
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-[#00FF9C]/15 border border-[#00FF9C]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-[#00FF9C] font-heading tracking-tight">RS</span>
            </div>
            <div>
              <div className="text-sm text-white font-medium font-body">
                Rasheed Sait
              </div>
              <div className="text-xs text-[#525C57] font-body">
                CMO, Project Worldwide
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden h-14 flex items-center px-4 border-b border-white/5 bg-[#050505] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#8B9A92] hover:text-white mr-3"
            data-testid="sidebar-open-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00FF9C]" />
            <span className="text-sm font-bold text-white font-heading">
              Math of{" "}
              <span className="text-[#00FF9C]">Marketing</span>
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
