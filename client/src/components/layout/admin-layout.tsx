import { useEffect } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();

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
          <h1 className="text-2xl font-bold text-[#872519]">Staff Dashboard</h1>
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
        
        <nav className="mb-8">
          <div className="flex space-x-4">
            <Button
              variant={location === "/admin/dashboard" ? "default" : "outline"}
              onClick={() => setLocation("/admin/dashboard")}
              className={location === "/admin/dashboard" ? "bg-[#872519]" : ""}
            >
              Dashboard
            </Button>
            <Button
              variant={location === "/admin/menu" ? "default" : "outline"}
              onClick={() => setLocation("/admin/menu")}
              className={location === "/admin/menu" ? "bg-[#872519]" : ""}
            >
              Menu Management
            </Button>
            <Button
              variant={location === "/admin/drinks" ? "default" : "outline"}
              onClick={() => setLocation("/admin/drinks")}
              className={location === "/admin/drinks" ? "bg-[#872519]" : ""}
            >
              Drinks Management
            </Button>
            <Button
              variant={location === "/admin/reservations" ? "default" : "outline"}
              onClick={() => setLocation("/admin/reservations")}
              className={location === "/admin/reservations" ? "bg-[#872519]" : ""}
            >
              Reservations
            </Button>
            <Button
              variant={location === "/admin/offers" ? "default" : "outline"}
              onClick={() => setLocation("/admin/offers")}
              className={location === "/admin/offers" ? "bg-[#872519]" : ""}
            >
              Offers
            </Button>
          </div>
        </nav>
        
        {children}
      </div>
    </div>
  );
}