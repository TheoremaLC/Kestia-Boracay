import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
      <h1 className="mb-6 text-4xl font-bold">Photo Gallery</h1>
      
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
