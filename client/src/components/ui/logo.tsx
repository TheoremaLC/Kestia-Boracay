import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  // Using your uploaded SVG logo with reddish frame
  return (
    <Link href="/">
      <div className={cn("flex justify-center items-center mb-4 sm:mb-8", className)}>
        <img 
          src={`/kestia_logo_final.svg?v=${Date.now()}`}
          alt="Kestía Boracay Logo" 
          className="h-28 sm:h-40 md:h-48 w-auto object-contain"
        />
      </div>
    </Link>
  );
}