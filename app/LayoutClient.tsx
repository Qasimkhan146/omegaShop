"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import ScrollToHomeButton from "@/components/scrollbutton";
import { LanguageProvider } from "@/context/LanguageContext";
import "flowbite";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // paths where NavBar and Footer should be hidden
  const hideLayoutPaths = [
    "/confirmation",
    "/error",
    // "/passwordGate",
    "/verify-email",
    // "/track-history",
    // "/shipping",
  ];

  const shouldHideLayout = hideLayoutPaths.includes(pathname);

  return (
    <LanguageProvider>
      <Toaster position="top-right" />
      <ScrollToHomeButton />
      {!shouldHideLayout && <NavBar />}
      {children}
      {!shouldHideLayout && <Footer />}
    </LanguageProvider>
  );
}
