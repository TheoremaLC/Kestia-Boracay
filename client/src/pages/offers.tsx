import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { Clock } from "lucide-react";

export default function Offers() {
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
    </div>
  );
}