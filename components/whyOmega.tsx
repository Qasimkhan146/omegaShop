"use client";
import { useLanguage } from "../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import Image from "next/image";

const WhyOmega = () => {
  const { language } = useLanguage();
  const t = languageData[language]?.WhyOmega ?? {};

  interface WhyOmegaCard {
    icon: string;
    heading: string;
    desc: string;
  }

  return (
    <>
      <section className="px-10 sm:px-20 py-15 mb-15  max-w-7xl mx-auto">
        {/* above text */}
        <div className="flex flex-col justify-center items-center py-5 sm:py-10">
          <h1 className="text-[26px] sm:text-[42px] font-bold text-center">
            {t.title}
          </h1>
          <p className="text-[#495057] text-center whitespace-normal lg:whitespace-pre-line mt-3 text-sm sm:text-xl ">
            {t.desc}
          </p>
        </div>
        {/* about cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
          {t.WhyOmegaCards?.map((card: WhyOmegaCard, index: number) => (
            <div
              key={index}
              className="border border-[#EEEEEE] bg-[#FAFAFA] p-4 sm:p-6 md:p-8 rounded-2xl flex flex-col items-center sm:items-start text-center sm:text-start"
            >
              <div className="bg-[#E41C3424] rounded-full p-3 mb-4 ">
                <Image src={card.icon} alt="icon" width={35} height={35} />
              </div>
              <h3 className="text-[var(--primary-red)] sm:text-xl font-semibold mb-2">
                {card.heading}
              </h3>
              <p className="lg:text-xl">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default WhyOmega;
