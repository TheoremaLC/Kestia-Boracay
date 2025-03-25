import { Logo } from "@/components/ui/logo";
import { Music as MusicIcon } from "lucide-react";

export default function Music() {
  return (
    <div>
      <Logo />
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <MusicIcon className="h-8 w-8 text-[#E85303]" />
          <h1 className="text-3xl font-extrabold group drop-shadow-lg mb-6">
            <span className="text-[#872519] group-hover:text-[#a32a1d] transition-colors duration-300 hover:text-shadow">M</span>
            <span className="text-[#a32a1d] group-hover:text-[#bf3022] transition-colors duration-300 hover:text-shadow">u</span>
            <span className="text-[#bf3022] group-hover:text-[#d53727] transition-colors duration-300 hover:text-shadow">s</span>
            <span className="text-[#d53727] group-hover:text-[#e0442c] transition-colors duration-300 hover:text-shadow">i</span>
            <span className="text-[#e0442c] group-hover:text-[#e85303] transition-colors duration-300 hover:text-shadow">c</span>
            <span className="text-[#e85303] group-hover:text-[#f06306] transition-colors duration-300 hover:text-shadow"> </span>
            <span className="text-[#f06306] group-hover:text-[#f37509] transition-colors duration-300 hover:text-shadow">&</span>
            <span className="text-[#f37509] group-hover:text-[#f2860b] transition-colors duration-300 hover:text-shadow"> </span>
            <span className="text-[#f2860b] group-hover:text-[#eb9812] transition-colors duration-300 hover:text-shadow">E</span>
            <span className="text-[#eb9812] group-hover:text-[#e2ab1a] transition-colors duration-300 hover:text-shadow">n</span>
            <span className="text-[#e2ab1a] group-hover:text-[#d5be23] transition-colors duration-300 hover:text-shadow">t</span>
            <span className="text-[#d5be23] group-hover:text-[#bfd12c] transition-colors duration-300 hover:text-shadow">e</span>
            <span className="text-[#bfd12c] group-hover:text-[#a2d935] transition-colors duration-300 hover:text-shadow">r</span>
            <span className="text-[#a2d935] group-hover:text-[#78d95e] transition-colors duration-300 hover:text-shadow">t</span>
            <span className="text-[#78d95e] group-hover:text-[#55d987] transition-colors duration-300 hover:text-shadow">a</span>
            <span className="text-[#55d987] group-hover:text-[#36cab0] transition-colors duration-300 hover:text-shadow">i</span>
            <span className="text-[#36cab0] group-hover:text-[#872519] transition-colors duration-300 hover:text-shadow">n</span>
            <span className="text-[#872519] group-hover:text-[#a32a1d] transition-colors duration-300 hover:text-shadow">m</span>
            <span className="text-[#a32a1d] group-hover:text-[#bf3022] transition-colors duration-300 hover:text-shadow">e</span>
            <span className="text-[#bf3022] group-hover:text-[#d53727] transition-colors duration-300 hover:text-shadow">n</span>
            <span className="text-[#d53727] group-hover:text-[#e0442c] transition-colors duration-300 hover:text-shadow">t</span>
          </h1>
        </div>
        <p className="text-lg text-[#872519]/80 font-medium">
          Coming soon! Stay tuned for our live music events and entertainment schedule.
        </p>
      </div>
    </div>
  );
}