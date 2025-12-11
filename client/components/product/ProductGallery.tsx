import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  selectedImage?: number;
  onSelectImage?: (index: number) => void;
}

export const ProductGallery = ({
  images,
  productName,
  selectedImage: externalSelectedImage = 0,
  onSelectImage
}: ProductGalleryProps) => {
  const [internalSelectedImage, setInternalSelectedImage] = useState(externalSelectedImage);
  
  // Use external selected image if provided, otherwise use internal state
  const selectedImage = onSelectImage !== undefined ? externalSelectedImage : internalSelectedImage;
  
  const handleSelectImage = (index: number) => {
    if (onSelectImage) {
      onSelectImage(index);
    } else {
      setInternalSelectedImage(index);
    }
  };

  const nextImage = () => {
    const nextIndex = selectedImage === images.length - 1 ? 0 : selectedImage + 1;
    handleSelectImage(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = selectedImage === 0 ? images.length - 1 : selectedImage - 1;
    handleSelectImage(prevIndex);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-50 flex items-center justify-center p-8">
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1.5 shadow-md z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <img
          src={images[selectedImage]}
          alt={`${productName} - ${selectedImage + 1}`}
          className="max-h-full max-w-full object-contain"
        />
        
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1.5 shadow-md z-10"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2 p-4 border-t border-gray-100">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => handleSelectImage(index)}
            className={`w-full h-20 object-cover rounded-md cursor-pointer border-2 transition-colors ${
              index === selectedImage
                ? 'border-emerald-500'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
