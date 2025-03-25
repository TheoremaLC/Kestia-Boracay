import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/ui/logo";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import type { Event } from "@shared/schema";

export default function Events() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  return (
    <div>
      <Logo />
      <div className="flex flex-col items-center gap-2 mb-6">
        <Calendar className="h-8 w-8 text-[#E85303]" />
        <h1 className="text-3xl font-extrabold group drop-shadow-lg text-center">
          <span className="text-[#872519] group-hover:text-[#a32a1d] transition-colors duration-300 hover:text-shadow">U</span>
          <span className="text-[#a32a1d] group-hover:text-[#bf3022] transition-colors duration-300 hover:text-shadow">p</span>
          <span className="text-[#bf3022] group-hover:text-[#d53727] transition-colors duration-300 hover:text-shadow">c</span>
          <span className="text-[#d53727] group-hover:text-[#e0442c] transition-colors duration-300 hover:text-shadow">o</span>
          <span className="text-[#e0442c] group-hover:text-[#e85303] transition-colors duration-300 hover:text-shadow">m</span>
          <span className="text-[#e85303] group-hover:text-[#f06306] transition-colors duration-300 hover:text-shadow">i</span>
          <span className="text-[#f06306] group-hover:text-[#f37509] transition-colors duration-300 hover:text-shadow">n</span>
          <span className="text-[#f37509] group-hover:text-[#f2860b] transition-colors duration-300 hover:text-shadow">g</span>
          <span className="text-[#f2860b] group-hover:text-[#eb9812] transition-colors duration-300 hover:text-shadow"> </span>
          <span className="text-[#eb9812] group-hover:text-[#e2ab1a] transition-colors duration-300 hover:text-shadow">E</span>
          <span className="text-[#e2ab1a] group-hover:text-[#d5be23] transition-colors duration-300 hover:text-shadow">v</span>
          <span className="text-[#d5be23] group-hover:text-[#bfd12c] transition-colors duration-300 hover:text-shadow">e</span>
          <span className="text-[#bfd12c] group-hover:text-[#a2d935] transition-colors duration-300 hover:text-shadow">n</span>
          <span className="text-[#a2d935] group-hover:text-[#78d95e] transition-colors duration-300 hover:text-shadow">t</span>
          <span className="text-[#78d95e] group-hover:text-[#36cab0] transition-colors duration-300 hover:text-shadow">s</span>
        </h1>
      </div>

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
          {events?.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              {event.imageUrl && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>
                  {format(new Date(event.date), "MMMM dd, yyyy 'at' h:mm a")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{event.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}