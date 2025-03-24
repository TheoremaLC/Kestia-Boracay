import { Link, useLocation } from "wouter";
import { categories } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function CategoryNav() {
  const [location] = useLocation();

  return (
    <nav className="mb-8 border-b">
      <div className="flex justify-center space-x-4 overflow-x-auto py-4">
        {categories.map((category) => (
          <Link key={category} href={`/menu/${category}`}>
            <a
              className={cn(
                "whitespace-nowrap px-3 py-1.5 text-xs font-medium transition-colors rounded-md",
                location === `/menu/${category}`
                  ? "bg-[#E85303] text-white font-semibold shadow-sm"
                  : "text-[#872519] hover:text-[#36CAB0] hover:bg-primary/5"
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