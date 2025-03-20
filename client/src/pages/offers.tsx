import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/ui/logo";
import type { MenuItem } from "@shared/schema";
import { Clock } from "lucide-react";

export default function Offers() {
  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const specialItems = menuItems?.filter((item) => item.isSpecial);

  return (
    <div>
      <Logo />

      {/* Happy Hour Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-amber-500" />
            <CardTitle>Happy Hour</CardTitle>
          </div>
          <CardDescription>Every day 16:00 - 19:00</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">SMB</h3>
              <p className="text-2xl font-bold text-amber-500">₱70</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">SML</h3>
              <p className="text-2xl font-bold text-amber-500">₱80</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Red Horse</h3>
              <p className="text-2xl font-bold text-amber-500">₱80</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Rum Coke</h3>
              <p className="text-2xl font-bold text-amber-500">₱100</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Menu Items Section */}
      <h2 className="mb-6 text-2xl font-bold">Special Menu Items</h2>

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
            <Card key={item.id}>
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