import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Logo } from "@/components/ui/logo";

const galleryImages = [
  {
    src: "https://source.unsplash.com/featured/?restaurant,interior",
    alt: "Restaurant Interior",
  },
  {
    src: "https://source.unsplash.com/featured/?cocktail,bar",
    alt: "Bar Area",
  },
  {
    src: "https://source.unsplash.com/featured/?swimming,pool",
    alt: "Pool",
  },
  {
    src: "https://source.unsplash.com/featured/?beach,sunset",
    alt: "Beach View",
  },
  {
    src: "https://source.unsplash.com/featured/?food,gourmet",
    alt: "Signature Dish",
  },
  {
    src: "https://source.unsplash.com/featured/?dining,table",
    alt: "Dining Setup",
  },
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div>
      <Logo />
      <h1 className="mb-6 text-3xl md:text-4xl lg:text-5xl font-extrabold group drop-shadow-lg text-center">
        <span className="text-[#872519] group-hover:text-[#a32a1d] transition-colors duration-300 hover:text-shadow">P</span>
        <span className="text-[#a32a1d] group-hover:text-[#bf3022] transition-colors duration-300 hover:text-shadow">h</span>
        <span className="text-[#bf3022] group-hover:text-[#d53727] transition-colors duration-300 hover:text-shadow">o</span>
        <span className="text-[#d53727] group-hover:text-[#e0442c] transition-colors duration-300 hover:text-shadow">t</span>
        <span className="text-[#e0442c] group-hover:text-[#e85303] transition-colors duration-300 hover:text-shadow">o</span>
        <span className="text-[#e85303] group-hover:text-[#f06306] transition-colors duration-300 hover:text-shadow"> </span>
        <span className="text-[#f06306] group-hover:text-[#f37509] transition-colors duration-300 hover:text-shadow">G</span>
        <span className="text-[#f37509] group-hover:text-[#f2860b] transition-colors duration-300 hover:text-shadow">a</span>
        <span className="text-[#f2860b] group-hover:text-[#eb9812] transition-colors duration-300 hover:text-shadow">l</span>
        <span className="text-[#eb9812] group-hover:text-[#e2ab1a] transition-colors duration-300 hover:text-shadow">l</span>
        <span className="text-[#e2ab1a] group-hover:text-[#d5be23] transition-colors duration-300 hover:text-shadow">e</span>
        <span className="text-[#d5be23] group-hover:text-[#bfd12c] transition-colors duration-300 hover:text-shadow">r</span>
        <span className="text-[#bfd12c] group-hover:text-[#78d95e] transition-colors duration-300 hover:text-shadow">y</span>
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {galleryImages.map((image, index) => (
          <div
            key={index}
            className="cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-105"
            onClick={() => setSelectedImage(image.src)}
          >
            <AspectRatio ratio={16 / 9}>
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Gallery preview"
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}