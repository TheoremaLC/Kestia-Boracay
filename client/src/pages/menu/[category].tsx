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
    <div>
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
            // Add Extras subsection title before extras items
            if (category === "breakfast" && item.name === "Bacon" && index > 0) {
              return (
                <div key={`section-${index}`}>
                  <MenuItem 
                    item={{ 
                      id: -1, 
                      name: "Extras",
                      description: "",
                      price: 0,
                      category: category,
                      imageUrl: null,
                      isSpecial: false 
                    }} 
                    isSubsectionTitle={true} 
                  />
                  <MenuItem key={item.id} item={item} />
                </div>
              );
            }
            return <MenuItem key={item.id} item={item} />;
          })}
        </div>
      )}
    </div>
  );
}