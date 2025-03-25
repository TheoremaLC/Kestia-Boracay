import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  // Using the newly uploaded logo with frame
  return (
    <Link href="/">
      <div className={cn("flex justify-center items-center mb-4 sm:mb-8", className)}>
        <img 
          src="/kestia_logo_page2.png?t=20250326"
          alt="Kestía Boracay Logo" 
          className="h-20 sm:h-28 md:h-36 w-auto object-contain"
        />
      </div>
    </Link>
  );
}