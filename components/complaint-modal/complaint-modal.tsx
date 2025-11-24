"use client";

import { createComplaint } from "@/app/actions/complaints/create-complaint";
import { useLanguage } from "@/context/LanguageContext";
import { languageData } from "@/utils/languageData";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ReportIssueModal({ isOpen, onClose }: any) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [productName, setProductName] = useState("");
  const [issueCategory, setIssueCategory] = useState("");
  const [preferredSolution, setPreferredSolution] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const { language } = useLanguage();
  const t = languageData[language]?.complaintModal;

  const issueCategories = t.categories;
  const solutions = t.solutions;

  if (!isOpen) return null;

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setOrderId("");
    setProductName("");
    setIssueCategory("");
    setPreferredSolution("");
    setDescription("");
    setImages([]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm(); // form clear
    onClose(); // modal close
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: any = {};
    if (!firstName.trim()) newErrors.firstName = t.errors.firstName;
    if (!lastName.trim()) newErrors.lastName = t.errors.lastName;

    if (!email.trim()) {
      newErrors.email = t.errors.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t.errors.emailInvalid;
    }

    if (!phone.trim()) {
      newErrors.phone = t.errors.phoneRequired;
    } else if (!/^[\+]?[0-9]{10,15}$/.test(phone)) {
      newErrors.phone = t.errors.phoneInvalid;
    }

    if (!orderId.trim()) newErrors.orderId = t.errors.orderId;
    if (!productName.trim()) newErrors.productName = t.errors.productName;
    if (!description.trim())
      newErrors.description = t.errors.descriptionRequiredIfNoCategory;
    if (images.length === 0) newErrors.images = t.errors.images;

    setErrors(newErrors);

    // ❌ Agar koi error hai → stop submit
    if (Object.keys(newErrors).length > 0) {
      return; // stops submit, keeps modal open
    }

    // ✅ No errors → continue submit

    e.preventDefault();

    setLoading(true);

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("phoneNumber", phone);
    formData.append("orderId", orderId);
    formData.append("productName", productName);
    formData.append("issueCategory", issueCategory);
    formData.append("issueDetail", description);
    formData.append("preferredSolution", preferredSolution);

    images.forEach((file) => formData.append("images", file));

    const response = await createComplaint(formData);

    setLoading(false);
    if (response.status === 201) {
      toast.success(t.toasts.success);
      resetForm();

      onClose(); // ✅ close modal only on success
    } else {
      toast.error(response.message);
      // ❌ Do not close modal
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl rounded-2xl p-6 shadow-lg relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // ✅ Yeh modal close hone se roke ga
      >
        {" "}
        <button
          onClick={handleClose}
          type="button"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-2">
          {/* Report an Issue with your Product */}
          {t.title}
        </h2>
        <p className="text-sm text-[#555] mb-4">{t.subtitle}</p>
        <div className="bg-[#FAFAFA] border border-[#EEEEEE] p-2 rounded-2xl">
          <h3 className="text-sm font-semibold mb-2 text-[var(--primary-red)]">
            {t.formTitle}
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium">
                  {t.ComplaintForm.firstName}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t.ComplaintForm.firstNamePlaceholder}
                  className="border border-gray-200 px-2 py-1.5 rounded-md text-[12px] placeholder:text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--primary-red)]"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setErrors({ ...errors, firstName: "" });
                  }}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium">
                  {t.ComplaintForm.lastName}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setErrors({ ...errors, lastName: "" });
                  }}
                  placeholder={t.ComplaintForm.lastNamePlaceholder}
                  className="border border-gray-200 px-2 py-1.5 rounded-md text-[12px] placeholder:text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--primary-red)]"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium">
                  {t.ComplaintForm.email}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: "" });
                  }}
                  placeholder={t.ComplaintForm.emailPlaceholder}
                  className="border border-gray-200 px-2 py-1.5 rounded-md text-[12px] placeholder:text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--primary-red)]"
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium">
                  {t.ComplaintForm.phone}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors({ ...errors, phone: "" });
                  }}
                  placeholder={t.ComplaintForm.phonePlaceholder}
                  className="border border-gray-200 px-2 py-1.5 rounded-md text-[12px] placeholder:text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--primary-red)]"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium">
                  {t.ComplaintForm.orderId}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => {
                    setOrderId(e.target.value);
                    setErrors({ ...errors, orderId: "" });
                  }}
                  placeholder={t.ComplaintForm.orderIdPlaceholder}
                  className="border border-gray-200 px-2 py-1.5 rounded-md text-[12px] placeholder:text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--primary-red)]"
                />
                {errors.orderId && (
                  <p className="text-xs text-red-500">{errors.orderId}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium">
                  {t.ComplaintForm.productName}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value);
                    setErrors({ ...errors, productName: "" });
                  }}
                  placeholder={t.ComplaintForm.productNamePlaceholder}
                  className="border border-gray-200 px-2 py-1.5 rounded-md text-[12px] placeholder:text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--primary-red)]"
                />
                {errors.productName && (
                  <p className="text-xs text-red-500">{errors.productName}</p>
                )}
              </div>
            </div>

            {/* issue categories */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium">
                {t.ComplaintForm.issueCategory}{" "}
                <span className="text-red-500">*</span>
              </label>

              <ul className="flex flex-wrap gap-2">
                {issueCategories.map((item) => (
                  <li
                    key={item}
                    onClick={() => setIssueCategory(item)}
                    className={`px-3 py-1.5 rounded-2xl text-[12px] cursor-pointer font-bold border transition
          ${
            issueCategory === item
              ? "bg-[var(--primary-red)] text-white  border-[var(--primary-red)]"
              : "bg-red-100 text-[var(--primary-red)]  border-gray-300 hover:bg-red-200"
          }
        `}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium">
                {t.ComplaintForm.description}{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder={t.ComplaintForm.descriptionPlaceholder}
                className=" border border-gray-200 px-2 py-1.5 rounded-md h-24 resize-none text-[12px] placeholder:text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--primary-red)]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium">
                {t.ComplaintForm.uploadImages}{" "}
                <span className="text-red-500">*</span>
              </label>

              <label
                htmlFor="complaint-images"
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                  <div className="text-gray-500">
                    <svg
                      className="w-8 h-8 mx-auto"
                      fill="none"
                      stroke="var(--primary-red)"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {t.ComplaintForm.attachImages}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t.ComplaintForm.clickDrag}
                  </div>
                </div>
              </label>

              <input
                id="complaint-images"
                type="file"
                onChange={handleImages}
                multiple
                accept="image/*"
                className="hidden"
              />
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="w-20 h-20 rounded-md overflow-hidden border relative group"
                  >
                    <Image
                      src={URL.createObjectURL(img)}
                      alt="preview"
                      width={80}
                      height={80}
                      unoptimized
                      className="w-full h-full object-cover"
                    />

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setImages(images.filter((_, i) => i !== index))
                      }
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full px-1 text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.images && (
              <p className="text-xs text-red-500">{errors.images}</p>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium">
                {t.ComplaintForm.preferredSolution}
              </label>

              <ul className="flex flex-wrap gap-2">
                {solutions.map((item) => (
                  <li
                    key={item}
                    onClick={() => setPreferredSolution(item)}
                    className={`px-3 py-1.5 rounded-2xl text-[12px] font-bold cursor-pointer border transition
          ${
            preferredSolution === item
              ? "bg-[var(--primary-red)] text-white border-[var(--primary-red)]"
              : "bg-red-100 text-[var(--primary-red)] border-gray-300 hover:bg-red-200"
          }
        `}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <div className="flex justify-around md:justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[var(--primary-red)] text-white font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  {loading ? "Submitting..." : <>{t.ComplaintForm.submit}</>}
                  <Image
                    src="/images/frame.svg"
                    alt="Frame icon"
                    width={20}
                    height={20}
                    className="w-5 h-5 rotate-12"
                  />
                </button>
              </div>
            </div>
          </form>
          <p className="text-[8px] text-gray-400 mt-2">
            {t.ComplaintForm.confirmation}
          </p>
        </div>
      </div>
    </div>
  );
}
