"use client";
import LanguageSwitcher from "@/components/languageswitcher";
import { useLanguage } from "../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const { language } = useLanguage();
  const t = languageData[language]?.footer ?? {};
  return (
    <>
      <section className="px-10 sm:px-20 pt-15 mb-15 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] py-10 gap-10">
          <div className="flex flex-col gap-4 text-center lg:text-start items-center lg:items-start mb-4 lg:mb-0">
            <Link href="/#home">
              <Image
                src="images/logo.svg"
                alt="icon"
                width={200}
                height={200}
              ></Image>
            </Link>
            <p className="text-sm sm:text-base lg:pe-30">{t.description}</p>
            <LanguageSwitcher />
          </div>
          {/* right lists */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-white">
            {(t.columns ?? []).map((col, index) => (
              <div key={index} className="text-start">
                <h3 className="text-[#e41c34] font-semibold mb-4">
                  {col.title}
                </h3>
                <ul className="flex flex-col gap-2">
                  {(col.links ?? []).map(
                    (link: { label: string; href: string }, idx: number) => (
                      <li key={idx}>
                        <Link
                          href={link.href}
                          className="text-black hover:text-red-600 transition-colors text-sm sm:text-base"
                        >
                          {link.label}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
        {/* line */}
        <div className="">
          <hr className="border border-[var(--border-gray)]" />
        </div>
        {/* below text */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#050505] text-center md:text-start text-xs sm:text-base">
            {t.copyright}
          </p>
          {/* <div className="flex flex-row gap-4 ">
            <Image
              src="/images/facebook.svg"
              alt="icon"
              width={25}
              height={25}
            ></Image>
            <Image
              src="/images/youtube.svg"
              alt="icon"
              width={30}
              height={30}
            ></Image>
            <Image
              src="/images/linkedin.svg"
              alt="icon"
              width={25}
              height={25}
            ></Image>
            <Image
              src="/images/twitter.svg"
              alt="icon"
              width={25}
              height={25}
            ></Image>
          </div> */}
        </div>
      </section>
    </>
  );
};

export default Footer;
