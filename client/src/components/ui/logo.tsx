import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/">
      <a className={cn("flex justify-center items-center mb-6 md:mb-8 gap-2 md:gap-4", className)}>
        <span className="text-lg md:text-2xl font-semibold text-primary">Kestía</span>
        <img
          src="/logo.jpg"
          alt="Kestía Boracay Logo"
          className="h-16 md:h-24 w-auto"
        />
        <span className="text-lg md:text-2xl font-semibold text-primary">Boracay</span>
      </a>
    </Link>
  );
}