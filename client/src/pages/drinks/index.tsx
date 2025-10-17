import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { MenuItem as MenuItemType } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import MenuItem from "@/components/menu/menu-item";
import DrinkCategoryNav from "@/components/drinks/drink-category-nav";
import { FaStar } from "react-icons/fa";
import { Search } from "lucide-react";

export default function Drinks() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: drinkItems, isLoading } = useQuery<MenuItemType[]>({
    queryKey: ["/api/drinks"],
  });

  const filteredItems = drinkItems?.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="pb-32">
      <Logo />
      <DrinkCategoryNav />
      
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search drinks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-burgundy/30 focus:border-burgundy"
            data-testid="input-search-drinks-main"
          />
        </div>
      </div>

      <div className="px-4 py-2 mb-4 border border-dashed border-burgundy rounded-lg bg-white/50">
        <p className="text-sm text-center flex items-center justify-center gap-1.5">
          <FaStar className="text-[rgb(var(--color-yellow))] h-5 w-5" /> 
          <span className="color-burgundy font-medium">Items marked with a star symbol should be confirmed for availability with your server.</span>
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-24 w-full" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems?.map((item) => (
            <MenuItem 
              key={item.id}
              item={item} 
            />
          ))}
        </div>
      )}
    </div>
  );
}