import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MenuItem } from "@shared/schema";

interface MenuItemProps {
  item: MenuItem;
}

export default function MenuItem({ item }: MenuItemProps) {
  return (
    <Card className="overflow-hidden">
      {item.imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{item.name}</CardTitle>
          <span className="text-lg font-bold">₱{(item.price / 100).toFixed(2)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{item.description}</CardDescription>
      </CardContent>
    </Card>
  );
}
