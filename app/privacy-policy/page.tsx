"use client";
import { useLanguage } from "../../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import Discover from "@/components/discover";
import Link from "next/link";

// Interfaces
interface PrivacyPolicySectionCategoryObject {
  desc?: string;
  points?: string[];
  note?: string;
}

type PrivacyPolicySectionCategories = Record<
  string,
  string[] | PrivacyPolicySectionCategoryObject
>;

interface PrivacyPolicySection {
  title: string;
  desc?: string;
  categories?: PrivacyPolicySectionCategories;
  email?: string;
  address?: string;
  btn?: string;
}

interface PrivacyPolicy {
  heading: string;
  description: string;
  publishedDate: string;
  sections: PrivacyPolicySection[];
}

const PrivacyPolicy = () => {
  const { language } = useLanguage();
  const t: PrivacyPolicy = languageData[language]?.privacyPolicy ?? {
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

            {/* Section Description */}
            {section.desc && (
              <p className="text-black leading-relaxed mb-4 whitespace-pre-line text-xs sm:text-sm md:text-base">
                {section.desc}
              </p>
            )}

            {/* Categories */}
            {section.categories && (
              <div className="space-y-8">
                {Object.entries(section.categories).map(([key, value]) => (
                  <div key={key}>
                    <h3 className="text-base sm:text-lg font-semibold text-[var(--primary-red)] mb-2">
                      {key}
                    </h3>

                    {/* If it's an array */}
                    {Array.isArray(value) &&
                      value.map((item, i) => (
                        <p
                          key={i}
                          className="text-black text-sm md:text-base leading-relaxed whitespace-pre-line mb-2"
                        >
                          {item}
                        </p>
                      ))}

                    {/* If it's an object */}
                    {!Array.isArray(value) && typeof value === "object" && (
                      <div>
                        {value.desc && (
                          <p className="text-black text-xs sm:text-sm md:text-base mb-3">
                            {value.desc}
                          </p>
                        )}
                        {value.points && (
                          <ul className="list-disc pl-6 text-black space-y-1 text-xs sm:text-sm md:text-base">
                            {value.points.map((point, i) => {
                              if (key === "Disclosure of Your Information") {
                                const [heading, ...rest] = point.split(":");
                                return (
                                  <li key={i}>
                                    <span className="font-semibold text-black">
                                      {heading}:
                                    </span>
                                    {rest.length > 0 && (
                                      <span className="ml-1 text-black">
                                        {rest.join(":")}
                                      </span>
                                    )}
                                  </li>
                                );
                              }
                              return <li key={i}>{point}</li>;
                            })}
                          </ul>
                        )}
                        {value.note && (
                          <p className="text-black mt-4 text-xs sm:text-sm md:text-base">
                            {value.note}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
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

export default PrivacyPolicy;
