import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Music2,
  CalendarDays,
  Camera,
  CalendarRange,
  Percent,
  Utensils,
  MapPin,
} from "lucide-react";

const navItems = [
  { href: "/menu", label: "Menu", icon: Utensils, color: "text-[#E85303]" },
  { href: "/offers", label: "Offers", icon: Percent, color: "text-[#E85303]" },
  { href: "/book", label: "Reservations", icon: CalendarRange, color: "text-[#36CAB0]" },
  { href: "/music", label: "Music", icon: Music2, color: "text-[#36CAB0]" },
  { href: "/events", label: "Events", icon: CalendarDays, color: "text-[#872519]" },
  { href: "/gallery", label: "Gallery", icon: Camera, color: "text-[#872519]" },
  { href: "/contacts", label: "Contacts", icon: MapPin, color: "text-[#E85303]" },
];

export default function IconNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#36CAB0]/20 border-t border-[#36CAB0]/30">
      <div className="grid grid-cols-7 gap-2 sm:gap-4 p-2 sm:p-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex flex-col items-center justify-center p-1 sm:p-3 rounded-lg transition-all duration-200 ease-in-out",
                "hover:scale-105 active:scale-95",
                location === item.href
                  ? `${item.color} bg-primary/5 shadow-sm`
                  : `text-muted-foreground hover:${item.color} hover:bg-primary/5`
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 sm:h-8 sm:w-8 mb-0.5 sm:mb-2 transition-transform duration-200",
                "group-hover:rotate-3",
                location === item.href && "animate-[bounce_0.5s_ease-in-out]",
                item.color
              )} />
              <span className="text-[10px] sm:text-sm font-medium line-clamp-1">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}