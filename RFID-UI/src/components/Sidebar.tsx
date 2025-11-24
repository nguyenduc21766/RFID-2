import { LayoutDashboard, Search, Plus, Printer, Radio, FileText, Users } from 'lucide-react';
import { cn } from '../lib/utils';

type View = 'dashboard' | 'search' | 'add-update' | 'printer' | 'reader-status' | 'activity-logs' | 'user-management';
type UserRole = 'admin' | 'staff';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  userRole: UserRole;
}

export function Sidebar({ currentView, onViewChange, isOpen, userRole }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff'] },
    { id: 'search', label: 'Search Item', icon: Search, roles: ['admin', 'staff'] },
    //{ id: 'add-update', label: 'Add / Update Object', icon: Plus, roles: ['admin'] },
    { id: 'printer', label: 'Tag Printer', icon: Printer, roles: ['admin'] },
    { id: 'reader-status', label: 'Reader Status', icon: Radio, roles: ['admin', 'staff'] },
    { id: 'activity-logs', label: 'Activity Logs', icon: FileText, roles: ['admin', 'staff'] },
    { id: 'user-management', label: 'User Management', icon: Users, roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => {}}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 z-30 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <nav className="p-4 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as View)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 space-y-1">
            <div>RoboAI Laboratory</div>
            <div>RFID Management v1.0</div>
          </div>
        </div>
      </aside>
    </>
  );
}
