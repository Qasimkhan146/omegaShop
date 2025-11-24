"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "@deemlol/next-icons";

// Define the prop type for productImages
interface ProductCarouselProps {
  productImages: string[]; // Expecting an array of strings (image URLs)
}

const ProductCarousel = ({ productImages = [] }: ProductCarouselProps) => {
  const [current, setCurrent] = useState(0); // Start at index 0
  const [isAnimating, setIsAnimating] = useState(true);
  const DOTS = 4;
  const [dotIndex, setDotIndex] = useState(0);

  const hasAtLeastOne = productImages && productImages.length > 0; // Ensure the images array is not empty

  const extendedImages = hasAtLeastOne
    ? [
        productImages[productImages.length - 1],
        ...productImages,
        productImages[0],
      ]
    : [];

  const maxIndex = extendedImages.length - 1;

  useEffect(() => {
    if (!hasAtLeastOne) return;
    setIsAnimating(false);
    setCurrent(1);
    const t = setTimeout(() => setIsAnimating(true), 50);
    return () => clearTimeout(t);
  }, [hasAtLeastOne, productImages.length]);

  useEffect(() => {
    if (!hasAtLeastOne) return;
    const id = setInterval(() => {
      setDotIndex((d) => (d + 1) % DOTS);
      setCurrent((prev) => {
        if (prev >= maxIndex) return prev;
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [hasAtLeastOne, maxIndex]);

  const handleTransitionEnd = () => {
    if (!hasAtLeastOne) return;
    if (current === maxIndex) {
      setIsAnimating(false);
      setCurrent(1);
      setTimeout(() => setIsAnimating(true), 50);
    } else if (current === 0) {
      setIsAnimating(false);
      setCurrent(productImages.length);
      setTimeout(() => setIsAnimating(true), 50);
    }
  };

  const nextSlide = () => {
    if (!hasAtLeastOne) return;
    setDotIndex((d) => (d + 1) % DOTS);
    setCurrent((prev) => {
      if (prev >= maxIndex) {
        setIsAnimating(false);
        setCurrent(1);
        setTimeout(() => setIsAnimating(true), 50);
        return prev;
      }
      return prev + 1;
    });
  };

  const prevSlide = () => {
    if (!hasAtLeastOne) return;
    setDotIndex((d) => (d - 1 + DOTS) % DOTS);
    setCurrent((prev) => {
      if (prev <= 0) {
        setIsAnimating(false);
        setCurrent(productImages.length);
        setTimeout(() => setIsAnimating(true), 50);
        return prev;
      }
      return prev - 1;
    });
  };

  const goToDot = (index: number) => {
    setDotIndex(index);
    if (!hasAtLeastOne) return;
    const targetReal = productImages.length ? index % productImages.length : 0;
    setIsAnimating(true);
    setCurrent(targetReal + 1);
  };

  if (!hasAtLeastOne) {
    return (
      <div className="relative w-full max-w-lg mx-auto">
        <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-2xl">
          <p>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="relative w-full max-w-lg mx-auto overflow-hidden rounded-2xl">
        <div
          className={`flex ${
            isAnimating ? "transition-transform duration-700 ease-in-out" : ""
          }`}
          style={{ transform: `translateX(-${current * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedImages.map((src, i) => (
            <div key={`${src}-${i}`} className="flex-shrink-0 w-full">
              <Image
                src={src}
                alt={`Slide ${i + 1}`}
                width={500}
                height={500}
                className="object-contain"
                unoptimized
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/images/product.svg";
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: DOTS }).map((_, index) => {
          const isActive = index === dotIndex;
          return (
            <button
              key={index}
              className={`h-3 rounded-full transition-all ${
                isActive ? "w-6 bg-red-500" : "w-3 bg-gray-300"
              }`}
              onClick={() => goToDot(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProductCarousel;
