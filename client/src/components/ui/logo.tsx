import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex justify-center mb-8", className)}>
      <img
        src="/logo.jpg"
        alt="Kestía Boracay Logo"
        className="h-24 w-auto"
      />
    </div>
  );
}