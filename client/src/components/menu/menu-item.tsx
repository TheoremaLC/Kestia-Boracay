import type { MenuItem } from "@shared/schema";

interface MenuItemProps {
  item: MenuItem;
  isSubsectionTitle?: boolean;
  isExtra?: boolean;
}

export default function MenuItem({ item, isSubsectionTitle, isExtra }: MenuItemProps) {
  if (isSubsectionTitle) {
    return (
      <div className="mt-6 sm:mt-8 mb-2 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-[#872519]">{item.name}</h2>
      </div>
    );
  }

  if (isExtra) {
    return (
      <div className="group flex items-center gap-2 sm:gap-4 py-2 sm:py-3 px-2 transition-all duration-300 hover:bg-white/20 rounded-lg">
        <span className="flex-grow text-xs sm:text-sm font-medium text-[#872519] group-hover:translate-x-1 transition-transform">
          {item.name}
        </span>
        <span className="text-xs sm:text-sm font-bold text-[#E85303] opacity-90 group-hover:opacity-100">
          ₱{(item.price / 100).toFixed(2)}
        </span>
      </div>
    );
  }

  return (
    <div className="group py-3 sm:py-4 px-2 transition-all duration-300 hover:bg-white/20 rounded-lg">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="text-sm sm:text-base font-semibold text-[#872519]">{item.name}</h3>
        <span className="text-sm sm:text-base font-bold whitespace-nowrap text-[#E85303]">
          ₱{(item.price / 100).toFixed(2)}
        </span>
      </div>
      {item.description && (
        <p className="text-xs sm:text-sm font-medium text-[#872519]/80">{item.description}</p>
      )}
    </div>
  );
}