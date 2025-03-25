import { Link, useLocation } from "wouter";
import { categories } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function CategoryNav() {
  const [location] = useLocation();

  return (
    <nav className="mb-4 sm:mb-8 -mx-2 sm:mx-0 sticky top-0 z-10">
      <div className="flex overflow-x-auto py-3 px-2 sm:px-4 scrollbar-none gap-2 sm:gap-4 bg-white/90 backdrop-blur-sm shadow-sm">
        {categories.map((category, index) => (
          <Link key={category} href={`/menu/${category}`}>
            <div
              className={cn(
                "whitespace-nowrap px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg md:text-xl font-bold transition-all duration-200",
                "rounded-lg border",
                "hover:scale-105 active:scale-95",
                location === `/menu/${category}`
                  ? "gradient-border font-semibold shadow-md transform -translate-y-0.5"
                  : "border-transparent hover:border-[#36CAB0] hover:bg-[#36CAB0]/5"
              )}
            >
              <span className={cn(
                "font-bold", 
                location === `/menu/${category}` 
                  ? "color-burgundy" 
                  : index % 3 === 0 
                    ? "color-burgundy"
                    : index % 3 === 1
                      ? "color-orange"
                      : "color-turquoise"
              )}>
                {category.replace("-", " ").toUpperCase()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}