import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  // Using the final SVG logo file with the reddish frame
  return (
    <Link href="/">
      <div className={cn("flex justify-center items-center mb-4 sm:mb-8", className)}>
        <img 
          src={`/kestia_logo_final.svg?timestamp=${new Date().getTime()}`}
          alt="Kestía Boracay Logo" 
          className="h-20 sm:h-28 md:h-36 w-auto object-contain"
        />
      </div>
    </Link>
  );
}