import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  // Using the newly created copy of the logo
  return (
    <Link href="/">
      <div className={cn("flex justify-center items-center mb-4 sm:mb-8", className)}>
        <img 
          src="/kestia_logo_new.png?nocache=123456789"
          alt="Kestía Boracay Logo" 
          className="h-16 sm:h-24 md:h-32 w-auto"
        />
      </div>
    </Link>
  );
}