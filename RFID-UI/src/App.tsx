// src/App.tsx
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { SearchItem } from "./components/SearchItem";
import { TagPrinter } from "./components/TagPrinter";
import { ReaderStatus } from "./components/ReaderStatus";
import { ActivityLogs } from "./components/ActivityLogs";
import { UserManagement } from "./components/UserManagement";
import { Button } from "./components/ui/button";
import logo from "./assets/logo-1.png";
import { Login, CurrentUser } from "./components/Login";

type View =
  | "dashboard"
  | "search"
  | "printer"
  | "reader-status"
  | "activity-logs"
  | "user-management";

// you can still keep this if you use logout endpoint
const BASE_URL = "http://10.80.26.210:8000";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ⭐ Load initial user from localStorage on first render
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const saved = localStorage.getItem("currentUser");
    if (!saved) return null;
    try {
      return JSON.parse(saved) as CurrentUser;
    } catch {
      return null;
    }
  });

  const userRole = currentUser?.role ?? "staff";

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/api/auth/logout/`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout error:", e);
    }
    // ⭐ clear localStorage and state
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  // ⭐ If no user -> show login and save user to localStorage on success
  if (!currentUser) {
    return (
      <Login
        onLoggedIn={(user) => {
          setCurrentUser(user);
          localStorage.setItem("currentUser", JSON.stringify(user));
        }}
      />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "search":
        return <SearchItem />;
      case "printer":
        return <TagPrinter />;
      case "reader-status":
        return <ReaderStatus />;
      case "activity-logs":
        return <ActivityLogs />;
      case "user-management":
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <div className="flex items-center gap-3">
              <img src={logo} alt="RoboAI Logo" className="h-8 w-auto" />
              <span className="text-blue-600 font-semibold whitespace-nowrap">
                RoboAI RFID Tracking Dashboard
              </span>
            </div>
          </div>

          {/* Right side: user info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">System Online</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <div className="text-sm">{currentUser.username}</div>
                <div className="text-xs text-slate-500">{userRole}</div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="ml-3"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <Sidebar
          currentView={currentView as any}
          onViewChange={setCurrentView as any}
          isOpen={sidebarOpen}
          userRole={userRole}
        />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "lg:ml-64" : ""
          }`}
        >
          <div className="p-4 md:p-6 lg:p-8">{renderView()}</div>
        </main>
      </div>
    </div>
  );
}
