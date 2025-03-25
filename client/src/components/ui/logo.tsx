import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  // Direct SVG logo rendering instead of using an external file
  return (
    <Link href="/">
      <div className={cn("flex justify-center items-center mb-4 sm:mb-8", className)}>
        <svg 
          version="1.1"
          baseProfile="full"
          width="300" 
          height="100"
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 sm:h-28 md:h-36 w-auto"
        >
          <rect width="100%" height="100%" rx="15" fill="#f8e0e0" />
          <text x="150" y="60" fontSize="40" fontFamily="Arial, sans-serif" 
                fontWeight="bold" textAnchor="middle" fill="#a83232">
            KESTÍA
          </text>
        </svg>
      </div>
    </Link>
  );
}