import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/">
      <a className={cn("flex justify-center items-center mb-6 md:mb-8 gap-2 md:gap-4", className)}>
        <span className="text-xl md:text-3xl font-bold bg-gradient-to-r from-[#F6FF6E] to-[#F6FF6E] bg-clip-text text-transparent">Kestía</span>
        <img 
          src="/kestia-logo.svg" 
          alt="Kestía Boracay Logo" 
          className="h-20 md:h-28 w-auto"
        />
        <span className="text-xl md:text-3xl font-bold bg-gradient-to-r from-[#F6FF6E] to-[#F6FF6E] bg-clip-text text-transparent">Boracay</span>
      </a>
    </Link>
  );
}