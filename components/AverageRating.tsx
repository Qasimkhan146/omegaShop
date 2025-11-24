const AverageStars = ({ rating }: { rating: number }) => {
  const totalStars = 5;

  return (
    <div className="flex flex-row gap-1 text-yellow-400 text-lg">
      {Array.from({ length: totalStars }).map((_, i) => {
        const filled = i + 1 <= Math.floor(rating);
        const half = i < rating && i + 1 > rating; // e.g. rating = 3.3 → 4th star becomes half

        return (
          <span key={i}>
            {filled ? (
              "★"
            ) : half ? (
              <span className="relative inline-block w-5">
                <span className="absolute left-0 top-0 w-1/2 overflow-hidden">
                  ★
                </span>
                <span className="text-gray-300">★</span>
              </span>
            ) : (
              <span className="text-gray-300">★</span>
            )}
          </span>
        );
      })}
    </div>
  );
};

export default AverageStars;
