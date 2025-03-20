import { Link, useLocation } from "wouter";
import { categories } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function CategoryNav() {
  const [location] = useLocation();

  return (
    <nav className="mb-8 border-b">
      <div className="flex space-x-4 overflow-x-auto py-4">
        {categories.map((category) => (
          <Link key={category} href={`/menu/${category}`}>
            <a
              className={cn(
                "whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors",
                location === `/menu/${category}`
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {category.replace("-", " ").toUpperCase()}
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}
