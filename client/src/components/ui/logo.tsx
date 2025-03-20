import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex justify-center items-center mb-8 gap-4", className)}>
      <span className="text-2xl font-semibold text-primary">Kestía</span>
      <img
        src="/logo.jpg"
        alt="Kestía Boracay Logo"
        className="h-24 w-auto"
      />
      <span className="text-2xl font-semibold text-primary">Boracay</span>
    </div>
  );
}