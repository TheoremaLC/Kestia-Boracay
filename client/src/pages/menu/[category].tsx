import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import CategoryNav from "@/components/menu/category-nav";
import MenuItem from "@/components/menu/menu-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/ui/logo";
import type { MenuItem as MenuItemType } from "@shared/schema";
import { FaStar } from "react-icons/fa";

export default function MenuCategory() {
  const { category } = useParams();

  const { data: menuItems, isLoading } = useQuery<MenuItemType[]>({
    queryKey: ["/api/menu", category],
    queryFn: async () => {
      const response = await fetch(`/api/menu/${category}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch menu items for category: ${category}`);
      }
      return response.json();
    },
    staleTime: 1000,
    refetchInterval: 5000,
  });

  return (
    <div className="pb-32">
      <Logo />
      <CategoryNav />
      
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
          {menuItems?.map((item, index) => {
            if ((category === "breakfast" || category === "vegetarian") && item.name === "EXTRAS_SECTION") {
              return (
                <div key={`section-${index}`} className="mt-6">
                  <MenuItem 
                    item={{ 
                      ...item,
                      name: "EXTRAS" 
                    }} 
                    isSubsectionTitle={true} 
                  />
                  <div className="mt-2 divide-[#872519]/10">
                    {menuItems.slice(index + 1).map((extraItem, extraIndex) => {
                      // FINALIZED CONFIGURATION - DO NOT MODIFY
                      // Critical rule: All extras (with IDs >= 8) must display showing ID-1 
                      // This creates a consistent system where extras start at ID 7 across all menus
                      // This exact implementation must be preserved to maintain global menu consistency
                      const specialDisplayNumber = extraItem.id >= 8 ? extraItem.id - 1 : extraItem.id;
                      return (
                        <MenuItem 
                          key={extraItem.id} 
                          item={{
                            ...extraItem, 
                            displayNumber: specialDisplayNumber
                          }} 
                          isExtra={true}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            }
            if ((category === "breakfast" || category === "vegetarian") && menuItems.find((i, idx) => idx < index && i.name === "EXTRAS_SECTION")) {
              return null; 
            }
            // Always use the original ID from the database
            return <MenuItem key={item.id} item={item} />;
          })}
        </div>
      )}
    </div>
  );
}