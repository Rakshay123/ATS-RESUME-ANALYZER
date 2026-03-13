import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { getToken, clearAuth } from "../utils/auth.js";

const Layout = () => {
  const navigate = useNavigate();
  const isAuthed = !!getToken();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to={isAuthed ? "/dashboard" : "/login"} className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-semibold">
              SR
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-50">Smart Resume Analyzer</span>
              <span className="text-xs text-slate-400">AI-powered career assistant</span>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {isAuthed && (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `text-xs md:text-sm ${isActive ? "text-primary-400" : "text-slate-300 hover:text-primary-300"}`
                  }
                >
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs md:text-sm text-slate-200 hover:bg-slate-800"
                >
                  Logout
                </button>
              </>
            )}
            {!isAuthed && (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `text-xs md:text-sm ${isActive ? "text-primary-400" : "text-slate-300 hover:text-primary-300"}`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `text-xs md:text-sm ${isActive ? "text-primary-400" : "text-slate-300 hover:text-primary-300"}`
                  }
                >
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800 bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Smart Resume Analyzer</span>
          <span>AI-powered resume, jobs & interviews</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

