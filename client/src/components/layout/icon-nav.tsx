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
  { href: "/menu", label: "Menu", icon: Utensils, color: "text-[#872519]" },
  { href: "/offers", label: "Offers", icon: Percent, color: "text-[#872519]" },
  { href: "/book", label: "Reservations", icon: CalendarRange, color: "text-[#872519]" },
  { href: "/music", label: "Music", icon: Music2, color: "text-[#872519]" },
  { href: "/events", label: "Events", icon: CalendarDays, color: "text-[#872519]" },
  { href: "/gallery", label: "Gallery", icon: Camera, color: "text-[#872519]" },
  { href: "/contacts", label: "Contacts", icon: MapPin, color: "text-[#872519]" },
];

export default function IconNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#36CAB0] border-t border-[#36CAB0]">
      <div className="grid grid-cols-7 gap-2 sm:gap-4 p-2 sm:p-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex flex-col items-center justify-center p-1 sm:p-3 rounded-lg transition-all duration-200 ease-in-out",
                "hover:scale-105 active:scale-95",
                location === item.href
                  ? `${item.color} bg-white shadow-sm`
                  : `text-white hover:${item.color} hover:bg-white/90`
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 sm:h-8 sm:w-8 mb-0.5 sm:mb-2 transition-transform duration-200",
                "group-hover:rotate-3",
                location === item.href && "animate-[bounce_0.5s_ease-in-out]",
                location === item.href ? item.color : "text-[#872519] font-bold"
              )} />
              <span className={`text-[10px] sm:text-sm font-bold line-clamp-1 ${location === item.href ? item.color : "text-white"}`}>{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}