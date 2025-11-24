"use client";
import { useLanguage } from "../../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import Image from "next/image";
import FormInput from "../../components/forminput";
import Link from "next/link";
import Discover from "@/components/discover";

const FAQs = () => {
  const { language } = useLanguage();
  const t = languageData[language]?.support ?? {};

  interface SupportCard {
    icon: string;
    heading: string;
    desc: string;
    timing: string;
    btn: string;
    url: string;
  }

  return (
    <>
      <section
        className="px-10 sm:px-20 py-15 mb-15 mt-15 max-w-7xl mx-auto"
        id="support"
      >
        {/* above text */}
        <div>
          <h1 className="text-3xl sm:text-[42px] font-bold text-center sm:text-start">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#495057] mt-3 text-center sm:text-start">
            {t.desc1}
          </p>
        </div>
        {/* cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
          {t.SupportCards?.map((card: SupportCard, index: number) => (
            <div
              key={index}
              className="border border-[#EEEEEE] bg-[#FAFAFA] p-4 sm:p-6 md:p-8 rounded-2xl flex flex-col text-start"
            >
              {/* top section that grows */}
              <div className="flex-1">
                <div className="bg-[#E41C3424] rounded-full w-fit p-3 mb-4 flex justify-center sm:justify-start">
                  <Image src={card.icon} alt="icon" width={35} height={35} />
                </div>
                <h3 className="text-black sm:text-xl font-semibold mb-2">
                  {card.heading}
                </h3>
                <p className="text-sm sm:text-base lg:text-xl text-[#737373]">
                  {card.desc}
                </p>
              </div>

              {/* bottom section stays aligned */}
              <div className="flex flex-row gap-2 mt-3">
                <Image
                  src="/images/clock.svg"
                  alt="icon"
                  width={20}
                  height={20}
                />
                <p className="text-sm sm:text-bbase">{card.timing}</p>
              </div>
              <Link
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[var(--primary-red)] rounded-md px-2 py-1 text-white w-full mt-3 text-center"
              >
                {card.btn}
              </Link>
            </div>
          ))}
        </div>
        {/* form */}
        <div className="" id="contact">
          <h1 className="text-3xl sm:text-[42px] text-center sm:text-start font-bold">
            {t.contact}
          </h1>
          <p className="text-[#495057] text-sm sm:text-lg text-center sm:text-start">
            {t.desc2}
          </p>
          {/* form grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-15 lg:gap-20 mt-8">
            <div className="flex justify-center items-center">
              <Image
                src="/images/form-img.svg"
                alt="img"
                width={600}
                height={600}
              ></Image>
            </div>
            {/* right Form */}
            <FormInput t={t} />
          </div>
        </div>
      </section>
      <Discover />
    </>
  );
};

export default FAQs;
