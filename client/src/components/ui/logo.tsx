import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  // Using the screenshot with the framed logo
  return (
    <Link href="/">
      <div className={cn("flex justify-center items-center mb-4 sm:mb-8", className)}>
        <img 
          src="/new_logo_with_frame.png?t=20250325"
          alt="Kestía Boracay Logo" 
          className="h-20 sm:h-28 md:h-36 w-auto object-contain"
        />
      </div>
    </Link>
  );
}