"use client";
import { useLanguage } from "../../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import Discover from "@/components/discover";
import Link from "next/link";

// Interfaces
interface TermsSection {
  title: string;
  highlight1?: string;
  desc?: string;
  points?: string[];
  highlight2?: string;
  desc2?: string;
  points2?: string[];
  note?: string;
  email?: string;
  address?: string;
  btn?: string;
}

interface TermsAndConditionData {
  heading: string;
  description: string;
  publishedDate: string;
  sections: TermsSection[];
}

const TermsAndCondition = () => {
  const { language } = useLanguage();
  const t: TermsAndConditionData = languageData[language]
    ?.termsAndCondition ?? {
    heading: "",
    description: "",
    publishedDate: "",
    sections: [],
  };

  return (
    <>
      <section className="px-10 sm:px-20 py-15 mb-15 mt-24 max-w-7xl mx-auto">
        {/* Heading & Description */}
        <div className="text-center sm:text-start mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-black">
            {t.heading}
          </h1>
          <p className="text-[#495057] mt-2 text-sm sm:text-base">
            {t.description}
          </p>
          <p className="text-sm text-[#495057] mt-1">{t.publishedDate}</p>
        </div>

        {/* Sections */}
        {t.sections?.map((section, idx) => (
          <div key={idx} className="mb-10 sm:px-5 lg:px-10">
            {/* Section Title */}
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--primary-red)] mb-3">
              {section.title}
            </h2>

            {/* Section Highlight1 & Description in one line */}
            {(section.highlight1 || section.desc) && (
              <p className="text-black leading-relaxed mb-4 whitespace-pre-line text-xs sm:text-sm md:text-base">
                {section.highlight1 && (
                  <span className="font-bold">{section.highlight1} </span>
                )}
                {section.desc}
              </p>
            )}

            {section.points && (
              <ul className="list-disc pl-6 text-black space-y-1 text-xs sm:text-sm md:text-base">
                {section.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            )}

            {section.highlight2 && (
              <p className="text-black font-bold mb-4 whitespace-pre-line text-xs sm:text-sm md:text-base">
                {section.highlight2}
              </p>
            )}

            {section.desc2 && (
              <p className="text-black leading-relaxed mb-4 whitespace-pre-line text-xs sm:text-sm md:text-base mt-3">
                {section.desc2}
              </p>
            )}

            {section.points2 && (
              <ul className="list-disc pl-6 text-black space-y-1 text-xs sm:text-sm md:text-base">
                {section.points2.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            )}

            {/* Section Note */}
            {section.note && (
              <p className="text-black mt-4 text-xs sm:text-sm md:text-base">
                {section.note}
              </p>
            )}
            {section.email && (
              <p className="text-xs sm:text-sm md:text-base">
                <span className="text-[var(--primary-red)] font-semibold">
                  {section.email.split(":")[0]}:
                </span>{" "}
                {section.email.split(":")[1]}
              </p>
            )}

            {section.address && (
              <p className="text-xs sm:text-sm md:text-base mt-2">
                <span className="text-[var(--primary-red)] font-semibold">
                  {section.address.split(":")[0]}:
                </span>{" "}
                {section.address.split(":")[1]}
              </p>
            )}
            {section.btn && (
              <div className="mt-4">
                <Link
                  href="/support#contact"
                  className="inline-block text-sm sm:text-base text-white bg-[var(--primary-red)] py-2 px-4 rounded-lg cursor-pointer"
                >
                  {section.btn}
                </Link>
              </div>
            )}
          </div>
        ))}
      </section>
      <Discover />
    </>
  );
};

export default TermsAndCondition;
