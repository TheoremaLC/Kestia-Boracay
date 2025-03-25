import type { MenuItem } from "@shared/schema";
import { FaStar } from "react-icons/fa";

interface MenuItemProps {
  item: MenuItem;
  isSubsectionTitle?: boolean;
  isExtra?: boolean;
  index?: number;
}

export default function MenuItem({ item, isSubsectionTitle, isExtra, index }: MenuItemProps) {
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
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange text-white font-bold text-xs mr-1">
          {index !== undefined ? index + 1 : item.id}
        </span>
        <span className="flex-grow text-sm sm:text-base md:text-lg font-medium color-burgundy group-hover:translate-x-1 transition-transform flex items-center">
          {item.name}
          <FaStar className="inline-block ml-1 text-xs text-amber-500" />
        </span>
        <span className="text-sm sm:text-base font-bold color-orange opacity-90 group-hover:opacity-100">
          ₱{(item.price / 100).toFixed(2)}
        </span>
      </div>
    );
  }

  return (
    <div className="group py-3 sm:py-4 px-2 transition-all duration-300 hover:bg-white/20 rounded-lg">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-burgundy text-white font-bold text-sm">
            {index !== undefined ? index + 1 : item.id}
          </span>
          <h3 className="text-base sm:text-lg md:text-xl font-semibold color-burgundy">
            {item.name}
            <FaStar className="inline-block ml-1 text-sm text-amber-500" />
          </h3>
        </div>
        <span className="text-base sm:text-lg font-bold whitespace-nowrap color-orange">
          ₱{(item.price / 100).toFixed(2)}
        </span>
      </div>
      {item.description && (
        <p className="text-sm sm:text-base font-medium color-burgundy ml-8">
          {item.description}
        </p>
      )}
    </div>
  );
}