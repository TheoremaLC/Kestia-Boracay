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
        <h2 className="text-xl font-semibold text-primary">{item.name}</h2>
      </div>
    );
  }

  if (isExtra) {
    return (
      <div className="py-2 flex justify-between items-center border-b last:border-b-0">
        <span className="text-sm font-normal">{item.name}</span>
        <span className="text-sm font-medium">₱{(item.price / 100).toFixed(2)}</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">{item.name}</CardTitle>
          <span className="text-base font-bold whitespace-nowrap">₱{(item.price / 100).toFixed(2)}</span>
        </div>
      </CardHeader>
      {item.description && (
        <CardContent className="p-3 sm:p-4 pt-0">
          <CardDescription className="text-sm font-normal">{item.description}</CardDescription>
        </CardContent>
      )}
    </Card>
  );
}