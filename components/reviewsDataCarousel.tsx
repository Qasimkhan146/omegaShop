"use client";
import React, { useState } from "react";
type ReviewType = {
  rating: number;
  comment: string;
  reviewerName: string;
  isAdmin?: boolean;
};

const ReviewsDataCarousel = ({ reviews }: { reviews: ReviewType[] }) => {
  console.log("REVIEWS RECEIVED:", reviews);
  const [currentIndex, setCurrentIndex] = useState(1);

  const prevReview = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const getVisibleReviews = () => {
    const left = reviews[(currentIndex - 1 + reviews.length) % reviews.length];
    const center = reviews[currentIndex];
    const right = reviews[(currentIndex + 1) % reviews.length];
    return [left, center, right];
  };

  const visibleReviews = getVisibleReviews();

  return (
    <div className="container mx-auto flex flex-col justify-center items-center gap-6 my-10">
      <div className="flex items-center justify-center gap-6 mx-auto">
        {visibleReviews.map((review, idx) => {
          if (!review) return null;

          const isCenter = idx === 1;

          return (
            <div
              key={idx}
              className={`
          ${!isCenter ? "hidden lg:flex" : "flex"} 
          flex-col justify-center items-center gap-5
          transition-transform duration-300 mx-auto
          ${isCenter ? "scale-100 opacity-100" : "scale-90 opacity-50"}
        `}
            >
              <div
                className={`relative text-center text-sm w-auto lg:w-[260px] xl:w-[360px] p-6 rounded-2xl mb-2
    ${
      isCenter
        ? "bg-[var(--primary-red)] text-white"
        : "bg-gray-200 text-gray-700"
    }
    after:content-[''] after:absolute after:left-1/2 after:-bottom-9
    after:-translate-x-1/2 after:border-[20px] after: after:border-transparent
    ${isCenter ? "after:border-t-[var(--primary-red)]" : ""}
  `}
              >
                {/* Stars inside p */}
                {isCenter && (
                  <p className="flex justify-center mb-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-300 text-2xl mx-1">
                        ★
                      </span>
                    ))}
                  </p>
                )}
                {review.comment}
              </div>

              <div className="text-center">
                <p
                  className={`font-semibold ${
                    isCenter ? "text-black" : "text-gray-500"
                  }`}
                >
                  {review.reviewerName}
                </p>
                <p
                  className={`text-sm ${
                    isCenter ? "text-black" : "text-gray-400"
                  }`}
                >
                  Customer
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={prevReview}
          className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md"
        >
          ←
        </button>
        <button
          onClick={nextReview}
          className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default ReviewsDataCarousel;
