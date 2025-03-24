import { Logo } from "@/components/ui/logo";
import { Clock } from "lucide-react";

export default function Offers() {
  return (
    <div className="pb-32">
      <Logo />

      <div className="text-center space-y-4">
        <div className="flex flex-col items-center gap-2">
          <Clock className="h-8 w-8 text-[#E85303]" />
          <h1 className="text-3xl font-bold text-[#872519]">Happy Hour</h1>
          <p className="text-lg text-[#872519]/80 font-medium">Every day 16:00 - 19:00</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
          <div className="group text-center hover:transform hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-lg font-semibold text-[#872519]">SMB</h3>
            <p className="text-2xl font-bold text-[#E85303]">₱70</p>
          </div>

          <div className="group text-center hover:transform hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-lg font-semibold text-[#872519]">SML</h3>
            <p className="text-2xl font-bold text-[#E85303]">₱80</p>
          </div>

          <div className="group text-center hover:transform hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-lg font-semibold text-[#872519]">Red Horse</h3>
            <p className="text-2xl font-bold text-[#E85303]">₱80</p>
          </div>

          <div className="group text-center hover:transform hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-lg font-semibold text-[#872519]">Rum Coke</h3>
            <p className="text-2xl font-bold text-[#E85303]">₱100</p>
          </div>
        </div>
      </div>
    </div>
  );
}