"use client";
import { useLanguage } from "../../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import countriesData from "@/utils/countries.json";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Checkout } from "@/app/actions/Checkout";
import type { CartItem as CartItemType } from "@/types/cart";
import IndividualForm from "@/components/shipping-componants/individual-form";
import CompanyForm from "@/components/shipping-componants/company-form";

interface CartItem {
  id: string;
  attributes: {
    id: string;
    title: string;
    images: string[];
    price: number;
    vatRate: number;
    preOrder: string;
    finalPrice: number;
  };
  quantity: number;
  selectedPackage?: {
    // ADD THIS
    title: string;
    price: number;
    stock: number;
  };
  isPackage?: boolean; // ADD THIS
}

// ---------- Country / Region / City dropdown logic ----------
type CountryItem = {
  name: string;
  flag?: string;
  regions?: string[];
  cities?: string[];
};

// --- Zod schema (simple, locale-agnostic) ---
const shippingEnum = z.enum(["free", "regular", "express"]);
type ShippingMethod = z.infer<typeof shippingEnum>;

const Shipping = () => {
  const { language, cartItems, setCartItems } = useLanguage();
  const t = languageData[language]?.shipping ?? {};
  const [accountType, setAccountType] = useState<"individual" | "company">(
    "individual"
  );

  const removeFromCart = (item: CartItem) => {
    setCartItems((prev) => prev.filter((i) => i.id !== item.id));
  };
  // const router = useRouter();
  const [isPayRedirecting, setIsPayRedirecting] = useState(false);

  const baseSchema = z.object({
    country: z.string().min(2, t.validation.country),
    phone: z
      .string()
      .min(6, t.validation.shortphone)
      .regex(/^[0-9+\-\s()]+$/, t.validation.phone),
    email: z.string().email(t.validation.email),
    address: z.string().min(5, t.validation.address),
    city: z.string().min(2, t.validation.city),
    region: z.string().min(2, t.validation.region),
    postal: z
      .string()
      .min(3, t.validation.postal)
      .regex(/^[A-Za-z0-9\-\s]+$/, t.validation.wrongpostal),
    shippingMethod: shippingEnum,
  });

  const schema = z.discriminatedUnion("accountType", [
    baseSchema.extend({
      accountType: z.literal("individual"),
      firstName: z.string().min(2, t.validation.firstname),
      lastName: z.string().min(2, t.validation.lastname),
      companyName: z.string().optional(),
    }),
    baseSchema.extend({
      accountType: z.literal("company"),
      companyName: z.string().min(2, t.validation.companyName),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    }),
  ]);

  type FormValues = z.infer<typeof schema>;

  // selected shipping method state
  const [shipping] = useState<ShippingMethod>("free");

  // RHF setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    unregister,
    reset, // ✅ YE ADD KAR DO
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      accountType: "individual",
      country: "",
      firstName: "",
      lastName: "",
      companyName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      region: "",
      postal: "",
      shippingMethod: "free",
    },
  });

  useEffect(() => {
    reset({
      accountType,
      country: "",
      firstName: "",
      lastName: "",
      companyName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      region: "",
      postal: "",
      shippingMethod: "free",
    });
  }, [accountType, reset]);

  useEffect(() => {
    if (accountType === "company") {
      unregister(["firstName", "lastName"]);
    } else if (accountType === "individual") {
      unregister(["companyName"]);
    }
  }, [accountType, unregister]);
  // keep RHF field in sync when user clicks a card
  useEffect(() => {
    setValue("shippingMethod", shipping, { shouldValidate: true });
  }, [shipping, setValue]);

  // currency formatter — EUR
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  // numeric shipping fees (EUR)
  const shippingFees: Record<ShippingMethod, number> = {
    free: 0,
    regular: 7.5,
    express: 12.5,
  };

  // Update the totals calculation in shipping page
  const { subtotal, vatTotal } = useMemo(() => {
    const sub = cartItems.reduce((sum: number, item: CartItem) => {
      // For packages
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
        // For individual items: Calculate VAT amount from finalPrice
        const finalPrice = Number(item.attributes?.finalPrice ?? 0);
        const vatRate = Number(item.attributes?.vatRate ?? 0);
        const basePrice = finalPrice / (1 + vatRate / 100);
        const vatAmount = finalPrice - basePrice;
        return sum + vatAmount * item.quantity;
      }
    }, 0);

    return { subtotal: sub, vatTotal: vat };
  }, [cartItems]);

  // Grand total
  const shippingSelected = watch("shippingMethod") as ShippingMethod;
  const shippingTotal = shippingFees[shippingSelected ?? shipping];
  const grandTotal = subtotal + shippingTotal;

  const onSubmit = async (values: FormValues) => {
    if (!cartItems.length) {
      toast.error("Your cart is empty.");
      return;
    }

    setIsPayRedirecting(true);

    try {
      const session = await Checkout({
        cartItems: cartItems as unknown as CartItemType[], // if your CartItemType matches, keep it. Otherwise remove the cast.
        userEmail: values.email,
        shipping: {
          phoneNumber: values.phone,
          address: values.address,
          country: values.country, // e.g. "DE"
          city: values.city, // e.g. "Berlin"
          region: values.region, // e.g. "BE"
          postalCode: values.postal,
          // userName: `${values.firstName} ${values.lastName}`,
          userName:
            values.accountType === "company"
              ? values.companyName
              : `${values.firstName} ${values.lastName}`,
          companyName: values.companyName,
        },
        currency: "eur",
      });

      if (session.data.url) {
        window.location.href = session.data.url;
        return;
      }

      setIsPayRedirecting(false);
      toast.error(session?.message || "Failed to start payment.");
    } catch (e) {
      setIsPayRedirecting(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Reset "processing" UI if user returns from Stripe without completing payment
  useEffect(() => {
    const clearLoading = () => {
      try {
        if (sessionStorage.getItem("checkoutLoading")) {
          sessionStorage.removeItem("checkoutLoading");
        }
      } catch {}
      setIsPayRedirecting(false); // re-enable the button + restore label
    };

    // Run on mount (covers normal navigations)
    clearLoading();

    // Covers back/forward cache restores
    const onPageShow = () => clearLoading();
    window.addEventListener("pageshow", onPageShow);

    // Covers tab switching or when the page becomes visible again
    const onVis = () => {
      if (document.visibilityState === "visible") clearLoading();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const FieldError = ({ name }: { name: keyof FormValues }) =>
    errors?.[name] ? (
      <p className="mt-1 text-xs text-red-600">
        {String(errors[name]?.message)}
      </p>
    ) : null;

  // dropdowns
  const [countryOpen, setCountryOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const [countrySearch, setCountrySearch] = useState("");
  const [regionSearch, setRegionSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const countryRef = useRef<HTMLDivElement | null>(null);
  const regionRef = useRef<HTMLDivElement | null>(null);
  const cityRef = useRef<HTMLDivElement | null>(null);

  const selectedCountryName = watch("country");

  const allCountries: CountryItem[] = Array.isArray(countriesData)
    ? countriesData
    : [];

  const selectedCountry = useMemo(
    () => allCountries.find((c) => c.name === selectedCountryName) || null,
    [allCountries, selectedCountryName]
  );

  const availableRegions = useMemo(() => {
    return (selectedCountry?.regions ?? []).filter((r) =>
      r.toLowerCase().includes(regionSearch.toLowerCase())
    );
  }, [selectedCountry, regionSearch]);

  const availableCities = useMemo(() => {
    const base = selectedCountry?.cities ?? [];
    return base.filter((c) =>
      c.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [selectedCountry, citySearch]);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return allCountries;
    return allCountries.filter((c) => c.name.toLowerCase().includes(q));
  }, [allCountries, countrySearch]);

  // close dropdowns on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (countryRef.current && !countryRef.current.contains(t))
        setCountryOpen(false);
      if (regionRef.current && !regionRef.current.contains(t))
        setRegionOpen(false);
      if (cityRef.current && !cityRef.current.contains(t)) setCityOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // When country changes, reset region/city smartly
  useEffect(() => {
    // When country changes: clear region and city, let user pick manually
    setValue("region", "", { shouldValidate: false, shouldDirty: false });
    setValue("city", "", { shouldValidate: false, shouldDirty: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryName]);

  useEffect(() => {
    setValue("accountType", accountType, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [accountType, setValue]);
  return (
    <>
      <section className="px-10 sm:px-20 py-15 mb-15 mt-15 max-w-7xl mx-auto">
        {/* above text */}
        <div>
          <h1 className="text-3xl sm:text-[42px] font-bold text-center sm:text-start">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#495057] mt-3 text-center sm:text-start">
            {t.desc}
          </p>
        </div>

        {/* grid */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="grid grid-cols-1 xl:grid-cols-[5fr_3fr] gap-4 mt-6 max-[900px]:grid-cols-1"
        >
          <div className="flex flex-col gap-4">
            {/* form */}
            <div className="flex items-center gap-6 mb-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="accountType"
                  value="individual"
                  className="accent-red-500"
                  checked={accountType === "individual"}
                  onChange={() => setAccountType("individual")}
                />
                Individual
              </label>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="accountType"
                  value="company"
                  className="accent-red-500"
                  checked={accountType === "company"}
                  onChange={() => setAccountType("company")}
                />
                Company
              </label>
            </div>
            <input
              type="hidden"
              {...register("accountType")}
              value={accountType}
            />

            <div className="bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl p-4">
              {accountType === "individual" ? (
                <IndividualForm
                  t={t}
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  FieldError={FieldError}
                  countryRef={countryRef}
                  regionRef={regionRef}
                  cityRef={cityRef}
                  filteredCountries={filteredCountries}
                  availableRegions={availableRegions}
                  availableCities={availableCities}
                  countrySearch={countrySearch}
                  setCountrySearch={setCountrySearch}
                  regionSearch={regionSearch}
                  setRegionSearch={setRegionSearch}
                  citySearch={citySearch}
                  setCitySearch={setCitySearch}
                  setCountryOpen={setCountryOpen}
                  setRegionOpen={setRegionOpen}
                  setCityOpen={setCityOpen}
                  countryOpen={countryOpen}
                  regionOpen={regionOpen}
                  cityOpen={cityOpen}
                  selectedCountry={selectedCountry}
                  selectedCountryName={selectedCountryName}
                />
              ) : (
                <CompanyForm
                  t={t}
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  FieldError={FieldError}
                  countryRef={countryRef}
                  regionRef={regionRef}
                  cityRef={cityRef}
                  filteredCountries={filteredCountries}
                  availableRegions={availableRegions}
                  availableCities={availableCities}
                  countrySearch={countrySearch}
                  setCountrySearch={setCountrySearch}
                  regionSearch={regionSearch}
                  setRegionSearch={setRegionSearch}
                  citySearch={citySearch}
                  setCitySearch={setCitySearch}
                  setCountryOpen={setCountryOpen}
                  setRegionOpen={setRegionOpen}
                  setCityOpen={setCityOpen}
                  countryOpen={countryOpen}
                  regionOpen={regionOpen}
                  cityOpen={cityOpen}
                  selectedCountry={selectedCountry}
                  selectedCountryName={selectedCountryName}
                />
              )}
            </div>
          </div>

          {/* order */}
          <div className="bg-[#E41C340D] border border-[#EEEEEE] rounded-lg p-4 pb-6 h-fit md:mt-13">
            <h1 className="text-[var(--primary-red)] font-bold">{t.order}</h1>
            <div className="border-t border-[#EEEEEE] mt-3 py-3">
              {cartItems.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {cartItems.map((item: CartItem, index: number) => {
                      const { title, images, price } = item.attributes || {};
                      const displayPrice = item.selectedPackage
                        ? item.selectedPackage.price
                        : price;

                      return (
                        <div
                          key={index}
                          className="border border-[#EEEEEE] py-3 rounded-2xl bg-white"
                        >
                          <div className="flex items-center gap-3 ">
                            {/* remove button */}

                            <Image
                              src={images?.[0] || "/svg/placeholder.svg"}
                              alt={title}
                              width={60}
                              height={60}
                              className="rounded object-cover w-16 h-16 ml-3"
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
                                  {formatCurrency(
                                    Number(displayPrice * item.quantity)
                                  )}
                                </p>
                              </div>
                              <p className="text-xs text-[#737373] font-semibold mt-1">
                                Qty: {item.quantity}
                                {item.selectedPackage &&
                                  ` (${item.selectedPackage.stock} items per package)`}
                              </p>
                            </div>
                            <button
                              className="relative -top-8  right-0 z-50 bg-(--primary-red) h-8 w-12 rounded-full text-white hover:text-black transition text-sm"
                              onClick={() => removeFromCart(item)}
                            >
                              X
                            </button>
                          </div>
                          <p className="text-green-400 text-[12px] px-3  mt-3">
                            {item.attributes?.preOrder}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className=" border-t border-[#EEEEEE] pt-5">
                    <h1 className="text-[var(--primary-red)] font-bold">
                      {t.details}
                    </h1>
                  </div>

                  <div className="mt-4 space-y-2 pt-3 border-t border-dashed border-[#EEEEEE]">
                    <div className="flex justify-between text-xs text-black">
                      <span>
                        VAT(
                        {cartItems.length > 0
                          ? `${Number(cartItems[0].attributes?.vatRate ?? 0)}%`
                          : "0%"}
                        )
                      </span>
                      <span>{formatCurrency(vatTotal)}</span>
                    </div>

                    <div className="flex justify-between text-lg font-semibold">
                      <span>{t.total ?? "Total"}</span>
                      <span>{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm">Nothing here</p>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || isPayRedirecting}
                className="w-full py-2 text-white bg-[var(--primary-red)] text-base sm:text-lg font-semibold rounded-lg block text-center disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting || isPayRedirecting
                  ? t.submitting ?? "Processing..."
                  : t.continue}
              </button>
            </div>
          </div>
        </form>
      </section>
    </>
  );
};

export default Shipping;
