import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex justify-center mb-8", className)}>
      <img
        src="/481115535_122093878172796902_672933496291014049_n.jpg"
        alt="Kestía Boracay Logo"
        className="h-24 w-auto"
      />
    </div>
  );
}
