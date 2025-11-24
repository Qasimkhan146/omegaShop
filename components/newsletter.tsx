"use client";
import { useLanguage } from "../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import { useState } from "react";
import { toast } from "react-hot-toast";

const NewsLetter = () => {
  const { language } = useLanguage();
  const t = languageData[language]?.newsletter ?? {};

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const Loader = () => (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
  );

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error("JSON parse error:", err);
        throw new Error("Invalid JSON from server");
      }

      // const data = await res.json();

      if (data.success) {
        toast.success("Subscribed successfully!");
        setEmail("");
      } else {
        toast.error(data.error || "Subscription failed.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="bg-black bg-[url('/images/circles.svg')] bg-cover bg-center px-10 sm:px-30 py-20">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-white text-3xl sm:text-5xl text-center font-bold">
            {t.title}
          </h1>
          <p className="text-[#A8A8A8] text-xl text-center">{t.desc}</p>
          <form
            onSubmit={handleSubmit}
            className="flex md:flex-row flex-col gap-4 max-w-4xl w-full"
          >
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-[#495057] rounded-md text-white/50 p-4 min-w-[200px] w-full"
              placeholder={t.placeholder}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[var(--primary-red)] p-4 rounded-md text-white whitespace-nowrap flex-shrink-0 w-fit cursor-pointer flex flex-row gap-3"
            >
              {t.btn1}
              {loading && <Loader />}
            </button>
          </form>
          <p className="text-[10px] sm:text-xs text-[#A8A8A8] lg:whitespace-pre-line text-center">
            {t.explaination}{" "}
            <span className="underline cursor-pointer">{t.link}</span>
          </p>
        </div>
      </section>
    </>
  );
};

export default NewsLetter;
