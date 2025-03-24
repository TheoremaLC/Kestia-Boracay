import { useQuery } from "@tanstack/react-query";
import CategoryNav from "@/components/menu/category-nav";
import MenuItem from "@/components/menu/menu-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/ui/logo";
import type { MenuItem as MenuItemType } from "@shared/schema";

export default function Menu() {
  const { data: menuItems, isLoading } = useQuery<MenuItemType[]>({
    queryKey: ["/api/menu"],
  });

  return (
    <div className="relative">
      {/* Decorative palm trees */}
      <div className="absolute top-0 -right-4 md:-right-12 lg:-right-24 w-32 md:w-48 opacity-10 pointer-events-none">
        <img
          src="/kestia_palm_trees_cropped.svg"
          alt=""
          className="w-full h-auto"
        />
      </div>
      <div className="absolute top-1/2 -left-4 md:-left-12 lg:-left-24 w-32 md:w-48 opacity-10 pointer-events-none transform -scale-x-100">
        <img
          src="/kestia_palm_trees_cropped.svg"
          alt=""
          className="w-full h-auto"
        />
      </div>

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