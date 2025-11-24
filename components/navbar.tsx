"use client";

import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "@/components/languageswitcher";
import { useLanguage } from "../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import { useState, useEffect } from "react";
import { AlignJustify } from "@deemlol/next-icons";
import CartMenu from "./cart";
import { usePathname } from "next/navigation";
import ComplaintModal from "./complaint-modal/complaint-modal";
// import ComplaintModal from "@/components/modals/ComplaintModal"; // ✅ IMPORT MODAL

const NavBar = () => {
  const { language } = useLanguage();
  const t = languageData[language]?.navbar ?? {};

  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const normalizeHref = (href: string) => href.replace(/^\/?#/, "");

  const [isScrolled, setIsScrolled] = useState(false);

  // ✅ Complaint Modal State
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLinkActive = (href: string) => {
    const normalized = normalizeHref(href);
    if (pathname === "/" && (normalized === "home" || normalized === ""))
      return true;
    if (pathname === href || pathname === `/${normalized}`) return true;
    return false;
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-100 border-b border-[#EEEEEE] transition-colors duration-300 backdrop-blur-md ${
          isScrolled ? "bg-white/30" : "bg-transparent/30"
        }`}
      >
        <div className="max-w-7xl mx-auto px-10 sm:px-20 py-2 flex items-center justify-between">
          {/* Logo */}
          <Link href="/#home">
            <Image
              src="/images/logo.svg"
              alt="logo"
              width={300}
              height={300}
              className="w-40 lg:w-56"
            />
          </Link>

          {/* Desktop Links */}
          <div className=" md:space-x-6 xl:space-x-12 hidden lg:flex">
            {t.links?.map((link, index) => {
              if (link.href === "/#report") {
                return (
                  <button
                    key={index}
                    onClick={() => setIsComplaintOpen(true)}
                    className="text-sm text-black hover:text-[var(--primary-red)] cursor-pointer"
                  >
                    {link.label}
                  </button>
                );
              }

              return (
                <Link
                  key={index}
                  href={link.href}
                  className={`text-sm hover:text-[var(--primary-red)] ${
                    isLinkActive(link.href)
                      ? "text-[var(--primary-red)]"
                      : "text-black"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              href="/verify-email"
              className="bg-[var(--primary-red)] text-white p-2 rounded-lg hidden lg:flex"
            >
              {t.track}
            </Link>
            {!pathname.startsWith("/shipping") && <CartMenu />}
            <button onClick={toggleMenu} className="lg:hidden">
              <AlignJustify size={24} color="#181818" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 z-50 w-full  sm:w-1/2 h-full bg-white p-6 shadow-lg xl:hidden transition-transform ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button onClick={() => setMenuOpen(false)} className="text-4xl">
          &times;
        </button>

        <div className="mt-6 flex flex-col space-y-6 lg:space-y-3 xl:space-x-6">
          {t.links?.map((link, index) => {
            if (link.href === "/#report") {
              return (
                <p
                  key={index}
                  onClick={() => {
                    setIsComplaintOpen(true);
                    setMenuOpen(false);
                  }}
                  className="text-sm text-black hover:text-[var(--primary-red)] cursor-pointer"
                >
                  {link.label}
                </p>
              );
            }

            return (
              <Link
                key={index}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-base text-black"
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ✅ Complaint Modal */}
      <ComplaintModal
        isOpen={isComplaintOpen}
        onClose={() => setIsComplaintOpen(false)}
      />
    </>
  );
};

export default NavBar;
