"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronUp } from "@deemlol/next-icons";

const ScrollToHomeButton = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const toggle = () => setShow(window.scrollY > 170);
    window.addEventListener("scroll", toggle);
    return () => window.removeEventListener("scroll", toggle);
  }, []);

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      {show && (
        <Link
          href="#home"
          scroll={true}
          className="fixed bottom-8 right-2 z-50 p-1 md:p-2 bg-[var(--primary-red)] rounded-full hover:scale-110 transition-transform animate-[float_2s_ease-in-out_infinite]"
        >
          <ChevronUp className="w-4 h-4 md:w-6 md:h-6" color="#FFFFFF" />
        </Link>
      )}
    </>
  );
};

export default ScrollToHomeButton;
