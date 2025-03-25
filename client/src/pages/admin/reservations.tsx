import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Reservation, ReservationStatus } from "@shared/schema";
import { reservationStatuses } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function AdminReservations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery<Reservation[]>({
    queryKey: ["/api/reservations"],
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: ReservationStatus }) => {
      await apiRequest("PATCH", `/api/reservations/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      toast({
        title: "Status updated",
        description: "Reservation status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reservation status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  return (
    <AdminLayout>
      {isLoading ? (
        <div className="text-center">Loading reservations...</div>
      ) : (
        <div className="space-y-4">
          {reservations?.map((reservation) => (
            <div
              key={reservation.id}
              className="p-4 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#872519]">
                    {reservation.name}
                  </h3>
                  <p className="text-sm text-[#872519]/80">
                    {format(new Date(reservation.date), "MMMM d, yyyy")} at{" "}
                    {reservation.time}
                  </p>
                  <p className="text-sm text-[#872519]/80">
                    {reservation.guests} guests
                  </p>
                  <p className="text-sm text-[#872519]/80">
                    Phone: {reservation.phone}
                  </p>
                  <p className="text-sm text-[#872519]/80">
                    Email: {reservation.email}
                  </p>
                  {reservation.notes && (
                    <p className="text-sm text-[#872519]/80 mt-2">
                      Notes: {reservation.notes}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Select
                    defaultValue={reservation.status}
                    onValueChange={(value: ReservationStatus) => 
                      statusMutation.mutate({ id: reservation.id, status: value })
                    }
                  >
                    <SelectTrigger className={`w-[140px] ${getStatusColor(reservation.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reservationStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}