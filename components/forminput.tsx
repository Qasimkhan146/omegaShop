"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  contactSchema,
  ContactSchema,
} from "../utils/validation/contactSchema";

interface FormProps {
  t: {
    form?: {
      getstarted?: string;
      desc3?: string;
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
      button?: string;
      toast?: {
        sending?: string;
        success?: string;
        error?: string;
        network?: string;
      };
    };
  };
}

const FormInput: React.FC<FormProps> = ({ t }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema()),
  });

  return (
    <form
      className="space-y-4 bg-[#FAFAFA] rounded-3xl px-6 sm:px-12 py-6"
      onSubmit={handleSubmit(async (data) => {
        const toastId = toast.loading(
          t.form?.toast?.sending || "Sending message..."
        );
        setLoading(true);
        try {
          const res = await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          const result = await res.json();

          if (result.success) {
            toast.success(
              t.form?.toast?.success || "Message sent successfully ✅",
              { id: toastId }
            );
            setName("");
            setEmail("");
            setPhone("");
            setSubject("");
            setMessage("");
          } else {
            toast.error(t.form?.toast?.error || "Failed to send message ❌", {
              id: toastId,
            });
          }
        } catch (error) {
          console.error("Error:", error);
          toast.error(
            t.form?.toast?.network || "Network error. Try again later.",
            { id: toastId }
          );
        } finally {
          setLoading(false);
        }
      })}
    >
      <div>
        <h1 className="text-[var(--primary-red)] font-bold text-[26px]">
          {t.form?.getstarted}
        </h1>
        <p className="text-sm text-[#181818]">{t.form?.desc3}</p>
      </div>
      {/* name */}
      <div className="relative w-full">
        <input
          {...register("name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder={t.form?.name}
          className="w-full p-3 rounded-lg text-black bg-white border border-[#B9B9B9] focus:ring-1 focus:ring-white"
        />
        {!name && (
          <span className="absolute top-3 left-16 text-red-500 pointer-events-none">
            *
          </span>
        )}
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>
      {/* email */}
      <div className="relative w-full">
        <input
          {...register("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder={t.form?.email}
          className="w-full p-3 rounded-lg text-black bg-white border border-[#B9B9B9] focus:ring-1 focus:ring-white"
        />
        {!email && (
          <span className="absolute top-3 left-34 text-red-500 pointer-events-none">
            *
          </span>
        )}
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      {/* phone number */}
      <div className="relative w-full">
        <input
          {...register("phone")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="number"
          placeholder={t.form?.phone}
          className="w-full p-3 rounded-lg text-black bg-white border border-[#B9B9B9] focus:ring-1 focus:ring-white appearance-none 
            [&::-webkit-inner-spin-button]:appearance-none 
            [&::-webkit-outer-spin-button]:appearance-none 
            [&::-moz-appearance]:textfield"
        />
        {!phone && (
          <span className="absolute top-3 left-36 text-red-500 pointer-events-none">
            *
          </span>
        )}
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>
      {/* subject */}
      <div className="relative w-full">
        <input
          {...register("subject")}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          type="text"
          placeholder={t.form?.subject}
          className="w-full p-3 rounded-lg text-black bg-white border border-[#B9B9B9] focus:ring-1 focus:ring-white"
        />
        {!subject && (
          <span className="absolute top-3 left-19 text-red-500 pointer-events-none">
            *
          </span>
        )}
        {errors.subject && (
          <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
        )}
      </div>
      {/* message */}
      <div className="relative w-full">
        <textarea
          {...register("message")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.form?.message}
          rows={5}
          className="w-full p-3 rounded-lg text-black bg-white border border-[#B9B9B9] focus:ring-1 focus:ring-white resize-none"
        />
        {!message && (
          <span className="asterik absolute top-3 left-60 text-red-500 pointer-events-none">
            *
          </span>
        )}
        {errors.message && (
          <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[var(--primary-red)] text-white py-3 px-6 rounded-lg font-semibold w-full cursor-pointer flex items-center justify-center"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          t.form?.button
        )}
      </button>
    </form>
  );
};

export default FormInput;
