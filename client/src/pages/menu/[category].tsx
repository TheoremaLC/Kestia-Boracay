import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import CategoryNav from "@/components/menu/category-nav";
import MenuItem from "@/components/menu/menu-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/ui/logo";
import type { MenuItem as MenuItemType } from "@shared/schema";

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
            if (category === "breakfast" && item.name === "EXTRAS_SECTION") {
              return (
                <div key={`section-${index}`} className="mt-6">
                  <MenuItem 
                    item={{ 
                      ...item,
                      name: "Extras" 
                    }} 
                    isSubsectionTitle={true} 
                  />
                  <div className="mt-2 divide-[#872519]/10">
                    {menuItems.slice(index + 1).map(extraItem => (
                      <MenuItem 
                        key={extraItem.id} 
                        item={extraItem} 
                        isExtra={true} 
                      />
                    ))}
                  </div>
                </div>
              );
            }
            if (category === "breakfast" && menuItems.find((i, idx) => idx < index && i.name === "EXTRAS_SECTION")) {
              return null; 
            }
            return <MenuItem key={item.id} item={item} />;
          })}
        </div>
      )}
    </div>
  );
}