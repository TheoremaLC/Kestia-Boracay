import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Music2,
  CalendarDays,
  Camera,
  Ticket,
  CalendarRange,
} from "lucide-react";

const navItems = [
  { href: "/offers", label: "Offers", icon: Ticket },
  { href: "/book", label: "Book", icon: CalendarRange },
  { href: "/music", label: "Music", icon: Music2 },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/gallery", label: "Gallery", icon: Camera },
];

export default function IconNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="grid grid-cols-5 gap-4 p-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                location === item.href
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
