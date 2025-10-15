
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Reservation, MenuItem } from "@shared/schema";

interface VisitorStats {
  totalUniqueVisitors: number;
  returningVisitors: number;
  newVisitorsToday: number;
  returningVisitorsToday: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  // const { data: reservations } = useQuery<Reservation[]>({
  //   queryKey: ["/api/reservations"],
  // });
  const reservations: Reservation[] = [];

  const { data: menuItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const { data: visitorStats } = useQuery<VisitorStats>({
    queryKey: ["/api/visitor-stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const todayReservations = reservations?.filter(r => {
    const today = new Date();
    const reservationDate = new Date(r.date);
    return reservationDate.toDateString() === today.toDateString();
  }) || [];

  const pendingReservations = reservations?.filter(r => r.status === "pending") || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Menu Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#872519]">Menu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#872519]">{menuItems?.length || 0}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reservations Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#872519]">Reservations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#872519]">{reservations?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#e85303]">{todayReservations.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#872519]">{pendingReservations.length}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Website Traffic Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#872519]">Website Traffic</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Unique Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#872519]">{visitorStats?.totalUniqueVisitors || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Returning Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#e85303]">{visitorStats?.returningVisitors || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Visitors Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#872519]">{visitorStats?.newVisitorsToday || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Returning Visitors Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#e85303]">{visitorStats?.returningVisitorsToday || 0}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#872519]">Recent Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservations?.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{reservation.name}</p>
                    <p className="text-sm text-gray-600">{reservation.guests} guests</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{reservation.time}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      reservation.status === "confirmed" ? "bg-green-100 text-green-800" :
                      reservation.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      reservation.status === "cancelled" ? "bg-red-100 text-red-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                </div>
              ))}
              {!reservations?.length && (
                <p className="text-gray-500 text-center py-4">No reservations yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
