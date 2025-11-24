"use client";
import { useLanguage } from "../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import Link from "next/link";

const Discover = () => {
  const { language } = useLanguage();
  const t = languageData[language]?.faq ?? {};

  return (
    <>
      <section className="bg-black bg-[url('/images/circles.svg')] bg-cover bg-center px-10 sm:px-20 py-5">
        <div className=" mb-15 max-w-7xl mx-auto">
          {/* text */}
          <div className="flex flex-col items-center justify-center mt-20 gap-6">
            <h1 className="text-[32px] sm:text-[52px] text-white text-center font-bold sm:leading-16 whitespace-pre-line">
              {t.dicover}
            </h1>
            <Link
              href="/shop"
              className="bg-[var(--primary-red)] text-white px-4 py-2 rounded-lg cursor-pointer"
            >
              {t.btn1}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Discover;
