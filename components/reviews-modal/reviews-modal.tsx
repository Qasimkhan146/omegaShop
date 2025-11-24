// "use client";

// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";

// // Copy the order types here or import from shared file
// type OrderItem = {
//   _id?: string;
//   id?: string;
//   lineItemId: string;
//   productName: string;
//   quantity: number;
//   currency: string;
//   unitAmount: number;
//   images: string[];
// };

// type Order = {
//   orderId: string;
//   orderCode: string;
//   items: OrderItem[];
// };

// type ReviewModalProps = {
//   open: boolean;
//   order: Order | null;
//   onClose: () => void;
// };

// const ReviewModal = ({ open, order, onClose }: ReviewModalProps) => {
//   const [reviews, setReviews] = useState<
//     {
//       lineItemId: string;
//       rating: number;
//       comment: string;
//       productName: string;
//       image: string;
//     }[]
//   >([]);

//   useEffect(() => {
//     if (order) {
//       setReviews(
//         order.items.map((item, index) => ({
//           lineItemId:
//             item.lineItemId ||
//             item._id ||
//             item.id ||
//             `${order.orderId}-${index}`,

//           rating: 0,
//           comment: "",
//           productName: item.productName,
//           image: item.images?.[0] || "/images/product.svg",
//         }))
//       );
//     }
//   }, [order]);

//   const updateReview = (index: number, field: string, value: any) => {
//     setReviews((prev) => {
//       const copy = [...prev];
//       (copy[index] as any)[field] = value;
//       return copy;
//     });
//   };

//   const submitReviews = async () => {
//     if (!order) return;

//     try {
//       const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
//       const res = await fetch(`${baseUrl}/review/add`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({
//           orderId: order.orderCode,
//           items: reviews,
//         }),
//       });

//       const json = await res.json();

//       if (!res.ok) {
//         toast.error(json.message);
//         return;
//       }

//       toast.success("Review added successfully!");
//       onClose();
//     } catch (err) {
//       console.log(err);
//       toast.error("Something went wrong!");
//     }
//   };

//   if (!open || !order) return null;

//   return (
//     <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm ">
//       <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg h-[90vh] overflow-y-auto">
//         <div className="relative">
//           <h2 className="text-xl font-bold mb-4">Add Reviews</h2>
//           {/* add X button */}
//           <button
//             className="absolute top-0 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
//             onClick={onClose}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-6 w-6"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>
//         </div>
//         {reviews.map((rv, index) => (
//           <div
//             key={rv.lineItemId}
//             className="border border-gray-200 p-3 rounded-md mb-3 shadow-md"
//           >
//             <div className="flex items-center gap-3">
//               <img src={rv.image} className="w-16 h-16 rounded-md" />
//               <p className="font-semibold">{rv.productName}</p>
//             </div>

//             <div className="mt-3">
//               <label className="text-sm font-medium block mb-1">
//                 Product Rating
//               </label>

//               <div className="flex items-center gap-2 cursor-pointer">
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <button
//                     key={star}
//                     type="button"
//                     onClick={() => updateReview(index, "rating", star)}
//                     className={`
//           w-5 h-5 flex items-center justify-center rounded-full
//           transition border
//           ${rv.rating >= star ? "bg-red-100 border-0 " : "bg-red-50 border-0 "}
//         `}
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       viewBox="0 0 20 20"
//                       fill={rv.rating >= star ? "#e4002b" : "none"}
//                       stroke="#e4002b"
//                       strokeWidth="1.5"
//                       className="w-3 h-3"
//                     >
//                       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
//                     </svg>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="mt-3">
//               <label className="text-sm font-medium">Comment</label>
//               <textarea
//                 className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-red)]"
//                 value={rv.comment}
//                 onChange={(e) => updateReview(index, "comment", e.target.value)}
//                 placeholder="Write your review..."
//               />
//             </div>
//           </div>
//         ))}

//         <div className="flex justify-end gap-3 mt-4">
//           <button
//             className="px-4 py-2 bg-gray-300 rounded-md cursor-pointer"
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//           <button
//             className="px-4 py-2 bg-red-600 text-white rounded-md cursor-pointer"
//             onClick={submitReviews}
//           >
//             Submit Review
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReviewModal;
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type OrderItem = {
  _id: string; // MUST be MongoDB ObjectId
  productName: string;
  quantity: number;
  currency: string;
  unitAmount: number;
  images: string[];
};

type Order = {
  orderId: string;
  orderCode: string;
  items: OrderItem[];
};

type ReviewModalProps = {
  open: boolean;
  order: Order | null;
  onClose: () => void;
};

const ReviewModal = ({ open, order, onClose }: ReviewModalProps) => {
  const [reviews, setReviews] = useState<
    {
      lineItemId: string;
      rating: number;
      comment: string;
      productName: string;
      image: string;
    }[]
  >([]);

  // Initialize reviews when order changes
  useEffect(() => {
    if (order) {
      setReviews(
        order.items.map((item) => ({
          lineItemId: item._id, // ONLY THIS — backend expects it
          rating: 0,
          comment: "",
          productName: item.productName,
          image: item.images?.[0] || "/images/product.svg",
        }))
      );
    }
  }, [order]);

  const updateReview = (index: number, field: string, value: any) => {
    setReviews((prev) => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      return updated;
    });
  };

  const submitReviews = async () => {
    if (!order) return;

    // Validation
    for (let i = 0; i < reviews.length; i++) {
      if (reviews[i].rating < 1 || reviews[i].rating > 5) {
        toast.error(`Please provide rating 1-5 for ${reviews[i].productName}`);
        return;
      }
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

      const response = await fetch(`${baseUrl}/review/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId: order.orderId, // backend expects real orderId, NOT orderCode
          items: reviews.map((r) => ({
            lineItemId: r.lineItemId,
            rating: r.rating,
            comment: r.comment.trim(),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to submit review");
        return;
      }

      toast.success("Review submitted successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg h-[90vh] overflow-y-auto">
        <div className="relative">
          <h2 className="text-xl font-bold mb-4">Add Reviews</h2>
          <button
            className="absolute top-0 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {reviews.map((rv, index) => (
          <div
            key={rv.lineItemId}
            className="border border-gray-200 p-3 rounded-md mb-3 shadow-md"
          >
            <div className="flex items-center gap-3">
              <img
                src={rv.image}
                className="w-16 h-16 rounded-md"
                alt={rv.productName}
              />
              <p className="font-semibold">{rv.productName}</p>
            </div>

            {/* Rating */}
            <div className="mt-3">
              <label className="text-sm font-medium block mb-1">
                Product Rating
              </label>
              <div className="flex items-center gap-2 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => updateReview(index, "rating", star)}
                    className={`w-5 h-5 flex items-center justify-center rounded-full transition border 
                      ${
                        rv.rating >= star
                          ? "bg-red-100 border-0"
                          : "bg-red-50 border-0"
                      }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mt-3">
              <label className="text-sm font-medium">Comment</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={rv.comment}
                onChange={(e) => updateReview(index, "comment", e.target.value)}
                placeholder="Write your review..."
              />
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-3 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded-md cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md cursor-pointer"
            onClick={submitReviews}
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
