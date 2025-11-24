"use client";
import { useEffect } from "react";
import { ChevronDown } from "@deemlol/next-icons";

// Match the parent's FormValues keys used here

export default function CompanyForm({
  t,
  register,
  setValue,
  FieldError,

  countryRef,
  regionRef,
  cityRef,

  filteredCountries,
  availableRegions,
  availableCities,

  countrySearch,
  setCountrySearch,
  regionSearch,
  setRegionSearch,
  citySearch,
  setCitySearch,

  setCountryOpen,
  setRegionOpen,
  setCityOpen,
  countryOpen,
  regionOpen,
  cityOpen,
  selectedCountryName,
}: any) {
  useEffect(() => {
    setValue("region", "", { shouldValidate: false, shouldDirty: false });
    setValue("city", "", { shouldValidate: false, shouldDirty: false });
  }, [selectedCountryName, setValue]);

  // dropdowns

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[var(--primary-red)] font-bold">
        {t.form.selectShippingCountry}
      </h1>

      {/* Country */}
      {/* Country Dropdown */}
      <div className="flex flex-col space-y-2 mb-4" ref={countryRef}>
        <label className="text-sm font-semibold">
          {t.form.country} <span className="text-red-500 space-x-0.5">*</span>
        </label>

        <div className="relative">
          <input
            type="text"
            {...register("country")}
            placeholder={t.form.selectCountry}
            readOnly
            onClick={() => setCountryOpen((v: any) => !v)}
            className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-sm rounded-lg"
          />

          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setCountryOpen((v: any) => !v)}
          >
            <ChevronDown className="w-5 h-5 text-[var(--primary-red)]" />
          </button>

          {countryOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white border border-[#EEEEEE] rounded-lg shadow-sm">
              <div className="p-2 border-b border-[#EEEEEE]">
                <input
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search country…"
                  className="w-full px-3 py-2 bg-white border border-[#EEEEEE] text-sm rounded-md"
                />
              </div>

              <ul className="max-h-60 overflow-auto py-1">
                {filteredCountries.map((c, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                      onClick={() => {
                        setValue("country", c.name, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setCountrySearch("");
                        setCountryOpen(false);
                      }}
                    >
                      {c.flag && (
                        <img
                          src={c.flag}
                          alt={c.name}
                          width={18}
                          height={14}
                          className="rounded-sm"
                        />
                      )}
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <FieldError name="country" />
      </div>

      <h1 className="text-[var(--primary-red)] font-bold">
        {t.form.shippingAddress}
      </h1>

      {/* Company Name & Phone */}
      <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold">
            {t.form.companyName}{" "}
            <span className="text-red-500 space-x-0.5">*</span>
          </label>
          <input
            {...register("companyName")}
            placeholder={t.form.companyNamePlaceholder}
            className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-sm rounded-lg"
          />
          <FieldError name="companyName" />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold">
            {t.form.phone} <span className="text-red-500 space-x-0.5">*</span>
          </label>
          <input
            {...register("phone")}
            placeholder={t.form.phonePlaceholder}
            className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-sm rounded-lg"
          />
          <FieldError name="phone" />
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold">
          {t.form.email} <span className="text-red-500 space-x-0.5">*</span>
        </label>
        <input
          type="email"
          placeholder={t.form.emailPlaceholder}
          className="md:w-1/2 px-4 py-3 bg-white border border-[#EEEEEE] text-sm rounded-lg"
          {...register("email")}
        />
        <FieldError name="email" />
      </div>

      {/* Address */}
      <div className="flex flex-col space-y-2 mb-4">
        <label className="text-sm font-semibold">
          {t.form.address} <span className="text-red-500 space-x-0.5">*</span>
        </label>
        <input
          {...register("address")}
          placeholder={t.form.addressPlaceholder}
          className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-sm rounded-lg"
        />
        <FieldError name="address" />
      </div>

      {/* City & Region */}
      <div className="grid grid-cols-2 gap-4 mb-4 max-[640px]:grid-cols-1">
        {/* City Dropdown */}
        <div className="flex flex-col space-y-2" ref={cityRef}>
          <label className="text-sm font-semibold">
            {t.form.city} <span className="text-red-500 space-x-0.5">*</span>
          </label>

          <div className="relative">
            <input
              type="text"
              {...register("city")}
              placeholder={t.form.cityPlaceholder}
              readOnly
              onClick={() => setCityOpen((v: any) => !v)}
              className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-sm rounded-lg"
            />

            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setCityOpen((v: any) => !v)}
            >
              <ChevronDown className="w-5 h-5 text-[var(--primary-red)]" />
            </button>

            {cityOpen && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-[#EEEEEE] rounded-lg shadow-sm">
                <div className="p-2 border-b border-[#EEEEEE]">
                  <input
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Search city…"
                    className="w-full px-3 py-2 bg-white border border-[#EEEEEE] text-sm rounded-md"
                  />
                </div>

                <ul className="max-h-60 overflow-auto py-1">
                  {availableCities.map((city: string, i: number) => (
                    <li key={i}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                        onClick={() => {
                          setValue("city", city, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          setCitySearch("");
                          setCityOpen(false);
                        }}
                      >
                        {city}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <FieldError name="city" />
        </div>

        {/* Region Dropdown */}
        <div className="flex flex-col space-y-2" ref={regionRef}>
          <label className="text-sm font-semibold">
            {t.form.region} <span className="text-red-500 space-x-0.5">*</span>
          </label>

          <div className="relative">
            <input
              type="text"
              {...register("region")}
              placeholder={t.form.regionPlaceholder}
              readOnly
              onClick={() => setRegionOpen((v: any) => !v)}
              className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-sm rounded-lg"
            />

            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setRegionOpen((v: any) => !v)}
            >
              <ChevronDown className="w-5 h-5 text-[var(--primary-red)]" />
            </button>

            {regionOpen && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-[#EEEEEE] rounded-lg shadow-sm">
                <div className="p-2 border-b border-[#EEEEEE]">
                  <input
                    value={regionSearch}
                    onChange={(e) => setRegionSearch(e.target.value)}
                    placeholder="Search region…"
                    className="w-full px-3 py-2 bg-white border border-[#EEEEEE] text-sm rounded-md"
                  />
                </div>

                <ul className="max-h-60 overflow-auto py-1">
                  {availableRegions.map((region: string, i: number) => (
                    <li key={i}>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                        onClick={() => {
                          setValue("region", region, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          setRegionSearch("");
                          setRegionOpen(false);
                        }}
                      >
                        {region}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <FieldError name="region" />
        </div>
      </div>

      {/* Postal */}
      <div className="flex flex-col space-y-2 mb-4">
        <label className="text-sm font-semibold">
          {t.form.postal} <span className="text-red-500 space-x-0.5">*</span>
        </label>
        <input
          {...register("postal")}
          placeholder={t.form.postalPlaceholder}
          className="w-full px-4 py-3 bg-white border border-[#EEEEEE] text-sm rounded-lg"
        />
        <FieldError name="postal" />
      </div>

      {/* VAT Checker */}
      {/* <div className="space-x-2 flex items-center">
        <VatChecker />
      </div> */}

      {/* No submit button here — parent handles submission */}
    </div>
  );
}
