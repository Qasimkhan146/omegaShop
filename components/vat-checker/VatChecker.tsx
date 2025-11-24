"use client";
import { useState } from "react";

export default function VatChecker() {
  const [excludeVAT, setExcludeVAT] = useState(false);
  const [vatNumber, setVatNumber] = useState("");
  //   const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleCheckVat = async () => {
    if (!vatNumber) {
      alert("Please fill in both User ID and VAT Number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vatNumber,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Error checking VAT:", err);
      setResult({ error: "Failed to connect to VAT API" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* VAT Exclude Checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="exclude-vat"
          checked={excludeVAT}
          onChange={(e) => {
            setExcludeVAT(e.target.checked);
            setResult(null); // reset results
          }}
          className="h-5 w-5 accent-[var(--primary-red)]"
        />
        <label
          htmlFor="exclude-vat"
          className="text-sm font-semibold cursor-pointer"
        >
          Exclude VAT
        </label>
      </div>

      {/* Show Fields Only If Checked */}
      {excludeVAT && (
        <div className="mt-4 space-y-3 transition-all duration-300">
          {/* VAT Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              VAT ID :
            </label>
            <input
              type="text"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              placeholder="Enter VAT ID"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-[var(--primary-red)] focus:outline-none"
            />
          </div>
          <p>
            Your VAT ID will be validated automatically for EU-based business
            purchases.
          </p>

          {/* Validate Button */}
          <button
            onClick={handleCheckVat}
            disabled={loading}
            className={`w-full py-2 rounded-md text-sm font-medium text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[var(--primary-red)] hover:bg-red-600"
            }`}
          >
            {loading ? "Validating..." : "Validate VAT"}
          </button>

          {/* Response */}
          {result && (
            <div className="mt-3 text-sm">
              {result.error ? (
                <p className="text-red-500">❌ Error: {result.error}</p>
              ) : (
                <div className="text-green-600 space-y-1">
                  <p>
                    ✅ <b>Valid:</b> {String(result.valid)}
                  </p>
                  <p>
                    <b>Name:</b> {result.name}
                  </p>
                  <p>
                    <b>Country:</b> {result.countryCode}
                  </p>
                  <p>
                    <b>Address:</b> {result.address}
                  </p>
                  <p>
                    <b>User ID:</b> {result.userId}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
