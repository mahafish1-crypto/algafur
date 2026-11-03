import React from "react";
import { verifyModuleAccess, AccessDeniedView } from "@/lib/rbac-server";
import { getWhatsAppApiKey } from "@/lib/settings";
import { buildCanonicalUrl } from "@/lib/site-url";
import WhatsAppApiSettingsClient from "./WhatsAppApiSettingsClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppApiSettingsPage() {
  const { allowed, session } = await verifyModuleAccess("settings");
  if (!allowed) {
    return <AccessDeniedView moduleKey="settings" session={session} />;
  }

  const apiKey = await getWhatsAppApiKey();
  const endpointUrl = buildCanonicalUrl("/api/v1/whatsapp/summary");
  const webhookUrl = `${endpointUrl}?api_key=${apiKey}`;

  return (
    <WhatsAppApiSettingsClient
      initialApiKey={apiKey}
      endpointUrl={endpointUrl}
      initialWebhookUrl={webhookUrl}
    />
  );
}

