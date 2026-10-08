"use client";

import React, { SelectHTMLAttributes, forwardRef } from "react";

export interface AdminSelectOption {
  value: string;
  label: string;
}

export interface AdminSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "options"> {
  label?: string;
  options?: AdminSelectOption[];
  error?: string;
  helperText?: string;
  themeMode?: "dark" | "light";
}

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  (
    {
      label,
      options,
      children,
      className = "",
      error,
      helperText,
      themeMode = "dark",
      ...props
    },
    ref
  ) => {
    const isDark = themeMode === "dark";

    const baseStyles = isDark
      ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-gold-400 focus:ring-1 focus:ring-gold-400/50"
      : "bg-white border-slate-300 text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/50";

    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-xs font-semibold text-slate-300">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-3 py-2 text-xs rounded-xl border transition-colors outline-none cursor-pointer appearance-none ${baseStyles} ${
            error ? "border-red-500" : ""
          } ${className}`}
          style={{
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#f8fafc" : "#0f172a",
          }}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  style={{
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    color: isDark ? "#f8fafc" : "#0f172a",
                  }}
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {helperText && !error && (
          <p className="text-[11px] text-slate-400">{helperText}</p>
        )}
        {error && <p className="text-[11px] text-red-400">{error}</p>}
      </div>
    );
  }
);

AdminSelect.displayName = "AdminSelect";
export default AdminSelect;

