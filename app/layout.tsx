import type { Metadata } from "next";
import "./globals.css";
import AppLoaderWrapper from "@/components/loader/apploaderwrapper";
import { Poppins } from "next/font/google";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "Omega Shop",
  description: "Designed for your secure crypto future",
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-poppins">
        <AppLoaderWrapper>
          <LayoutClient>{children}</LayoutClient>
        </AppLoaderWrapper>
      </body>
    </html>
  );
}
