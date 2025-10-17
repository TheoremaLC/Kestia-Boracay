import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CategoryNav from "@/components/menu/category-nav";
import MenuItem from "@/components/menu/menu-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import type { MenuItem as MenuItemType } from "@shared/schema";
import { FaStar } from "react-icons/fa";
import { Search } from "lucide-react";

export default function Menu() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: menuItems, isLoading } = useQuery<MenuItemType[]>({
    queryKey: ["/api/menu"],
  });

  const filteredItems = menuItems?.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="pb-32">
      <Logo />
      <CategoryNav />
      
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
          <div className="relative rounded-lg p-[3px] bg-gradient-to-r from-[#872519] via-[#FF6B35] via-[#36CAB0] to-[#872519]">
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-14 text-lg bg-white border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:bg-gradient-to-r placeholder:from-[#872519] placeholder:via-[#FF6B35] placeholder:via-[#36CAB0] placeholder:to-[#872519] placeholder:bg-clip-text placeholder:text-transparent placeholder:font-medium"
              data-testid="input-search-menu-main"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-2 mb-4 border border-dashed border-burgundy rounded-lg bg-white/50">
        <p className="text-sm text-center flex items-center justify-center gap-1.5">
          <FaStar className="text-[rgb(var(--color-yellow))] h-5 w-5" /> 
          <span className="color-burgundy font-medium">Items marked with a star symbol should be confirmed for availability with your server. Daily menu may vary.</span>
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
          {filteredItems?.map((item, index) => {
            // If this is the EXTRAS_SECTION header
            if (item.name === "EXTRAS_SECTION") {
              return (
                <div key={item.id} className="mt-6">
                  {/* Render the EXTRAS title */}
                  <MenuItem 
                    key={item.id}
                    item={{ 
                      ...item,
                      name: "EXTRAS" 
                    }} 
                    isSubsectionTitle={true} 
                  />
                </div>
              );
            }
            
            // FINALIZED CONFIGURATION - DO NOT MODIFY
            // Extras are items with IDs 8-19 inclusive (ID 20 Quiche Lorraine is not an extra)
            const isExtraItem = item.id >= 8 && item.id <= 19;
            
            // CRITICAL RULE: Extras must be displayed starting at ID 7 instead of ID 8
            // This adjustment must be preserved exactly as implemented here to maintain 
            // global menu consistency - every extras item displays as (original ID - 1)
            const displayNumber = isExtraItem ? item.id - 1 : item.id;
            
            // Render menu items (with isExtra=true for items with IDs 8-19)
            return <MenuItem 
              key={item.id} 
              item={{...item, displayNumber}} 
              isExtra={isExtraItem} 
            />;
          })}
        </div>
      )}
    </div>
  );
}