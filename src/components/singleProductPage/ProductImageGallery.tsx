import { useState } from 'react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  isOutOfStock: boolean;
}

export default function ProductImageGallery({ 
  images, 
  productName, 
  isOutOfStock 
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className={`aspect-square bg-white rounded-2xl p-4 sm:p-8 shadow-lg border border-olive/10 relative ${
        isOutOfStock ? 'opacity-75 grayscale' : ''
      }`}>
        <div className="w-full h-full bg-gradient-to-br from-sabbia/20 to-beige/30 rounded-xl flex items-center justify-center relative">
          <img 
            src={images[selectedImage]} 
            alt={productName} 
            className={`object-contain h-full w-full rounded-xl ${
              isOutOfStock ? 'opacity-60' : ''
            }`}
          />
          
          {/* Overlay SOLD OUT sull'immagine */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
              <div className="bg-red-600/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-lg sm:text-2xl shadow-xl transform -rotate-12">
                SOLD OUT
              </div>
            </div>
          )}
        </div>
        
        {/* Badge SOLD OUT nell'angolo */}
        {isOutOfStock && (
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold z-10 shadow-lg animate-pulse">
            SOLD OUT
          </div>
        )}
      </div>
      
      {/* Thumbnail gallery */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`aspect-square bg-white rounded-lg p-1.5 sm:p-2 border-2 transition-all duration-300 cursor-pointer relative ${
              selectedImage === index ? 'border-olive shadow-md' : 'border-olive/10'
            } ${isOutOfStock ? 'opacity-60' : ''}`}
          >
            <img 
              src={img} 
              alt={`${productName} ${index + 1}`} 
              className={`object-contain w-full h-full ${
                isOutOfStock ? 'opacity-60' : ''
              }`}
            />
            {/* Mini overlay su thumbnails */}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                <span className="text-white text-xs font-bold">OUT</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}