import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

const leftNavItems = [
  { href: "/menu", label: "Menu" },
  { href: "/offers", label: "Offers" },
  { href: "/book", label: "Book a Table" },
];

const rightNavItems = [
  { href: "/events", label: "Events" },
  { href: "/music", label: "Music" },
  { href: "/gallery", label: "Gallery" },
];

export default function Navbar() {
  const [location] = useLocation();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <NavigationMenu className="max-w-none flex-1">
            <NavigationMenuList>
              {leftNavItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href}>
                    <NavigationMenuLink
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors",
                        location === item.href && "text-primary"
                      )}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Link href="/">
            <a className="text-2xl font-bold text-primary whitespace-nowrap">
              Kestía Boracay
            </a>
          </Link>

          <NavigationMenu className="max-w-none flex-1 justify-end">
            <NavigationMenuList>
              {rightNavItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href}>
                    <NavigationMenuLink
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors",
                        location === item.href && "text-primary"
                      )}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
}