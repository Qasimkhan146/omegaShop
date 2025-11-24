"use client";
import { useLanguage } from "../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import { useState } from "react";
import { Plus, Minus } from "@deemlol/next-icons";

const FAQs = () => {
  const { language } = useLanguage();
  const t = languageData[language]?.faq ?? {};
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  interface FAQItem {
    question: string;
    answer: string;
  }
  return (
    <>
      <section className="px-10 sm:px-20 py-15 mb-10  max-w-7xl mx-auto">
        {/* above text */}
        <div className="flex flex-col justify-center items-center py-5 sm:py-10">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center">
            {t.heading}
          </h1>
          <p className="text-center mt-5 text-sm sm:text-base md:text-lg text-[#495057]">
            {t.desc}
          </p>
        </div>
        {/* FAQ Items */}
        <div className="flex flex-col gap-4 text-black lg:px-20">
          {t.items?.map((faq: FAQItem, index: number) => (
            <div key={index} className="border-b border-[#EEEEEE] pb-4">
              <button
                onClick={() => toggleFAQ(index)}
                className="group cursor-pointer flex justify-between items-start w-full text-left font-medium py-4 gap-4"
              >
                <span
                  className={`text-base sm:text-xl transition-colors duration-200 flex-1 ${
                    openIndex === index
                      ? "text-[var(--primary-red)]"
                      : "group-hover:text-[var(--primary-red)]"
                  }`}
                >
                  {faq.question}
                </span>

                <span className="w-5 h-5 flex items-center justify-center shrink-0">
                  {openIndex === index ? (
                    <Minus className="text-[var(--primary-red)] w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5 text-[var(--primary-red)]" />
                  )}
                </span>
              </button>

              {openIndex === index && (
                <p className="text-sm sm:text-base text-black leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default FAQs;
