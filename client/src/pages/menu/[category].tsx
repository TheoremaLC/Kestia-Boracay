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
    // Add shorter staleTime to refetch data more frequently
    staleTime: 1000, // 1 second
    // Add refetchInterval to periodically check for updates
    refetchInterval: 5000, // 5 seconds
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
          {menuItems?.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}