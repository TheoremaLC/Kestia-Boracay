import { Link, useLocation } from "wouter";
import { categories } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function CategoryNav() {
  const [location] = useLocation();

  return (
    <nav className="mb-4 sm:mb-8 -mx-2 sm:mx-0">
      <div className="flex overflow-x-auto py-2 px-4 sm:px-0 scrollbar-none gap-2 sm:gap-4">
        {categories.map((category) => (
          <Link key={category} href={`/menu/${category}`}>
            <a
              className={cn(
                "whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200",
                "rounded-lg border border-transparent",
                "hover:scale-105 active:scale-95",
                location === `/menu/${category}`
                  ? "bg-[#E85303] text-white font-semibold shadow-md transform -translate-y-0.5"
                  : "text-[#872519] hover:text-[#36CAB0] hover:border-[#36CAB0] hover:bg-[#36CAB0]/5"
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