import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MenuItem } from "@shared/schema";

interface MenuItemProps {
  item: MenuItem;
  isSubsectionTitle?: boolean;
  isExtra?: boolean;
}

export default function MenuItem({ item, isSubsectionTitle, isExtra }: MenuItemProps) {
  if (isSubsectionTitle) {
    return (
      <div className="mt-8 mb-4">
        <h2 className="text-xl font-semibold text-[#872519]">{item.name}</h2>
      </div>
    );
  }

  if (isExtra) {
    return (
      <div className="group flex items-center gap-4 py-3 px-2 transition-all duration-300 hover:bg-white/30 rounded-lg">
        <span className="flex-grow text-sm font-medium text-[#872519] group-hover:translate-x-1 transition-transform">
          {item.name}
        </span>
        <span className="text-sm font-bold text-[#E85303] opacity-90 group-hover:opacity-100">
          ₱{(item.price / 100).toFixed(2)}
        </span>
      </div>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-white/40 hover:bg-white/50 transition-all duration-500 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">{item.name}</CardTitle>
          <span className="text-base font-bold whitespace-nowrap text-[#E85303]">
            ₱{(item.price / 100).toFixed(2)}
          </span>
        </div>
      </CardHeader>
      {item.description && (
        <CardContent className="p-3 sm:p-4 pt-0">
          <CardDescription className="text-sm font-medium text-[#872519]/80">{item.description}</CardDescription>
        </CardContent>
      )}
    </Card>
  );
}