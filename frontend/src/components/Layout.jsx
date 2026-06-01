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
        <div className="h-16 flex items-center px-5 border-b border-white/5 gap-3">
          <img src="/projectlogo.png" alt="Project" className="h-10 object-contain" />
          <div className="leading-tight">
            <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-body">
              Math of
            </div>
            <div className="text-xs font-bold text-white font-title tracking-wider">
              MARKETING
            </div>
          </div>
          <button
            className="ml-auto lg:hidden text-neutral-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
            data-testid="sidebar-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 space-y-0.5 overflow-y-auto">
          <div className="px-3 mb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-body">
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
                  ? "flex items-center gap-3 px-4 py-2.5 text-white bg-gradient-to-r from-white/10 to-transparent border-l-2 border-white ml-3 mr-3 transition-all duration-200"
                  : "flex items-center gap-3 px-4 py-2.5 text-neutral-400 hover:text-white hover:bg-white/5 ml-3 mr-3 transition-all duration-200"
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium font-body">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: AI Badge */}
        <div className="p-4 border-t border-white/5">
          <div className="bg-neutral-900/50 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-white font-body">
                AI Active
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-body">
              GPT-4o analyzing your marketing data in real-time
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white font-heading tracking-tight">RS</span>
            </div>
            <div>
              <div className="text-sm text-white font-medium font-body">
                Rasheed Sait
              </div>
              <div className="text-xs text-neutral-500 font-body">
                CGO, Project Worldwide
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
            className="text-neutral-400 hover:text-white mr-3"
            data-testid="sidebar-open-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/projectlogo.png" alt="Project" className="h-8 object-contain" />
            <span className="text-sm font-bold text-white font-title tracking-wider">
              MATH OF MARKETING
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
