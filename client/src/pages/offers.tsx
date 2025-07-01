import { useQuery } from "@tanstack/react-query";
import { Logo } from "@/components/ui/logo";
import { Clock } from "lucide-react";

interface OfferItem {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
}

export default function Offers() {
  const { data: offers, isLoading } = useQuery<OfferItem[]>({
    queryKey: ["/api/offers/active"],
  });

  const formatPrice = (price: number) => {
    return `₱${(price / 100).toFixed(0)}`;
  };

  return (
    <div className="pb-32">
      <Logo />

      <div className="text-center space-y-4">
        <div className="flex flex-col items-center gap-2">
          <Clock className="h-8 w-8 text-[#E85303]" />
          <h1 className="text-4xl font-extrabold group drop-shadow-lg">
            <span className="text-[#872519] group-hover:text-[#a32a1d] transition-colors duration-300 hover:text-shadow">H</span>
            <span className="text-[#a32a1d] group-hover:text-[#bf3022] transition-colors duration-300 hover:text-shadow">a</span>
            <span className="text-[#bf3022] group-hover:text-[#d53727] transition-colors duration-300 hover:text-shadow">p</span>
            <span className="text-[#d53727] group-hover:text-[#e0442c] transition-colors duration-300 hover:text-shadow">p</span>
            <span className="text-[#e0442c] group-hover:text-[#e85303] transition-colors duration-300 hover:text-shadow">y</span>
            <span className="text-[#e85303] group-hover:text-[#f06306] transition-colors duration-300 hover:text-shadow"> </span>
            <span className="text-[#f06306] group-hover:text-[#f37509] transition-colors duration-300 hover:text-shadow">H</span>
            <span className="text-[#f37509] group-hover:text-[#f2860b] transition-colors duration-300 hover:text-shadow">o</span>
            <span className="text-[#f2860b] group-hover:text-[#eb9812] transition-colors duration-300 hover:text-shadow">u</span>
            <span className="text-[#eb9812] group-hover:text-[#872519] transition-colors duration-300 hover:text-shadow">r</span>
          </h1>
          <p className="text-lg text-[#872519]/80 font-medium">Every day <span className="font-bold">16:00h - 19:00h</span></p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading offers...</div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
            {offers?.map((offer) => (
              <div key={offer.id} className="group text-center hover:transform hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-lg font-semibold text-[#872519]">{offer.name}</h3>
                <p className="text-2xl font-bold text-[#E85303]">{formatPrice(offer.price)}</p>
              </div>
            ))}
          </div>
        )}

        {offers && offers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No offers available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}