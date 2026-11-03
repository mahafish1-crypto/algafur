"use client";

import React from "react";
import PackageWizardBuilder from "./PackageWizardBuilder";

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (pkg: any) => void;
  initialPackage?: any | null;
}

export default function PackageFormModal({
  isOpen,
  onClose,
  onSaved,
  initialPackage,
}: PackageFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl my-auto">
        <PackageWizardBuilder
          initialPackage={initialPackage}
          onSaved={(pkg) => {
            onSaved(pkg);
            onClose();
          }}
          onCancel={onClose}
          isFullPage={false}
        />
      </div>
    </div>
  );
}
