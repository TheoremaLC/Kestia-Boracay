import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Music2,
  CalendarDays,
  Camera,
  CalendarRange,
  Percent,
  Utensils,
} from "lucide-react";

const navItems = [
  { href: "/menu", label: "Menu", icon: Utensils, color: "text-indigo-500" },
  { href: "/offers", label: "Offers", icon: Percent, color: "text-amber-500" },
  { href: "/book", label: "Table Book", icon: CalendarRange, color: "text-emerald-500" },
  { href: "/music", label: "Music", icon: Music2, color: "text-purple-500" },
  { href: "/events", label: "Events", icon: CalendarDays, color: "text-blue-500" },
  { href: "/gallery", label: "Gallery", icon: Camera, color: "text-rose-500" },
];

export default function IconNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="grid grid-cols-6 gap-2 sm:gap-4 p-2 sm:p-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg transition-all duration-200 ease-in-out",
                "hover:scale-105 active:scale-95",
                location === item.href
                  ? `${item.color} bg-primary/10 shadow-sm`
                  : `text-muted-foreground hover:${item.color} hover:bg-primary/5`
              )}
            >
              <item.icon className={cn(
                "h-6 w-6 sm:h-8 sm:w-8 mb-1 sm:mb-2 transition-transform duration-200",
                "group-hover:rotate-3",
                location === item.href && "animate-[bounce_0.5s_ease-in-out]",
                item.color
              )} />
              <span className="text-xs sm:text-sm font-medium">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}