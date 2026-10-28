"use client";

import React, { useState, useMemo } from "react";
import YouTubeLeadsNav from "@/components/admin/YouTubeLeadsNav";
import PublicLeadFormClient from "@/components/lead/PublicLeadFormClient";
import {
  FormFieldType,
  FormQuestion,
  FIELD_TYPE_META,
  DEFAULT_YOUTUBE_FORM_QUESTIONS,
} from "@/lib/youtube-leads";
import { buildCanonicalUrl } from "@/lib/site-url";
import {
  Plus,
  Save,
  Eye,
  Sliders,
  Share2,
  Trash2,
  Copy,
  Check,
  ArrowUp,
  ArrowDown,
  GripVertical,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe,
  Lock,
  Link2,
  Video,
} from "lucide-react";

export interface BuilderFormRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  campaignName: string;
  packageId: string;
  packageName: string | null;
  packageSlug: string | null;
  status: string;
  isActive: boolean;
  isDefault: boolean;
  successTitle: string;
  successMessage: string;
  submitButtonText: string;
  showLogo: boolean;
  version: number;
  submissionsCount: number;
  questions: FormQuestion[];
  updatedAt: string;
}

interface PackageOption {
  id: string;
  name: string;
  slug: string;
  type: string;
}

export default function FormBuilderClient({
  initialForms,
  packages,
  initialFormId,
}: {
  initialForms: BuilderFormRecord[];
  packages: PackageOption[];
  initialFormId: string;
}) {
  const [forms, setForms] = useState<BuilderFormRecord[]>(initialForms);
  const [selectedFormId, setSelectedFormId] = useState<string>(
    initialFormId || initialForms[0]?.id || ""
  );

  const currentForm = useMemo(
    () => forms.find((f) => f.id === selectedFormId) || forms[0],
    [forms, selectedFormId]
  );

  // Local editable state synced when switching form
  const [title, setTitle] = useState(currentForm?.title || "");
  const [slug, setSlug] = useState(currentForm?.slug || "");
  const [description, setDescription] = useState(
    currentForm?.description || ""
  );
  const [campaignName, setCampaignName] = useState(
    currentForm?.campaignName || ""
  );
  const [packageId, setPackageId] = useState(currentForm?.packageId || "");
  const [status, setStatus] = useState(currentForm?.status || "PUBLISHED");
  const [isActive, setIsActive] = useState(currentForm?.isActive ?? true);
  const [successTitle, setSuccessTitle] = useState(
    currentForm?.successTitle || "JazakAllah Khair! We Received Your Request."
  );
  const [successMessage, setSuccessMessage] = useState(
    currentForm?.successMessage ||
      "Our Hajj & Umrah specialist will contact you shortly on your mobile/WhatsApp with complete package details."
  );
  const [submitButtonText, setSubmitButtonText] = useState(
    currentForm?.submitButtonText || "Request Free Call & Package Details"
  );
  const [showLogo, setShowLogo] = useState(currentForm?.showLogo ?? true);
  const [questions, setQuestions] = useState<FormQuestion[]>(
    currentForm?.questions || DEFAULT_YOUTUBE_FORM_QUESTIONS
  );

  const [activeTab, setActiveTab] = useState<"BUILD" | "PREVIEW" | "SHARE">(
    "BUILD"
  );
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<
    Record<string, boolean>
  >({});
  const [confirmDeleteQId, setConfirmDeleteQId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Create new form modal
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState("");
  const [newFormSlug, setNewFormSlug] = useState("");
  const [newFormCampaign, setNewFormCampaign] = useState("");
  const [creatingForm, setCreatingForm] = useState(false);

  // Saving state
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Copy link states
  const [copiedPublicUrl, setCopiedPublicUrl] = useState(false);
  const [copiedTrackingUrl, setCopiedTrackingUrl] = useState(false);

  // Campaign tracking generator states
  const [utmSource, setUtmSource] = useState("youtube");
  const [utmMedium, setUtmMedium] = useState("video_description");
  const [utmCampaignInput, setUtmCampaignInput] = useState(
    currentForm?.campaignName || "ramadan_umrah_2026"
  );
  const [utmContentInput, setUtmContentInput] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");

  const selectForm = (form: BuilderFormRecord) => {
    setSelectedFormId(form.id);
    setTitle(form.title);
    setSlug(form.slug);
    setDescription(form.description);
    setCampaignName(form.campaignName);
    setPackageId(form.packageId);
    setStatus(form.status);
    setIsActive(form.isActive);
    setSuccessTitle(form.successTitle);
    setSuccessMessage(form.successMessage);
    setSubmitButtonText(form.submitButtonText);
    setShowLogo(form.showLogo);
    setQuestions(form.questions);
    setUtmCampaignInput(form.campaignName || "ramadan_umrah_2026");
    setSaveFeedback(null);
  };

  const publicFormPath =
    slug === "youtube-lead" ? "/youtube-lead" : `/lead/${slug}`;

  const fullPublicUrl = useMemo(() => {
    return buildCanonicalUrl(publicFormPath);
  }, [publicFormPath]);

  const campaignTrackingUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (utmSource.trim()) params.set("utm_source", utmSource.trim());
    if (utmMedium.trim()) params.set("utm_medium", utmMedium.trim());
    if (utmCampaignInput.trim())
      params.set("utm_campaign", utmCampaignInput.trim());
    if (utmContentInput.trim())
      params.set("utm_content", utmContentInput.trim());
    if (videoUrlInput.trim()) params.set("video", videoUrlInput.trim());
    return buildCanonicalUrl(publicFormPath, params);
  }, [
    publicFormPath,
    utmSource,
    utmMedium,
    utmCampaignInput,
    utmContentInput,
    videoUrlInput,
  ]);

  // Question operations
  const handleAddQuestion = () => {
    const newId = `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newQuestion: FormQuestion = {
      id: newId,
      type: "SHORT_TEXT",
      label: "New Question",
      placeholder: "Type your answer here...",
      helperText: "",
      required: false,
      order: questions.length + 1,
    };
    setQuestions((prev) => [...prev, newQuestion]);
    setExpandedQuestionIds((prev) => ({ ...prev, [newId]: true }));
  };

  const handleUpdateQuestion = (
    qId: string,
    patch: Partial<FormQuestion>
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const updated = { ...q, ...patch };
        const meta = FIELD_TYPE_META.find((m) => m.type === updated.type);
        if (meta?.hasOptions && (!updated.options || updated.options.length === 0)) {
          updated.options = ["Option 1", "Option 2", "Option 3"];
        }
        return updated;
      })
    );
  };

  const handleDuplicateQuestion = (index: number) => {
    const source = questions[index];
    if (!source) return;
    const copyId = `${source.id}_copy_${Date.now().toString(36).slice(-4)}`;
    const duplicated: FormQuestion = {
      ...source,
      id: copyId,
      label: `${source.label} (Copy)`,
      options: source.options ? [...source.options] : undefined,
      validation: source.validation ? { ...source.validation } : undefined,
      fieldRole: "custom", // keep original mapping unique
    };
    const next = [...questions];
    next.splice(index + 1, 0, duplicated);
    setQuestions(next.map((q, idx) => ({ ...q, order: idx + 1 })));
  };

  const handleDeleteQuestion = (qId: string) => {
    if (questions.length <= 1) {
      setSaveFeedback({
        type: "error",
        message: "A form must have at least one question.",
      });
      return;
    }
    setQuestions((prev) =>
      prev
        .filter((q) => q.id !== qId)
        .map((q, idx) => ({ ...q, order: idx + 1 }))
    );
    setConfirmDeleteQId(null);
  };

  const handleMoveQuestion = (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const next = [...questions];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    setQuestions(next.map((q, idx) => ({ ...q, order: idx + 1 })));
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const next = [...questions];
    const [moved] = next.splice(draggedIndex, 1);
    next.splice(index, 0, moved);
    setDraggedIndex(index);
    setQuestions(next.map((q, idx) => ({ ...q, order: idx + 1 })));
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Option operations for choice fields
  const handleAddOption = (qId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const currentOpts = q.options || [];
        return {
          ...q,
          options: [...currentOpts, `Option ${currentOpts.length + 1}`],
        };
      })
    );
  };

  const handleUpdateOption = (qId: string, optIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const nextOpts = [...(q.options || [])];
        nextOpts[optIdx] = value;
        return { ...q, options: nextOpts };
      })
    );
  };

  const handleMoveOption = (
    qId: string,
    optIdx: number,
    direction: "UP" | "DOWN"
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const nextOpts = [...(q.options || [])];
        const target = direction === "UP" ? optIdx - 1 : optIdx + 1;
        if (target < 0 || target >= nextOpts.length) return q;
        const [moved] = nextOpts.splice(optIdx, 1);
        nextOpts.splice(target, 0, moved);
        return { ...q, options: nextOpts };
      })
    );
  };

  const handleDeleteOption = (qId: string, optIdx: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const nextOpts = (q.options || []).filter((_, i) => i !== optIdx);
        return { ...q, options: nextOpts };
      })
    );
  };

  // Save Form to Database
  const handleSaveForm = async (overrideStatus?: {
    status?: string;
    isActive?: boolean;
  }) => {
    if (!currentForm) return;
    setSaving(true);
    setSaveFeedback(null);

    const nextStatus = overrideStatus?.status ?? status;
    const nextIsActive = overrideStatus?.isActive ?? isActive;

    try {
      const res = await fetch(`/api/youtube-leads/forms/${currentForm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          campaignName: campaignName || null,
          packageId: packageId || null,
          status: nextStatus,
          isActive: nextIsActive,
          successTitle,
          successMessage,
          submitButtonText,
          showLogo,
          questions: questions.map((q, idx) => ({ ...q, order: idx + 1 })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveFeedback({
          type: "error",
          message: data.error || "Failed to save form configuration.",
        });
      } else {
        const updatedForm = data.form;
        const selectedPkg = packages.find((p) => p.id === updatedForm.packageId);
        const updatedRecord: BuilderFormRecord = {
          id: updatedForm.id,
          title: updatedForm.title,
          slug: updatedForm.slug,
          description: updatedForm.description || "",
          campaignName: updatedForm.campaignName || "",
          packageId: updatedForm.packageId || "",
          packageName: selectedPkg?.name || null,
          packageSlug: selectedPkg?.slug || null,
          status: updatedForm.status,
          isActive: updatedForm.isActive,
          isDefault: updatedForm.isDefault,
          successTitle: updatedForm.successTitle,
          successMessage: updatedForm.successMessage,
          submitButtonText: updatedForm.submitButtonText,
          showLogo: updatedForm.showLogo,
          version: updatedForm.version,
          submissionsCount: currentForm.submissionsCount,
          questions: Array.isArray(updatedForm.questions)
            ? updatedForm.questions
            : questions,
          updatedAt: updatedForm.updatedAt,
        };

        setForms((prev) =>
          prev.map((f) => (f.id === updatedRecord.id ? updatedRecord : f))
        );
        setStatus(updatedRecord.status);
        setIsActive(updatedRecord.isActive);
        setSlug(updatedRecord.slug);
        setSaveFeedback({
          type: "success",
          message: `Saved! Form is now at v${updatedRecord.version} (${
            updatedRecord.status === "PUBLISHED" && updatedRecord.isActive
              ? "Live & Accepting Responses"
              : "Draft / Closed"
          }).`,
        });
      }
    } catch {
      setSaveFeedback({
        type: "error",
        message: "Network error while saving form.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Create New Form
  const handleCreateNewForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormTitle.trim()) return;
    setCreatingForm(true);
    try {
      const res = await fetch("/api/youtube-leads/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newFormTitle.trim(),
          slug: newFormSlug.trim() || newFormTitle.trim(),
          campaignName: newFormCampaign.trim() || null,
          status: "PUBLISHED",
          isActive: true,
          questions: DEFAULT_YOUTUBE_FORM_QUESTIONS,
        }),
      });
      const data = await res.json();
      if (res.ok && data.form) {
        const f = data.form;
        const createdRecord: BuilderFormRecord = {
          id: f.id,
          title: f.title,
          slug: f.slug,
          description: f.description || "",
          campaignName: f.campaignName || "",
          packageId: f.packageId || "",
          packageName: null,
          packageSlug: null,
          status: f.status,
          isActive: f.isActive,
          isDefault: f.isDefault,
          successTitle: f.successTitle,
          successMessage: f.successMessage,
          submitButtonText: f.submitButtonText,
          showLogo: f.showLogo,
          version: f.version,
          submissionsCount: 0,
          questions: Array.isArray(f.questions)
            ? f.questions
            : DEFAULT_YOUTUBE_FORM_QUESTIONS,
          updatedAt: f.updatedAt,
        };
        setForms((prev) => [...prev, createdRecord]);
        selectForm(createdRecord);
        setShowNewFormModal(false);
        setNewFormTitle("");
        setNewFormSlug("");
        setNewFormCampaign("");
      } else {
        setSaveFeedback({
          type: "error",
          message: data.error || "Could not create form.",
        });
      }
    } finally {
      setCreatingForm(false);
    }
  };

  const selectedPackageObj = packages.find((p) => p.id === packageId) || null;
  const isPublishedAndActive = status === "PUBLISHED" && isActive;

  return (
    <div className="space-y-6 pb-20">
      <YouTubeLeadsNav
        title="Google Forms-Style Lead Form Builder"
        subtitle="Create, customize, reorder questions, preview, and publish shareable YouTube lead capture forms."
        rightAction={
          <button
            type="button"
            onClick={() => setShowNewFormModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Create New Form
          </button>
        }
      />

      {/* Form Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Form:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {forms.map((f) => {
              const isSelected = f.id === currentForm?.id;
              const live = f.status === "PUBLISHED" && f.isActive;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => selectForm(f)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      live ? "bg-emerald-400" : "bg-slate-400"
                    }`}
                  />
                  <span>{f.title}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      isSelected
                        ? "bg-white/15 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {f.submissionsCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Publish / Copy Link Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              const nextLive = !isPublishedAndActive;
              setStatus(nextLive ? "PUBLISHED" : "DRAFT");
              setIsActive(nextLive);
              handleSaveForm({
                status: nextLive ? "PUBLISHED" : "DRAFT",
                isActive: nextLive,
              });
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              isPublishedAndActive
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
            }`}
          >
            {isPublishedAndActive ? (
              <>
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                Published (Click to Unpublish)
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Unpublished / Closed (Click to Publish)
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(fullPublicUrl);
              setCopiedPublicUrl(true);
              setTimeout(() => setCopiedPublicUrl(false), 2000);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            {copiedPublicUrl ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Copied URL!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Public Link
              </>
            )}
          </button>

          <a
            href={publicFormPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Public Page
          </a>
        </div>
      </div>

      {/* Save Feedback Banner */}
      {saveFeedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            saveFeedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-bold">
            {saveFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{saveFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveFeedback(null)}
            className="text-xs underline opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Mode Tabs: Questions & Design | Live Preview | Share & Tracking Links */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("BUILD")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "BUILD"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Questions & Form Design ({questions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("PREVIEW")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "PREVIEW"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Form Preview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("SHARE")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "SHARE"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            YouTube Campaign Links
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleSaveForm()}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-bold shadow-sm transition-all"
        >
          <Save className="w-4 h-4 text-amber-400" />
          {saving ? "Saving..." : "Save Form Changes"}
        </button>
      </div>

      {/* TAB 1: BUILDER */}
      {activeTab === "BUILD" && (
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Google Forms-Style Top Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-emerald-800 via-emerald-600 to-amber-500" />
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Form Header & Settings
                  </span>
                  <span className="text-xs text-slate-400">
                    Version v{currentForm?.version || 1}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Public URL:{" "}
                  <strong className="text-emerald-700">{publicFormPath}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Form Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AL GAFUR INTERNATIONAL TOURS AND TRAVELS — Special YouTube Pilgrim Enquiry"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Form Description / Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Assalamu Alaikum! Fill in your basic travel preferences below..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Form URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    disabled={currentForm?.isDefault}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {currentForm?.isDefault
                      ? "Default form is permanently available at /youtube-lead and /lead/youtube-lead"
                      : `Accessible at /lead/${slug || "form-slug"}`}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Campaign Name (optional)
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g. YouTube Ramadan Umrah 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Associated Package (optional)
                  </label>
                  <select
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                  >
                    <option value="">No specific package linked</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} ({pkg.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Submit Button Text
                  </label>
                  <input
                    type="text"
                    value={submitButtonText}
                    onChange={(e) => setSubmitButtonText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirmation Heading
                  </label>
                  <input
                    type="text"
                    value={successTitle}
                    onChange={(e) => setSuccessTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirmation Message
                  </label>
                  <input
                    type="text"
                    value={successMessage}
                    onChange={(e) => setSuccessMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Display AL GAFUR Logo & Verified Branding Banner
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublishedAndActive}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setStatus(checked ? "PUBLISHED" : "DRAFT");
                      setIsActive(checked);
                    }}
                    className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                  />
                  <span className="text-xs font-bold text-emerald-800">
                    Form Active & Accepting Public Submissions
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((q, index) => {
              const typeMeta = FIELD_TYPE_META.find((m) => m.type === q.type);
              const isExpanded = !!expandedQuestionIds[q.id];

              return (
                <div
                  key={q.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-2xl border transition-all shadow-xs ${
                    draggedIndex === index
                      ? "border-emerald-500 ring-2 ring-emerald-500/20 opacity-80"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Card Top Bar: Drag Handle + Order + Reorder Controls */}
                  <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        title="Drag to reorder question"
                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
                      >
                        <GripVertical className="w-4 h-4" />
                      </span>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Question {index + 1}
                      </span>
                      {q.required && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                          Required
                        </span>
                      )}
                      {q.fieldRole && q.fieldRole !== "custom" && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          maps to: {q.fieldRole}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveQuestion(index, "UP")}
                        title="Move Question Up"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === questions.length - 1}
                        onClick={() => handleMoveQuestion(index, "DOWN")}
                        title="Move Question Down"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Main Content */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-8">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Question Text
                        </label>
                        <input
                          type="text"
                          value={q.label}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, {
                              label: e.target.value,
                            })
                          }
                          placeholder="Enter question title..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Question Type
                        </label>
                        <select
                          value={q.type}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, {
                              type: e.target.value as FormFieldType,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:border-emerald-600"
                        >
                          {FIELD_TYPE_META.map((meta) => (
                            <option key={meta.type} value={meta.type}>
                              {meta.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Choice Options Editor for RADIO, CHECKBOXES, DROPDOWN */}
                    {typeMeta?.hasOptions && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">
                            Choice Options ({(q.options || []).length})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddOption(q.id)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Option
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(q.options || []).map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className="flex items-center gap-2"
                            >
                              <span className="text-xs font-bold text-slate-400 w-5 text-center">
                                {optIdx + 1}.
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) =>
                                  handleUpdateOption(
                                    q.id,
                                    optIdx,
                                    e.target.value
                                  )
                                }
                                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                              />
                              <button
                                type="button"
                                disabled={optIdx === 0}
                                onClick={() =>
                                  handleMoveOption(q.id, optIdx, "UP")
                                }
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="Move Option Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={
                                  optIdx === (q.options || []).length - 1
                                }
                                onClick={() =>
                                  handleMoveOption(q.id, optIdx, "DOWN")
                                }
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                title="Move Option Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={(q.options || []).length <= 1}
                                onClick={() =>
                                  handleDeleteOption(q.id, optIdx)
                                }
                                className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30"
                                title="Remove Option"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expandable Helper Text, Placeholder & Validation Rules */}
                    {isExpanded && (
                      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Placeholder Text
                          </label>
                          <input
                            type="text"
                            value={q.placeholder || ""}
                            onChange={(e) =>
                              handleUpdateQuestion(q.id, {
                                placeholder: e.target.value,
                              })
                            }
                            placeholder="Shown inside empty input..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Helper / Description Text
                          </label>
                          <input
                            type="text"
                            value={q.helperText || ""}
                            onChange={(e) =>
                              handleUpdateQuestion(q.id, {
                                helperText: e.target.value,
                              })
                            }
                            placeholder="Small guidance text below label..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                          />
                        </div>

                        {(q.type === "SHORT_TEXT" ||
                          q.type === "PARAGRAPH") && (
                          <>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Minimum Characters (optional)
                              </label>
                              <input
                                type="number"
                                value={q.validation?.minLength ?? ""}
                                onChange={(e) =>
                                  handleUpdateQuestion(q.id, {
                                    validation: {
                                      ...q.validation,
                                      minLength: e.target.value
                                        ? Number(e.target.value)
                                        : undefined,
                                    },
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Maximum Characters (optional)
                              </label>
                              <input
                                type="number"
                                value={q.validation?.maxLength ?? ""}
                                onChange={(e) =>
                                  handleUpdateQuestion(q.id, {
                                    validation: {
                                      ...q.validation,
                                      maxLength: e.target.value
                                        ? Number(e.target.value)
                                        : undefined,
                                    },
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                              />
                            </div>
                          </>
                        )}

                        {q.type === "NUMBER" && (
                          <>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Minimum Number Value
                              </label>
                              <input
                                type="number"
                                value={q.validation?.min ?? ""}
                                onChange={(e) =>
                                  handleUpdateQuestion(q.id, {
                                    validation: {
                                      ...q.validation,
                                      min: e.target.value
                                        ? Number(e.target.value)
                                        : undefined,
                                    },
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Maximum Number Value
                              </label>
                              <input
                                type="number"
                                value={q.validation?.max ?? ""}
                                onChange={(e) =>
                                  handleUpdateQuestion(q.id, {
                                    validation: {
                                      ...q.validation,
                                      max: e.target.value
                                        ? Number(e.target.value)
                                        : undefined,
                                    },
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Question Footer Toolbar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedQuestionIds((prev) => ({
                            ...prev,
                            [q.id]: !prev[q.id],
                          }))
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            Hide Placeholder, Helper & Validation
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            Placeholder, Helper Text & Validation
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) =>
                              handleUpdateQuestion(q.id, {
                                required: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                          />
                          <span className="text-xs font-bold text-slate-700">
                            Required
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleDuplicateQuestion(index)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                          title="Duplicate Question"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Duplicate
                        </button>

                        {confirmDeleteQId === q.id ? (
                          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                            <span className="text-[11px] font-bold text-red-700">
                              Delete?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-[11px] font-extrabold text-white bg-red-600 hover:bg-red-700 px-2 py-0.5 rounded"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteQId(null)}
                              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-1"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteQId(q.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold"
                            title="Delete Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Question & Save Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Another Question
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setActiveTab("PREVIEW")}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                <Eye className="w-4 h-4" />
                Preview Form
              </button>
              <button
                type="button"
                onClick={() => handleSaveForm()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving Changes..." : "Save & Publish Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE PREVIEW */}
      {activeTab === "PREVIEW" && (
        <div className="space-y-4">
          <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Interactive Live Preview — test validation and layout before
                publishing changes.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("BUILD")}
              className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-bold shrink-0"
            >
              Back to Editor
            </button>
          </div>

          <PublicLeadFormClient
            form={{
              id: currentForm?.id || "preview",
              title: title || "Untitled Form",
              slug: slug || "youtube-lead",
              description: description || null,
              campaignName: campaignName || null,
              packageId: selectedPackageObj?.id || null,
              packageName: selectedPackageObj?.name || null,
              status,
              isActive,
              version: currentForm?.version || 1,
              successTitle,
              successMessage,
              submitButtonText,
              showLogo,
              questions,
            }}
            isPreview={true}
          />
        </div>
      )}

      {/* TAB 3: SHARE & CAMPAIGN TRACKING LINK BUILDER */}
      {activeTab === "SHARE" && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Shareable Public Link & YouTube Campaign URL Builder
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every pilgrim who submits via a campaign tracking link will have
                their UTM parameters and YouTube Video ID saved with their
                submission.
              </p>
            </div>
          </div>

          {/* Direct Public URL */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Direct Public Form Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={fullPublicUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(fullPublicUrl);
                  setCopiedPublicUrl(true);
                  setTimeout(() => setCopiedPublicUrl(false), 2000);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                {copiedPublicUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Campaign Tracking Builder */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Customize UTM & YouTube Video Tracking Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  UTM Source (`utm_source`)
                </label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="youtube"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  UTM Medium (`utm_medium`)
                </label>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="video_description"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  UTM Campaign (`utm_campaign`)
                </label>
                <input
                  type="text"
                  value={utmCampaignInput}
                  onChange={(e) => setUtmCampaignInput(e.target.value)}
                  placeholder="ramadan_umrah_2026"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  UTM Content (`utm_content` - optional)
                </label>
                <input
                  type="text"
                  value={utmContentInput}
                  onChange={(e) => setUtmContentInput(e.target.value)}
                  placeholder="pinned_comment_link"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  YouTube Video URL or 11-Character Video ID (`video` -
                  optional)
                </label>
                <input
                  type="text"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=xxxxxxxxxxx or video ID"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  Generated Campaign Tracking Link
                </span>
              </div>
              <code className="block text-xs text-amber-200 break-all bg-black/30 p-3 rounded-xl border border-white/10">
                {campaignTrackingUrl}
              </code>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(campaignTrackingUrl);
                    setCopiedTrackingUrl(true);
                    setTimeout(() => setCopiedTrackingUrl(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
                >
                  {copiedTrackingUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied Campaign Link!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Campaign Tracking Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Lead Form */}
      {showNewFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Create New Shareable Lead Form
            </h3>
            <p className="text-xs text-slate-500">
              Create a dedicated lead form with its own `/lead/[slug]` URL and
              pre-populated Hajj & Umrah questions that you can customize.
            </p>

            <form onSubmit={handleCreateNewForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Form Title *
                </label>
                <input
                  type="text"
                  required
                  value={newFormTitle}
                  onChange={(e) => {
                    setNewFormTitle(e.target.value);
                    if (!newFormSlug) {
                      setNewFormSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                      );
                    }
                  }}
                  placeholder="e.g. Hajj 2026 VIP Inquiry Form"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Slug (`/lead/[slug]`) *
                </label>
                <input
                  type="text"
                  required
                  value={newFormSlug}
                  onChange={(e) => setNewFormSlug(e.target.value)}
                  placeholder="hajj-2026-vip"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Default Campaign Name (optional)
                </label>
                <input
                  type="text"
                  value={newFormCampaign}
                  onChange={(e) => setNewFormCampaign(e.target.value)}
                  placeholder="YouTube Hajj 2026 Series"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFormModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingForm}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                >
                  {creatingForm ? "Creating..." : "Create Form"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
