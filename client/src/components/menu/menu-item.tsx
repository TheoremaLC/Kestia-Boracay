import type { MenuItem } from "@shared/schema";
import { FaStar } from "react-icons/fa";

interface MenuItemProps {
  item: MenuItem;
  isSubsectionTitle?: boolean;
  isExtra?: boolean;
  index?: number;
}

export default function MenuItem({ item, isSubsectionTitle, isExtra }: MenuItemProps) {
  if (isSubsectionTitle) {
    return (
      <div className="mt-6 sm:mt-8 mb-2 sm:mb-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold gradient-text">{item.name}</h2>
      </div>
    );
  }

  if (isExtra) {
    return (
      <div className="group flex items-center gap-2 sm:gap-4 py-2 sm:py-3 px-2 transition-all duration-300 hover:bg-white/20 rounded-lg">
        <span className="flex-grow text-sm sm:text-base md:text-lg font-medium gradient-text group-hover:translate-x-1 transition-transform">
          {item.name}
        </span>
        <span className="text-sm sm:text-base font-bold gradient-text opacity-90 group-hover:opacity-100" style={{backgroundImage: 'linear-gradient(90deg, #E85303, #36CAB0)'}}>
          ₱{(item.price / 100).toFixed(2)}
        </span>
      </div>
    );
  }

  return (
    <div className="group py-3 sm:py-4 px-2 transition-all duration-300 hover:bg-white/20 rounded-lg">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="text-base sm:text-lg md:text-xl font-semibold gradient-text">{item.name}</h3>
        <span className="text-base sm:text-lg font-bold whitespace-nowrap gradient-text" style={{backgroundImage: 'linear-gradient(90deg, #E85303, #36CAB0)'}}>
          ₱{(item.price / 100).toFixed(2)}
        </span>
      </div>
      {item.description && (
        <p className="text-sm sm:text-base font-medium" style={{
          background: 'linear-gradient(90deg, rgba(135, 37, 25, 0.9), rgba(135, 37, 25, 0.7))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}>{item.description}</p>
      )}
    </div>
  );
}