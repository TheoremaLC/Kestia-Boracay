import { useQuery } from "@tanstack/react-query";
import CategoryNav from "@/components/menu/category-nav";
import MenuItem from "@/components/menu/menu-item";
import { Skeleton } from "@/components/ui/skeleton";
import type { MenuItem as MenuItemType } from "@shared/schema";

export default function Menu() {
  const { data: menuItems, isLoading } = useQuery<MenuItemType[]>({
    queryKey: ["/api/menu"],
  });

  return (
    <div>
      <h1 className="mb-6 text-4xl font-bold">Our Menu</h1>
      <CategoryNav />
      
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-48 w-full" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems?.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
