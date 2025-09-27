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
  Wine,
} from "lucide-react";

const navItems = [
  { href: "/menu", label: "Food", icon: Utensils, color: "text-[#872519]" },
  { href: "/drinks", label: "Drinks", icon: Wine, color: "text-[#8B4513]" },
  { href: "/offers", label: "Offers", icon: Percent, color: "text-[#E85303]" },
  { href: "/book", label: "Booking", icon: CalendarRange, color: "text-[#E85303]" },
  { href: "/music", label: "Music", icon: Music2, color: "text-[#8B0000]" },
  { href: "/events", label: "Events", icon: CalendarDays, color: "text-[#FF6600]" },
  { href: "/gallery", label: "Gallery", icon: Camera, color: "text-[#990099]" },
  { href: "/contacts", label: "Contacts", icon: MapPin, color: "text-[#006633]" },
];

export default function IconNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#36CAB0] border-t border-[#36CAB0]">
      <div className="grid grid-cols-8 gap-1 sm:gap-3 py-2.5 px-1 sm:p-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-lg transition-all duration-200 ease-in-out",
                "hover:scale-105 active:scale-95",
                location === item.href
                  ? `text-white bg-white/20 shadow-inner ring-1 ring-white/30`
                  : `text-white hover:bg-white/10 hover:shadow-inner`
              )}
            >
              <item.icon className={cn(
                "h-6 w-6 sm:h-8 sm:w-8 mb-0.5 sm:mb-2 transition-all duration-200",
                "hover:brightness-125 hover:filter",
                location === item.href && "brightness-125 filter animate-[bounce_0.5s_ease-in-out]",
                item.color
              )} />
              <span className="text-[11px] sm:text-sm font-bold line-clamp-1 text-white">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}