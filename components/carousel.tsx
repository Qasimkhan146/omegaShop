"use client";
import { useLanguage } from "../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import Image from "next/image";

const Carousel = () => {
  const { language } = useLanguage();
  const t = languageData[language]?.carousel ?? {};

  // Create all slides for seamless loop (3 full sets)
  const allSlides = [];
  for (let set = 0; set < 3; set++) {
    for (let i = 0; i < 9; i++) {
      const slideIndex = set * 9 + i;
      const imageNumber = (i % 9) + 1;

      allSlides.push(
        <div
          key={`slide-${slideIndex}`}
          className="flex justify-center items-center flex-shrink-0"
          style={{
            width: "clamp(80px, 8vw, 160px)",
            marginRight: "30px",
          }}
        >
          <Image
            src={`/images/carousel/img-${imageNumber}.svg`}
            alt={`carousel-image-${imageNumber}`}
            width={80}
            height={80}
            className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain"
          />
        </div>
      );
    }
  }

  return (
    <section className="px-10 sm:px-20 pb-15 max-w-7xl mx-auto">
      <h1 className="font-bold text-[34px] sm:text-[42px] leading-10 sm:leading-13">
        {t.title}
      </h1>
      <p className="text-[var(--gray)] text-base sm:text-xl mt-3">{t.desc}</p>

      <div className="mt-15 overflow-hidden">
        <div className="carousel-container">{allSlides}</div>
      </div>

      <style jsx>{`
        .carousel-container {
          display: flex;
          width: max-content;
          animation: scroll 45s linear infinite;
          will-change: transform;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }

        .carousel-container:hover {
          animation-play-state: paused;
        }

        /* Smooth rendering optimizations */
        .carousel-container {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
};

export default Carousel;
