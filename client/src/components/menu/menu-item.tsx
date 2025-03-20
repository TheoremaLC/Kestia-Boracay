import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MenuItem } from "@shared/schema";

interface MenuItemProps {
  item: MenuItem;
}

export default function MenuItem({ item }: MenuItemProps) {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg">{item.name}</CardTitle>
          <span className="text-base sm:text-lg font-bold whitespace-nowrap">₱{(item.price / 100).toFixed(2)}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <CardDescription className="text-sm sm:text-base">{item.description}</CardDescription>
      </CardContent>
    </Card>
  );
}