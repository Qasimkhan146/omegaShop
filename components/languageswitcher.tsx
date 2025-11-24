"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "@deemlol/next-icons";
import { useLanguage } from "../context/LanguageContext";
import Image from "next/image";

type Props = {
  isMobile?: boolean;
};

const LanguageSwitcher = ({ isMobile = false }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const changeLanguage = (lng: "DE" | "EN") => {
    setIsOpen(false);
    setLanguage(lng);
  };

  const getFlag = (lang: string) => {
    if (lang === "DE") return "/images/Germany.png";
    return "/images/UK.png";
  };

  return (
    <div className={`relative ${isMobile ? "mt-5" : "flex"}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white text-black text-sm font-medium cursor-pointer border border-[#EEEEEE]"
      >
        <div className="w-4 aspect-square rounded-full overflow-hidden relative">
          <Image
            src={getFlag(language)}
            alt={`${language} flag`}
            fill
            className="object-cover"
          />
        </div>

        {language === "DE" ? "Deutsch" : "English"}
        {isOpen ? (
          <ChevronUp size={16} className="text-[var(--primary-red)]" />
        ) : (
          <ChevronDown size={16} className="text-[var(--primary-red)]" />
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            isMobile ? "bottom-full mb-1 left-0" : "top-full mt-3 right-0"
          } bg-white shadow-md border rounded-md w-28 z-50 overflow-hidden`}
        >
          <button
            onClick={() => changeLanguage("EN")}
            className="w-full text-left px-4 py-2 hover:bg-[#E41C3426] text-sm text-black flex items-center gap-2"
          >
            <div className="w-4 aspect-square rounded-full overflow-hidden relative">
              <Image
                src="/images/UK.png"
                alt="EN"
                fill
                className="object-cover"
              />
            </div>
            English
          </button>

          <button
            onClick={() => changeLanguage("DE")}
            className="w-full text-left px-4 py-2 hover:bg-[#E41C3426] text-sm text-black flex items-center gap-2"
          >
            <div className="w-4 aspect-square rounded-full overflow-hidden relative">
              <Image
                src="/images/Germany.png"
                alt="DE"
                fill
                className="object-cover"
              />
            </div>
            Deutsch
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
