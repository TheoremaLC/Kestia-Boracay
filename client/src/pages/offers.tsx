import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { MenuItem } from "@shared/schema";

export default function Offers() {
  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const specialItems = menuItems?.filter((item) => item.isSpecial);

  return (
    <div>
      <h1 className="mb-6 text-4xl font-bold">Special Offers</h1>
      
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {specialItems?.map((item) => (
            <Card key={item.id} className="overflow-hidden">
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
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>Special Price: ₱{(item.price / 100).toFixed(2)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
