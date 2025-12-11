import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  selectedImage: number;
  onSelectImage: (index: number) => void;
}

export function ProductGallery({
  images,
  productName,
  selectedImage,
  onSelectImage,
}: ProductGalleryProps) {
  return (
    <div className="space-y-4">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <img
          src={images[selectedImage]}
          alt={`${productName} - ${selectedImage + 1}`}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectImage(index)}
            className={cn(
              "aspect-square overflow-hidden rounded-lg bg-gray-100",
              selectedImage === index ? "ring-2 ring-primary" : ""
            )}
          >
            <img
              src={image}
              alt={`${productName} - ${index + 1}`}
              className="h-full w-full object-cover object-center"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
