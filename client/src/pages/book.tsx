import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { format, addHours } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertReservationSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Logo } from "@/components/ui/logo";

// Time slot generation with 24-hour format
const timeSlots = Array.from({ length: 23 }, (_, i) => {
  const hour = Math.floor(i / 2) + 11;
  const minute = i % 2 === 0 ? "00" : "30";
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  const militaryHour = hour.toString().padStart(2, '0');
  return {
    display: `${displayHour}:${minute} ${ampm}`,
    value: `${militaryHour}:${minute}`
  };
});

export default function Book() {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertReservationSchema.extend({
      date: insertReservationSchema.shape.date,
      time: insertReservationSchema.shape.time,
    })),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "",
      guests: 2,
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const formattedData = {
        ...data,
        guests: Number(data.guests)
      };

      console.log('Sending reservation data:', formattedData); // Debug log

      const response = await apiRequest("POST", "/api/reservations", formattedData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details?.[0]?.message || error.message || 'Failed to make reservation');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reservation Confirmed",
        description: "We look forward to seeing you!",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to make reservation. Please try again.",
        variant: "destructive",
      });
      console.error('Reservation error:', error); // Debug log
    },
  });

  return (
    <div className="mx-auto max-w-2xl pb-32">
      <Logo />
      <h1 className="mb-6 text-2xl font-bold text-center">Book a Table</h1>

      <div className="mb-8 p-4 bg-white/20 rounded-lg text-[#872519]/80">
        <p className="text-sm">
          Note: Table reservations are for a 2-hour dining period. If you'd like to stay longer and 
          there are no other reservations, you're welcome to continue enjoying your time with us.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(field.value)}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : '')}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  <p className="text-xs text-[#872519]/70 mt-1">
                    Standard reservation duration: 2 hours
                  </p>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="guests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Guests</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Requests</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Making Reservation..." : "Book Now"}
          </Button>
        </form>
      </Form>
    </div>
  );
}