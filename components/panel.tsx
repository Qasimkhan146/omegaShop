"use client";
import { useLanguage } from "../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import Link from "next/link";

const Panel = () => {
  const { language } = useLanguage();
  const t = languageData[language]?.panel ?? {};
  return (
    <>
      <section className="bg-black bg-[url('/images/circles.svg')] bg-cover bg-center">
        <div className="p-10 sm:p-20 flex flex-col gap-5 max-w-7xl mx-auto">
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold leading-15">
            {t.titleStart}{" "}
            <span className="text-[var(--primary-red)]"> {t.titleEnd}</span>
          </h1>
          <p className="text-[var(--gray)] text-base md:text-xl">{t.desc}</p>
          <Link
            href="/faqs"
            className="bg-[var(--primary-red)] px-4 py-2 rounded-lg w-fit cursor-pointer text-white"
          >
            {t.btn1}
          </Link>
        </div>
      </section>
    </>
  );
};

export default Panel;
