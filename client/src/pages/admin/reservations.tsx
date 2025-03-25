import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AdminLayout } from "@/components/layout/admin-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Reservation, ReservationStatus } from "@shared/schema";
import { reservationStatuses } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {format} from 'date-fns'

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

  const getEventColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#22c55e";
      case "cancelled":
        return "#ef4444";
      case "completed":
        return "#3b82f6";
      default:
        return "#eab308";
    }
  };

  const events = reservations?.map(reservation => {
    // Parse date and time, ensuring correct format for FullCalendar
    const [year, month, day] = reservation.date.split('-').map(Number);
    const [hours, minutes] = reservation.time.split(':').map(Number);

    // Format start time
    const startTime = `${reservation.date}T${reservation.time}:00`;

    // Calculate end time (2 hours later)
    const endHours = hours + 2;
    const endTime = `${reservation.date}T${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

    return {
      id: reservation.id.toString(),
      title: `${reservation.name} (${reservation.guests} guests)`,
      start: startTime,
      end: endTime,
      backgroundColor: getEventColor(reservation.status),
      extendedProps: reservation
    };
  }) || [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Calendar View */}
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            eventClick={info => {
              const reservation = info.event.extendedProps as Reservation;
              toast({
                title: reservation.name,
                description: (
                  <div className="mt-2 space-y-1">
                    <p>Guests: {reservation.guests}</p>
                    <p>Phone: {reservation.phone}</p>
                    <p>Email: {reservation.email}</p>
                    <p>Notes: {reservation.notes || 'No notes'}</p>
                    <Select
                      defaultValue={reservation.status}
                      onValueChange={(value: ReservationStatus) => 
                        statusMutation.mutate({ id: reservation.id, status: value })
                      }
                    >
                      <SelectTrigger className={`w-full mt-2 ${getStatusColor(reservation.status)}`}>
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
                ),
              });
            }}
            slotMinTime="11:00:00"
            slotMaxTime="23:00:00"
            height="auto"
            aspectRatio={1.8}
            allDaySlot={false}
            slotDuration="00:30:00"
            slotLabelInterval="01:00"
            scrollTime="11:00:00"
            nowIndicator={true}
            eventDisplay="block"
            displayEventTime={true}
            displayEventEnd={true}
          />
        </div>

        {/* List View */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#872519]">All Reservations</h2>
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
        </div>
      </div>
    </AdminLayout>
  );
}