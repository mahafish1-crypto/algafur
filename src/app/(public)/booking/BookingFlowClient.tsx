"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  Building,
  User,
  Users,
  CreditCard,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Printer,
  MessageCircle,
  FileText,
} from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";

interface BookingFlowClientProps {
  packages: any[];
  defaultSlug?: string;
  defaultRoom?: string;
}

export default function BookingFlowClient({
  packages,
  defaultSlug,
  defaultRoom,
}: BookingFlowClientProps) {
  const [step, setStep] = useState(1);

  // Selected package
  const [selectedPkgSlug, setSelectedPkgSlug] = useState(
    defaultSlug || (packages[0]?.slug ?? "")
  );

  // Traveller Details
  const [primaryCustomer, setPrimaryCustomer] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    city: "Pune",
    address: "",
  });

  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);

  // Travellers list
  const [travellers, setTravellers] = useState<
    Array<{ fullName: string; passportNumber: string; gender: string; dob: string }>
  >([
    { fullName: "", passportNumber: "", gender: "MALE", dob: "" },
  ]);

  // Room type
  const [roomType, setRoomType] = useState<"QUAD" | "TRIPLE" | "DOUBLE">(
    (defaultRoom as any) || "QUAD"
  );

  // Add-ons
  const [addons, setAddons] = useState({
    wheelchair: false,
    haramView: false,
    extraZamzam: false,
  });

  // Payment Selection
  const [paymentOption, setPaymentOption] = useState<"ADVANCE" | "FULL">("ADVANCE");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [transactionId, setTransactionId] = useState("");

  // Submission State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<any | null>(null);

  const selectedPkg = packages.find((p) => p.slug === selectedPkgSlug) || packages[0];

  // Price Calculation
  const baseRate =
    roomType === "DOUBLE"
      ? selectedPkg.priceDouble || selectedPkg.basePrice * 1.25
      : roomType === "TRIPLE"
      ? selectedPkg.priceTriple || selectedPkg.basePrice * 1.1
      : selectedPkg.priceQuad || selectedPkg.basePrice;

  const travellersTotalCount = adultsCount + childrenCount;
  const packageTotal = baseRate * adultsCount + (childrenCount > 0 ? baseRate * 0.7 * childrenCount : 0);

  let addonsTotal = 0;
  if (addons.wheelchair) addonsTotal += 5000;
  if (addons.haramView) addonsTotal += 15000;
  if (addons.extraZamzam) addonsTotal += 2000;

  const grandTotal = Math.round(packageTotal + addonsTotal);
  const advanceRequired = Math.round(Math.min(grandTotal, 25000 * travellersTotalCount));
  const payableNow = paymentOption === "ADVANCE" ? advanceRequired : grandTotal;

  // Handle adults count adjustment
  const handleAdultsChange = (val: number) => {
    setAdultsCount(val);
    const updated = [...travellers];
    while (updated.length < val + childrenCount) {
      updated.push({ fullName: "", passportNumber: "", gender: "MALE", dob: "" });
    }
    while (updated.length > val + childrenCount) {
      updated.pop();
    }
    setTravellers(updated);
  };

  const handleTravellerChange = (index: number, field: string, value: string) => {
    const updated = [...travellers];
    updated[index] = { ...updated[index], [field]: value };
    setTravellers(updated);
  };

  const handleSubmitBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        packageId: selectedPkg.id,
        customer: primaryCustomer,
        travellers,
        adults: adultsCount,
        children: childrenCount,
        roomType,
        addons,
        totalAmount: grandTotal,
        advanceAmount: advanceRequired,
        paidAmount: payableNow,
        paymentOption,
        paymentMethod,
        transactionId: transactionId || `TXN-${Date.now().toString().slice(-6)}`,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Booking failed");
      }

      setBookingResult(data);
      setStep(7);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    "Package",
    "Pilgrim",
    "Passports",
    "Room",
    "Add-ons",
    "Payment",
    "Confirmation",
  ];

  return (
    <div className="bg-ivory-100/50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs">
            {stepsList.map((s, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center flex-1 ${
                  step === idx + 1
                    ? "text-forest-950 font-bold"
                    : step > idx + 1
                    ? "text-emerald-700"
                    : "text-neutral-400"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                    step === idx + 1
                      ? "bg-gold-500 text-forest-950 shadow-md ring-2 ring-gold-300"
                      : step > idx + 1
                      ? "bg-emerald-600 text-white"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {step > idx + 1 ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span className="hidden sm:inline text-[10px]">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-xl space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* STEP 1: CHOOSE PACKAGE */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-neutral-100 pb-3">
                <h2 className="text-xl font-serif font-bold text-forest-950">
                  Step 1: Choose Your Umrah / Hajj Package
                </h2>
                <p className="text-xs text-neutral-500">
                  Select your desired pilgrimage tour and departure schedule.
                </p>
              </div>

              <div className="space-y-3">
                {packages.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPkgSlug(p.slug)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedPkgSlug === p.slug
                        ? "border-forest-900 bg-emerald-50/40 ring-2 ring-forest-900/10"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div>
                      <h3 className="text-sm font-serif font-bold text-forest-950">{p.name}</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Departure: <strong>{p.departureDate}</strong> • {p.durationDays} Days • {p.departureCity} Flight
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-forest-950 block">
                        ₹{p.basePrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {p.totalSeats - p.bookedSeats} seats open
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold px-6 py-3 rounded-xl text-xs shadow-md"
                >
                  <span>Continue to Pilgrim Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TRAVELLER DETAILS */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-neutral-100 pb-3">
                <h2 className="text-xl font-serif font-bold text-forest-950">
                  Step 2: Primary Contact & Pilgrim Counts
                </h2>
                <p className="text-xs text-neutral-500">
                  Enter the primary family coordinator details.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Primary Pilgrim Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryCustomer.name}
                    onChange={(e) =>
                      setPrimaryCustomer({ ...primaryCustomer, name: e.target.value })
                    }
                    placeholder="e.g. Haji Nizam Tamboli"
                    className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Phone / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={primaryCustomer.phone}
                    onChange={(e) =>
                      setPrimaryCustomer({ ...primaryCustomer, phone: e.target.value })
                    }
                    placeholder="e.g. +91 8888890830"
                    className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={primaryCustomer.whatsapp}
                    onChange={(e) =>
                      setPrimaryCustomer({ ...primaryCustomer, whatsapp: e.target.value })
                    }
                    placeholder="Same as mobile or different"
                    className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={primaryCustomer.email}
                    onChange={(e) =>
                      setPrimaryCustomer({ ...primaryCustomer, email: e.target.value })
                    }
                    placeholder="name@gmail.com"
                    className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={primaryCustomer.city}
                    onChange={(e) =>
                      setPrimaryCustomer({ ...primaryCustomer, city: e.target.value })
                    }
                    placeholder="Pune, Maharashtra"
                    className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Number of Adults (12+ Yrs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={adultsCount}
                    onChange={(e) => handleAdultsChange(parseInt(e.target.value) || 1)}
                    className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={() => {
                    if (!primaryCustomer.name || !primaryCustomer.phone) {
                      setError("Please provide at least your full name and phone number.");
                      return;
                    }
                    setError(null);
                    setStep(3);
                  }}
                  className="inline-flex items-center gap-2 bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold px-6 py-3 rounded-xl text-xs shadow-md"
                >
                  <span>Continue to Passport Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PASSPORT DETAILS */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-neutral-100 pb-3">
                <h2 className="text-xl font-serif font-bold text-forest-950">
                  Step 3: Pilgrim & Passport Information
                </h2>
                <p className="text-xs text-neutral-500">
                  Enter passport numbers as printed in your passports. You can also upload copies after booking.
                </p>
              </div>

              <div className="space-y-4">
                {travellers.map((traveller, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-neutral-200 bg-ivory-50/60 space-y-3">
                    <h4 className="text-xs font-bold text-forest-950 uppercase tracking-wide">
                      Pilgrim #{idx + 1} {idx === 0 && "(Primary Lead)"}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Full Name (As on Passport) *
                        </label>
                        <input
                          type="text"
                          required
                          value={traveller.fullName || (idx === 0 ? primaryCustomer.name : "")}
                          onChange={(e) =>
                            handleTravellerChange(idx, "fullName", e.target.value)
                          }
                          placeholder="e.g. MOHAMMED FARHAN"
                          className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Passport Number
                        </label>
                        <input
                          type="text"
                          value={traveller.passportNumber}
                          onChange={(e) =>
                            handleTravellerChange(idx, "passportNumber", e.target.value.toUpperCase())
                          }
                          placeholder="e.g. Z1892345"
                          className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Gender
                        </label>
                        <select
                          value={traveller.gender}
                          onChange={(e) => handleTravellerChange(idx, "gender", e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 bg-white"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold px-6 py-3 rounded-xl text-xs shadow-md"
                >
                  <span>Continue to Room Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ROOM SELECTION */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-neutral-100 pb-3">
                <h2 className="text-xl font-serif font-bold text-forest-950">
                  Step 4: Select Room Configuration
                </h2>
                <p className="text-xs text-neutral-500">
                  Choose your room sharing preference in Makkah and Madinah hotels.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(["QUAD", "TRIPLE", "DOUBLE"] as const).map((r) => {
                  const rate =
                    r === "DOUBLE"
                      ? selectedPkg.priceDouble || selectedPkg.basePrice * 1.25
                      : r === "TRIPLE"
                      ? selectedPkg.priceTriple || selectedPkg.basePrice * 1.1
                      : selectedPkg.priceQuad || selectedPkg.basePrice;

                  return (
                    <div
                      key={r}
                      onClick={() => setRoomType(r)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                        roomType === r
                          ? "border-forest-900 bg-emerald-50/50 ring-2 ring-forest-900/10"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <h4 className="text-sm font-serif font-bold text-forest-950">
                        {r === "QUAD" ? "Quad Sharing (4 Beds)" : r === "TRIPLE" ? "Triple Sharing (3 Beds)" : "Double Sharing (2 Beds)"}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        {r === "QUAD" ? "Most popular family & group choice" : r === "TRIPLE" ? "Comfortable 3-person private room" : "Private double room for couple / 2 persons"}
                      </p>
                      <div className="pt-2">
                        <span className="text-lg font-bold text-emerald-800">
                          ₹{rate.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-neutral-400"> / person</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-2 bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold px-6 py-3 rounded-xl text-xs shadow-md"
                >
                  <span>Continue to Add-ons</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: ADD-ONS */}
          {step === 5 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-neutral-100 pb-3">
                <h2 className="text-xl font-serif font-bold text-forest-950">
                  Step 5: Optional Travel Enhancements
                </h2>
                <p className="text-xs text-neutral-500">
                  Tailor your pilgrimage with specialized elder assistance or room upgrades.
                </p>
              </div>

              <div className="space-y-3">
                <label className="p-4 rounded-2xl border border-neutral-200 flex items-center justify-between cursor-pointer hover:bg-neutral-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addons.wheelchair}
                      onChange={(e) => setAddons({ ...addons, wheelchair: e.target.checked })}
                      className="w-4 h-4 text-forest-900 rounded"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-forest-950">
                        Elderly Wheelchair Assistance at Airports & Haram
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Dedicated assistant for airport transits and Tawaf circuits.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-neutral-800">+₹5,000</span>
                </label>

                <label className="p-4 rounded-2xl border border-neutral-200 flex items-center justify-between cursor-pointer hover:bg-neutral-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addons.haramView}
                      onChange={(e) => setAddons({ ...addons, haramView: e.target.checked })}
                      className="w-4 h-4 text-forest-900 rounded"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-forest-950">
                        Haram View Room Upgrade Guarantee
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Direct view of the holy mosque from your hotel room window.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-neutral-800">+₹15,000</span>
                </label>

                <label className="p-4 rounded-2xl border border-neutral-200 flex items-center justify-between cursor-pointer hover:bg-neutral-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addons.extraZamzam}
                      onChange={(e) => setAddons({ ...addons, extraZamzam: e.target.checked })}
                      className="w-4 h-4 text-forest-900 rounded"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-forest-950">
                        Additional 5-Litre Blessed Zamzam Cans (Pack of 2)
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Extra sealed blessed Zamzam for family distribution.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-neutral-800">+₹2,000</span>
                </label>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="inline-flex items-center gap-2 bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold px-6 py-3 rounded-xl text-xs shadow-md"
                >
                  <span>Continue to Payment Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: PAYMENT */}
          {step === 6 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-neutral-100 pb-3">
                <h2 className="text-xl font-serif font-bold text-forest-950">
                  Step 6: Review Summary & Secure Reservation
                </h2>
                <p className="text-xs text-neutral-500">
                  Choose between advance token payment or full settlement.
                </p>
              </div>

              {/* Cost Summary Box */}
              <div className="bg-ivory-100/70 p-5 rounded-2xl border border-neutral-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Selected Package:</span>
                  <span className="font-semibold text-neutral-900">{selectedPkg.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Room Sharing:</span>
                  <span className="font-semibold text-neutral-900">{roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Pilgrims:</span>
                  <span className="font-semibold text-neutral-900">{travellersTotalCount} person(s)</span>
                </div>
                {addonsTotal > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Add-ons Total:</span>
                    <span>+₹{addonsTotal.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-neutral-200 flex justify-between text-sm font-bold text-forest-950">
                  <span>Grand Total Package Price:</span>
                  <span className="text-emerald-800">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Payment Type Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setPaymentOption("ADVANCE")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentOption === "ADVANCE"
                      ? "border-forest-900 bg-emerald-50/50 ring-2 ring-forest-900/10"
                      : "border-neutral-200"
                  }`}
                >
                  <h4 className="text-xs font-bold text-forest-950">Pay Booking Token Advance</h4>
                  <p className="text-[11px] text-neutral-500">₹25,000 per pilgrim to lock seats</p>
                  <div className="text-base font-bold text-forest-950 mt-1">
                    ₹{advanceRequired.toLocaleString("en-IN")}
                  </div>
                </div>

                <div
                  onClick={() => setPaymentOption("FULL")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentOption === "FULL"
                      ? "border-forest-900 bg-emerald-50/50 ring-2 ring-forest-900/10"
                      : "border-neutral-200"
                  }`}
                >
                  <h4 className="text-xs font-bold text-forest-950">Pay Full Amount</h4>
                  <p className="text-[11px] text-neutral-500">Complete payment now</p>
                  <div className="text-base font-bold text-forest-950 mt-1">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "BANK_TRANSFER", label: "Bank Transfer (NEFT/RTGS)" },
                    { id: "UPI", label: "UPI / QR Code" },
                    { id: "CASH", label: "Office Cash / Cheque" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                        paymentMethod === m.id
                          ? "bg-forest-900 text-gold-300 border-forest-900"
                          : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Banking Details Banner */}
              <div className="bg-forest-950 text-white p-4 rounded-2xl text-xs space-y-1 border border-gold-500/20">
                <p className="text-gold-300 font-bold">Official Al-Gafur Account Details:</p>
                <p>Account Name: AL-GAFUR INTERNATIONAL TOURS AND TRAVELS</p>
                <p>Bank: HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0001234</p>
                <p>UPI ID: algafurtours@hdfcbank</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Transaction / UTR Reference (If already transferred)
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. UTR1982736481 or UPI Ref"
                  className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={handleSubmitBooking}
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-forest-950 font-bold px-8 py-3.5 rounded-xl text-sm shadow-gold transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-forest-950" />
                  <span>
                    {loading ? "Confirming Booking..." : `Confirm Booking (Pay ₹${payableNow.toLocaleString("en-IN")})`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: CONFIRMATION & RECEIPT */}
          {step === 7 && bookingResult && (
            <div className="space-y-6 text-center animate-scaleUp py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Booking Confirmed
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 mt-3">
                  Mubarak! Your Pilgrimage is Reserved.
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-md mx-auto">
                  A confirmation SMS &amp; WhatsApp has been prepared. Your customer portal account has been generated.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-ivory-50 p-6 rounded-3xl border border-gold-500/30 text-left max-w-md mx-auto space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                  <BrandLogo size="sm" />
                  <span className="font-mono font-bold text-forest-950 text-sm">
                    {bookingResult.bookingNumber}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-500">Lead Pilgrim:</span>
                  <span className="font-bold text-neutral-900">{primaryCustomer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Package:</span>
                  <span className="font-bold text-neutral-900">{selectedPkg.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Receipt No:</span>
                  <span className="font-mono text-emerald-800 font-bold">{bookingResult.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Paid Amount:</span>
                  <span className="font-bold text-forest-950 text-sm">
                    ₹{payableNow.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Balance Outstanding:</span>
                  <span className="font-bold text-amber-800">
                    ₹{(grandTotal - payableNow).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <Link
                  href={`/customer/dashboard`}
                  className="inline-flex items-center gap-2 bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold py-3 px-6 rounded-xl text-xs shadow-md"
                >
                  <User className="w-4 h-4" />
                  Go to Customer Portal
                </Link>

                <a
                  href={`https://wa.me/919890708013?text=Assalamualaikum,%20my%20booking%20reference%20is%20${bookingResult.bookingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl text-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  Share on WhatsApp
                </a>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-semibold py-3 px-4 rounded-xl text-xs"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

