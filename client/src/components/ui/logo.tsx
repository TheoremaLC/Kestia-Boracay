import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  // Using the new SVG logo with cache-busting
  const logoSrc = `/kestia_logo_page2.svg?v=${Date.now()}`;
  
  return (
    <Link href="/">
      <div className={cn("flex justify-center items-center mb-4 sm:mb-8", className)}>
        <img 
          src={logoSrc}
          alt="Kestía Boracay Logo" 
          className="h-16 sm:h-24 md:h-32 w-auto mix-blend-multiply"
        />
      </div>
    </Link>
  );
}