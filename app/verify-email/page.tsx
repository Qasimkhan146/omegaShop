"use client";
import { useLanguage } from "../../context/LanguageContext";
import { languageData } from "@/utils/languageData";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mail } from "@deemlol/next-icons";
import {
  requestEmailVerification,
  resendVerificationEmail,
} from "@/app/actions/verify-email";
import { verifyOtpAndSaveShipping } from "@/app/actions/verifyOTP";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

// how long until resend (seconds)
const RESEND_SECONDS = 5 * 60;

const VerifyEmail = () => {
  const { language } = useLanguage();
  const t = languageData[language]?.verifyEmail ?? {};
  const router = useRouter();
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isOTPLoading, setIsOTPLoading] = useState(false);

  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/track-history";

  // steps: "email" -> "otp"
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // countdown for resend
  useEffect(() => {
    if (step !== "otp") return;
    setSecondsLeft(RESEND_SECONDS);
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  const mmss = useMemo(() => {
    const m = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = (secondsLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [secondsLeft]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setIsEmailLoading(true);
      await requestEmailVerification(email);
      setStep("otp");
      // focus first OTP box
      requestAnimationFrame(() => inputsRef.current[0]?.focus());
      requestAnimationFrame(() => inputsRef.current[0]?.focus());

      toast.success("OTP sent to your Email");
    } catch (err: unknown) {
      const message = (err as Error)?.message || "Failed to send an OTP";
      toast.error(message);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    // keep only digits
    const v = val.replace(/\D/g, "").slice(0, 1);
    setOtp((prev) => {
      const next = [...prev];
      next[idx] = v;
      return next;
    });
    if (v && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < 5) {
      e.preventDefault();
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const arr = pasted.split("");
    setOtp((prev) => prev.map((_, i) => arr[i] ?? ""));
    // focus last filled or last box
    const lastIndex = Math.min(arr.length, 6) - 1;
    inputsRef.current[lastIndex >= 0 ? lastIndex : 0]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return;

    try {
      setIsOTPLoading(true);
      const res = await verifyOtpAndSaveShipping(code);

      if (res && typeof window !== "undefined") {
        const data = (res as { data?: { email?: string } }).data ?? {};
        window.sessionStorage.setItem("track_data", JSON.stringify(data));
        const gotEmail = data.email || email;
        router.push(`${redirectPath}?email=${encodeURIComponent(gotEmail)}`);
      }
    } catch {
      toast.error("Invalid OTP");
    } finally {
      setIsOTPLoading(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0) return;
    try {
      await resendVerificationEmail(email);
      setOtp(["", "", "", "", "", ""]);
      setSecondsLeft(RESEND_SECONDS);
      inputsRef.current[0]?.focus();

      toast.success("OTP has sent Again.");
    } catch {
      toast.error("Failed to resend email");
    }
  };

  const Spinner = () => (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
  );

  return (
    <>
      <section className="flex items-center justify-center h-screen p-5">
        <div className="bg-white w-full max-w-lg drop-shadow-lg rounded-xl flex flex-col items-center justify-center gap-4 p-8">
          <div className="bg-[#E41C341A] p-3 rounded-full">
            <Mail size={35} color="#E41C34" />
          </div>

          {step === "email" ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold">{t.title}</h1>
              <p className="text-[#495057] text-sm sm:text-base text-center">
                {t.desc}
              </p>
              <form
                onSubmit={handleEmailSubmit}
                className="w-full flex flex-col gap-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailplaceholder}
                  className="border border-[#B9B9B9] rounded-lg p-2 placeholder-[#495057] w-full"
                  required
                />
                <button
                  type="submit"
                  disabled={isEmailLoading}
                  className="bg-[var(--primary-red)] text-center text-white w-full py-2 rounded-lg cursor-pointer font-medium"
                >
                  {isEmailLoading ? <Spinner /> : t.submit}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold">{t.otpTitle}</h1>
              <p className="text-[#495057] text-sm sm:text-base text-center">
                {t.otpDesc}
              </p>

              <form
                onSubmit={handleVerify}
                className="w-full flex flex-col gap-4"
              >
                <div className="w-full grid grid-cols-3 sm:flex sm:items-center sm:justify-between gap-2">
                  {otp.map((val, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        inputsRef.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="\d{1}"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={handleOtpPaste}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl border border-[#B9B9B9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-red)]"
                      aria-label={`OTP digit ${i + 1}`}
                    />
                  ))}
                </div>

                <div className="text-xs sm:text-sm text-[#6C757D] text-center">
                  {secondsLeft > 0 ? (
                    <>
                      {t.resendInfo}{" "}
                      <span className="font-semibold">{mmss}</span>. <br />
                      {t.checkSpam}
                    </>
                  ) : (
                    <>
                      {t.resendNowPrefix}{" "}
                      <button
                        type="button"
                        onClick={handleResend}
                        className="underline font-medium cursor-pointer"
                      >
                        {t.resendNow}
                      </button>{" "}
                      .<br />
                      {t.checkSpam}
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={otp.join("").length !== 6 || isOTPLoading}
                  className="bg-[var(--primary-red)] disabled:opacity-60 disabled:cursor-not-allowed text-center text-white w-full py-2 rounded-lg cursor-pointer font-medium"
                >
                  {isOTPLoading ? <Spinner /> : t.verify}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="text-xs sm:text-sm text-[#6C757D] underline self-center cursor-pointer"
                >
                  {t.changeEmail}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default VerifyEmail;
