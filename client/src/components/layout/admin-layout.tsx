import { useEffect } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/ui/logo";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("adminAuth") === "true";
    if (!isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen pb-32">
      <div className="container mx-auto px-4 py-8">
        <Logo />
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#872519]">Reservation Management</h1>
          <button 
            onClick={() => {
              localStorage.removeItem("adminAuth");
              setLocation("/admin/login");
            }}
            className="text-[#872519] hover:text-[#E85303] font-medium"
          >
            Logout
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}