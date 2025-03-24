import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/">
      <a className={cn("flex justify-center items-center mb-4 sm:mb-8", className)}>
        <img 
          src="/kestia_logo_page5.png"
          alt="Kestía Boracay Logo" 
          className="h-16 sm:h-24 md:h-32 w-auto mix-blend-multiply"
        />
      </a>
    </Link>
  );
}