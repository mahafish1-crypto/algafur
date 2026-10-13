"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Globe,
  Info,
} from "lucide-react";

export interface LocationValue {
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  locationSource?: "GPS" | "MANUAL";
}

interface LocationInputModuleProps {
  id: string;
  label: string;
  required?: boolean;
  helperText?: string;
  placeholder?: string;
  value: LocationValue | string | null | undefined;
  onChange: (val: LocationValue) => void;
  error?: string;
}

export default function LocationInputModule({
  id,
  label,
  required = false,
  helperText,
  placeholder = "Your city, district, or address",
  value,
  onChange,
  error,
}: LocationInputModuleProps) {
  // Normalize incoming value to structured object
  const normalizedValue: LocationValue =
    typeof value === "object" && value !== null
      ? value
      : typeof value === "string" && value.trim()
      ? {
          city: value.split(",")[0]?.trim() || value,
          address: value,
          locationSource: "MANUAL",
        }
      : { locationSource: "MANUAL" };

  const [detecting, setDetecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "warning" | "error" | "info";
    text: string;
  } | null>(() => {
    if (normalizedValue.locationSource === "GPS" && normalizedValue.city) {
      return {
        type: "success",
        text: `GPS Location detected: ${normalizedValue.city}${
          normalizedValue.state ? `, ${normalizedValue.state}` : ""
        }`,
      };
    }
    return null;
  });

  const [showDetailedFields, setShowDetailedFields] = useState(() => {
    return Boolean(
      normalizedValue.state ||
        normalizedValue.postalCode ||
        normalizedValue.district ||
        normalizedValue.locationSource === "GPS"
    );
  });

  const handleFieldChange = (field: keyof LocationValue, val: string) => {
    const updated: LocationValue = {
      ...normalizedValue,
      [field]: val,
      // If user edits text manually, preserve user edit
      locationSource:
        normalizedValue.locationSource === "GPS" ? "GPS" : "MANUAL",
    };

    // If city is updated, update combined address if address was empty
    if (field === "city" && !updated.address) {
      updated.address = val;
    }
    onChange(updated);
  };

  const handleDetectLocation = async () => {
    if (detecting) return;

    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatusMessage({
        type: "warning",
        text: "Geolocation is not supported by your browser. Please type your city manually.",
      });
      setShowDetailedFields(true);
      return;
    }

    setDetecting(true);
    setStatusMessage({
      type: "info",
      text: "Detecting location… Please allow browser location access.",
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Call secure backend reverse geocoding API
          const res = await fetch(
            `/api/geo/reverse?lat=${latitude}&lon=${longitude}`
          );
          const json = await res.json();

          if (res.ok && json.success && json.data) {
            const data = json.data;
            const updatedLocation: LocationValue = {
              city: data.city || normalizedValue.city || "Detected City",
              district: data.district || "",
              state: data.state || "",
              postalCode: data.postalCode || "",
              country: data.country || "India",
              address: data.address || `${data.city}, ${data.state}`,
              latitude,
              longitude,
              locationSource: "GPS",
            };

            onChange(updatedLocation);
            setShowDetailedFields(true);
            setStatusMessage({
              type: "success",
              text: `Location detected: ${data.city || "Current Location"}${
                data.state ? `, ${data.state}` : ""
              }${data.postalCode ? ` (${data.postalCode})` : ""}`,
            });
          } else {
            // Geocoding service error but coordinates received
            const fallbackLocation: LocationValue = {
              ...normalizedValue,
              latitude,
              longitude,
              locationSource: "GPS",
            };
            onChange(fallbackLocation);
            setShowDetailedFields(true);
            setStatusMessage({
              type: "warning",
              text:
                json.error ||
                "GPS coordinates captured. Please confirm your city/town name below.",
            });
          }
        } catch (fetchErr) {
          console.error("Geocoding request failed:", fetchErr);
          setStatusMessage({
            type: "warning",
            text: "Coordinates acquired. Please type your city/address below.",
          });
          setShowDetailedFields(true);
        } finally {
          setDetecting(false);
        }
      },
      (geoError) => {
        setDetecting(false);
        setShowDetailedFields(true);

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setStatusMessage({
              type: "warning",
              text: "Permission denied. You can simply type your city/district below.",
            });
            break;
          case geoError.POSITION_UNAVAILABLE:
            setStatusMessage({
              type: "error",
              text: "Unable to detect location. Please enter your city/district manually.",
            });
            break;
          case geoError.TIMEOUT:
            setStatusMessage({
              type: "warning",
              text: "Location detection timed out. Please enter your city/district manually.",
            });
            break;
          default:
            setStatusMessage({
              type: "warning",
              text: "Could not access location. Please type your city manually.",
            });
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="space-y-3">
      {/* Label & Description */}
      <div>
        <label
          htmlFor={`${id}_city`}
          className="block text-sm font-bold text-neutral-900"
        >
          {label}
          {required && (
            <span className="text-rose-600 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {helperText && (
          <p className="text-xs text-neutral-500 mt-0.5">{helperText}</p>
        )}
      </div>

      {/* GPS Detect Action Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={detecting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-300 font-semibold text-xs transition-all shadow-2xs disabled:opacity-60 cursor-pointer"
        >
          {detecting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-emerald-800 animate-spin" />
              <span>Detecting location…</span>
            </>
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>📍 Detect My Location</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowDetailedFields((prev) => !prev)}
          className="text-xs text-neutral-600 hover:text-neutral-900 font-medium underline underline-offset-2 px-2 py-1"
        >
          {showDetailedFields ? "Hide details" : "+ Enter address / PIN manually"}
        </button>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          role="status"
          className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
              : statusMessage.type === "warning"
              ? "bg-amber-50/90 border-amber-200 text-amber-900"
              : statusMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          {statusMessage.type === "success" && (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          )}
          {statusMessage.type === "warning" && (
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          )}
          {statusMessage.type === "error" && (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          {statusMessage.type === "info" && (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0 mt-0.5" />
          )}
          <span className="leading-snug">{statusMessage.text}</span>
        </div>
      )}

      {/* Primary City / District Input */}
      <div>
        <div className="relative">
          <input
            id={`${id}_city`}
            type="text"
            required={required}
            value={normalizedValue.city || ""}
            onChange={(e) => handleFieldChange("city", e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0D3B2E] focus:ring-2 focus:ring-emerald-900/10"
          />
          <Navigation className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
        </div>
        <p className="text-[11px] text-neutral-400 mt-1">
          City or district (e.g. Pune, Mumbai, Nashik, Aurangabad, Hyderabad)
        </p>
      </div>

      {/* Detailed Address Breakdown (Manual or Detected Breakdown) */}
      {showDetailedFields && (
        <div className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200 space-y-3 pt-3.5 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-700 pb-1 border-b border-neutral-200/80">
            <span>Detailed Address & Regional Info</span>
            {normalizedValue.locationSource === "GPS" && (
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                GPS Verified
              </span>
            )}
          </div>

          {/* Full Address / Locality */}
          <div>
            <label
              htmlFor={`${id}_address`}
              className="block text-xs font-medium text-neutral-700 mb-1"
            >
              Locality / Street Address
            </label>
            <input
              id={`${id}_address`}
              type="text"
              value={normalizedValue.address || ""}
              onChange={(e) => handleFieldChange("address", e.target.value)}
              placeholder="Area, colony, or landmark"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0D3B2E]"
            />
          </div>

          {/* State & PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor={`${id}_state`}
                className="block text-xs font-medium text-neutral-700 mb-1"
              >
                State
              </label>
              <input
                id={`${id}_state`}
                type="text"
                value={normalizedValue.state || ""}
                onChange={(e) => handleFieldChange("state", e.target.value)}
                placeholder="Maharashtra, Karnataka, etc."
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0D3B2E]"
              />
            </div>
            <div>
              <label
                htmlFor={`${id}_postalCode`}
                className="block text-xs font-medium text-neutral-700 mb-1"
              >
                PIN / Postal Code
              </label>
              <input
                id={`${id}_postalCode`}
                type="text"
                value={normalizedValue.postalCode || ""}
                onChange={(e) => handleFieldChange("postalCode", e.target.value)}
                placeholder="e.g. 411001"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0D3B2E]"
              />
            </div>
          </div>

          {/* Latitude & Longitude display if present */}
          {Number.isFinite(normalizedValue.latitude) &&
            Number.isFinite(normalizedValue.longitude) && (
              <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 pt-1">
                <Globe className="w-3 h-3 text-emerald-700" />
                <span>
                  Coordinates: {normalizedValue.latitude?.toFixed(4)},{" "}
                  {normalizedValue.longitude?.toFixed(4)} (Approximate device location)
                </span>
              </div>
            )}
        </div>
      )}

      {error && (
        <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

