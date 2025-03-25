import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  // Let's try with the logo.jpg file as a test
  const [logoSrc, setLogoSrc] = useState(`/logo.jpg?t=${Date.now()}`);
  
  return (
    <Link href="/">
      <a className={cn("flex justify-center items-center mb-4 sm:mb-8", className)}>
        <img 
          src={logoSrc}
          alt="Kestía Boracay Logo" 
          className="h-16 sm:h-24 md:h-32 w-auto mix-blend-multiply"
        />
      </a>
    </Link>
  );
}