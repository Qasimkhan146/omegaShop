"use client";
import { useLanguage } from "../../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import Link from "next/link";
import Image from "next/image";

const Error = () => {
  const { language } = useLanguage();
  const t = languageData[language]?.error ?? {};

  return (
    <>
      <section className="flex flex-col justify-center items-center min-h-screen space-y-8">
        <div className="flex flex-col justify-center items-center text-center">
          <Image src="/images/cross.svg" alt="icon" width={100} height={100} />
          <h1 className="text-4xl text-bold text-black mt-4 font-semibold">
            {t.failed}
          </h1>
          <p className="text-[#737373] mt-3 whitespace-pre-line">{t.desc}</p>
        </div>

        <Link
          href="/#home"
          className="px-15 py-2 border border-black text-black text-lg font-semibold rounded-lg mt-4 mb-10"
        >
          {t.back}
        </Link>
      </section>
    </>
  );
};

export default Error;
