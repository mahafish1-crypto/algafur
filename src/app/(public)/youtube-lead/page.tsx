import React, { Suspense } from "react";
import { getSiteSettings } from "@/lib/settings";
import {
  ensureDefaultYouTubeForm,
  parseFormQuestions,
} from "@/lib/youtube-leads";
import PublicLeadFormClient from "@/components/lead/PublicLeadFormClient";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const form = await ensureDefaultYouTubeForm();
  return {
    title: form.title,
    description:
      form.description ||
      "Submit your Hajj & Umrah enquiry to receive package details and a personal callback from AL GAFUR INTERNATIONAL TOURS AND TRAVELS.",
    alternates: {
      canonical: "/youtube-lead",
    },
  };
}

export default async function YouTubeLeadPublicPage() {
  const [form, settings] = await Promise.all([
    ensureDefaultYouTubeForm(),
    getSiteSettings(),
  ]);

  const serializedForm = {
    id: form.id,
    slug: form.slug,
    title: form.title,
    description: form.description,
    campaignName: form.campaignName,
    packageId: form.packageId,
    packageName: form.packageName,
    successTitle: form.successTitle,
    successMessage: form.successMessage,
    submitButtonText: form.submitButtonText,
    showLogo: form.showLogo,
    status: form.status,
    isActive: form.isActive,
    version: form.version,
    questions: parseFormQuestions(form.questionsJson),
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] py-6 sm:py-10">
      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto p-8 text-center text-sm text-neutral-500">
            Loading enquiry form...
          </div>
        }
      >
        <PublicLeadFormClient
          form={serializedForm}
          siteLogo={settings.site_logo || settings.header_logo || ""}
          supportPhone={settings.phone_1 || "+91 8793939393"}
          whatsappNumber={settings.whatsapp_number || "919890708013"}
        />
      </Suspense>
    </div>
  );
}

