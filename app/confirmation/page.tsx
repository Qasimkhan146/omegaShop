"use client";
import { useLanguage } from "../../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface CartItem {
  attributes: {
    title: string;
    images: string[];
    price: number;
    vatRate: number;
    finalPrice?: number;
  };
  quantity: number;
  selectedPackage?: {
    title: string;
    price: number;
    stock: number;
  };
  isPackage?: boolean;
}

const Confirmation = () => {
  const { language, cartItems, setCartItems } = useLanguage();
  const t = languageData[language]?.confirmation ?? {};
  const router = useRouter();

  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = "/#home";
    router.push(target);
    setTimeout(() => {
      setCartItems([]);
      try {
        localStorage.removeItem("cartItems");
      } catch {}
    }, 50);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  // Update totals calculation for packages
  const { subtotal, vatTotal } = (() => {
    const sub = cartItems.reduce((sum: number, item: CartItem) => {
      if (item.selectedPackage) {
        return sum + item.selectedPackage.price * item.quantity;
      } else {
        const finalPrice = Number(item.attributes?.finalPrice ?? 0);
        return sum + finalPrice * item.quantity;
      }
    }, 0);

    const vat = cartItems.reduce((sum: number, item: CartItem) => {
      if (item.selectedPackage) {
        const packagePrice = item.selectedPackage.price;
        const vatRate = Number(item.attributes?.vatRate ?? 0);
        const basePrice = packagePrice / (1 + vatRate / 100);
        const vatAmount = packagePrice - basePrice;
        return sum + vatAmount * item.quantity;
      } else {
        const finalPrice = Number(item.attributes?.finalPrice ?? 0);
        const vatRate = Number(item.attributes?.vatRate ?? 0);
        const basePrice = finalPrice / (1 + vatRate / 100);
        const vatAmount = finalPrice - basePrice;
        return sum + vatAmount * item.quantity;
      }
    }, 0);

    return { subtotal: sub, vatTotal: vat };
  })();

  const grandTotal = subtotal;

  return (
    <>
      <section className="flex flex-col justify-center items-center min-h-screen px-5">
        {/* text */}
        <div className="flex flex-col justify-center items-center text-center">
          <Image
            src="/images/correct.svg"
            alt="icon"
            width={100}
            height={100}
          />
          <h1 className="text-4xl text-bold text-black mt-4 font-semibold">
            {t.thankyou}
          </h1>
          {/* <p className="text-[#737373] mt-3">{t.time}</p> */}
        </div>

        {/* products summary */}
        <div className="bg-[#FAFAFA] border border-[#EEEEEE] rounded-lg p-5 mt-4 w-full max-w-lg">
          <p className="text-[#E41C34] text-xl font-bold text-start mb-4">
            {t.summary}
          </p>

          {cartItems.length > 0 ? (
            <>
              <div className="space-y-4">
                {cartItems.map((item: CartItem, index: number) => {
                  const { title, images } = item.attributes;
                  // Get the correct price to display
                  const displayPrice = item.selectedPackage
                    ? item.selectedPackage.price
                    : Number(item.attributes?.finalPrice ?? 0);

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 border-b border-[#EEEEEE] pb-3 last:border-none"
                    >
                      <Image
                        src={images?.[0] || "/svg/placeholder.svg"}
                        alt={title}
                        width={60}
                        height={60}
                        className="rounded object-cover w-16 h-16"
                        unoptimized={true}
                      />
                      <div className="flex w-full flex-col">
                        <div className="flex w-full items-start justify-between gap-3">
                          <h3 className="flex-1 min-w-0 text-sm font-semibold line-clamp-2">
                            {title}
                            {item.selectedPackage && (
                              <span className="text-xs text-gray-500 block">
                                {item.selectedPackage.title}
                              </span>
                            )}
                          </h3>
                          <p className="shrink-0 text-sm font-bold text-black">
                            {formatCurrency(displayPrice * item.quantity)}
                          </p>
                        </div>
                        <p className="text-xs text-[#737373] font-semibold mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/*  */}

              {/* totals */}
              <div className="mt-4 space-y-2 pt-3 border-t border-dashed border-[#EEEEEE]">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t.total ?? "Total"}</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-black">
                  <span>
                    VAT(
                    {cartItems.length > 0
                      ? `${Number(cartItems[0].attributes?.vatRate ?? 0)}%`
                      : "0%"}
                    ):
                  </span>
                  <span>{formatCurrency(vatTotal)}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm">Nothing here</p>
          )}
        </div>

        {/* back to home */}
        <Link
          href="/#home"
          onClick={handleBackToHome}
          className="px-20 py-2 border border-black text-black text-lg font-semibold rounded-lg mt-4 mb-10"
        >
          {t.backtohome}
        </Link>
      </section>
    </>
  );
};

export default Confirmation;
