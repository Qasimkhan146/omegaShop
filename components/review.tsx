"use client";
import { useLanguage } from "../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import Image from "next/image";

const Review = () => {
  const { language } = useLanguage();
  const t = languageData[language]?.review ?? {};
  return (
    <>
      <section className="bg-black bg-[url('/images/circles.svg')] bg-cover bg-center py-10 sm:py-15">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-white text-center font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl whitespace-pre-line">
            {t.titleStart}{" "}
            <span className="text-[var(--primary-red)]"> {t.titleSpan} </span>{" "}
            {t.titleEnd}
          </h1>
          <div className="bg-[#202020] border border-[#495057] w-fit flex flex-col-reverse sm:flex-row gap-2 p-2 rounded-md items-center">
            <Image
              src="/images/star.svg"
              alt="icon"
              height={100}
              width={100}
            ></Image>
            <p className="text-[#737373] text-sm">{t.trusted}</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Review;
