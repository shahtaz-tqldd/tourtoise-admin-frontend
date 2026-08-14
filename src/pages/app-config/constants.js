import { FileText, Search, Settings2 } from "lucide-react";

export const DEFAULT_VALUES = {
  branding: { title: "", logo: "", favicon: "", support_email: "" },
  legal_document: {
    privacy_policy: "",
    terms_of_service: "",
    data_deletion_policy: "",
    cookie_policy: "",
  },
  feature: { is_vectorize_enabled: false, maintenance_mode: false },
  announcement: {
    notify_banner_enabled: false,
    notify_banner_text: "",
    notify_banner_url: "",
  },
  platform_default: { default_free_credits: 0, monthly_free_credits: 0 },
  seo: { meta_title: "", meta_description: "" },
  uploads: { logo: null, favicon: null },
};

export const PAGE_TABS = [
  { value: "platform", label: "Platform setup", icon: Settings2 },
  { value: "documents", label: "Documents", icon: FileText },
  { value: "seo", label: "SEO", icon: Search },
];

export const DOCUMENT_TABS = [
  {
    value: "privacy_policy",
    label: "Privacy policy",
    description: "How traveler information is collected and used.",
  },
  {
    value: "terms_of_service",
    label: "Terms of service",
    description: "Rules and conditions for using Tourtoise.",
  },
  {
    value: "data_deletion_policy",
    label: "Data deletion policy",
    description: "How travelers can remove their data.",
  },
  {
    value: "cookie_policy",
    label: "Cookie policy",
    description: "How cookies and similar technologies are used.",
  },
];

export const normalizeConfig = (config) => ({
  branding: { ...DEFAULT_VALUES.branding, ...config?.branding },
  legal_document: {
    ...DEFAULT_VALUES.legal_document,
    ...config?.legal_document,
  },
  feature: { ...DEFAULT_VALUES.feature, ...config?.feature },
  announcement: { ...DEFAULT_VALUES.announcement, ...config?.announcement },
  platform_default: {
    ...DEFAULT_VALUES.platform_default,
    ...config?.platform_default,
  },
  seo: { ...DEFAULT_VALUES.seo, ...config?.seo },
  uploads: { logo: null, favicon: null },
});

export const buildConfigFormData = (values) => {
  const formData = new FormData();

  Object.entries(values).forEach(([section, fields]) => {
    if (section === "uploads") return;

    Object.entries(fields).forEach(([field, value]) => {
      if (section === "branding" && (field === "logo" || field === "favicon")) {
        return;
      }
      formData.append(field, value ?? "");
    });
  });

  const logo = values.uploads?.logo?.[0];
  const favicon = values.uploads?.favicon?.[0];

  if (logo) formData.append("logo", logo);
  if (favicon) formData.append("favicon", favicon);
  else if (values.branding.favicon) {
    formData.append("favicon", values.branding.favicon);
  }

  return formData;
};

export const getErrorMessage = (error) => {
  const apiError = error?.data?.error;
  if (Array.isArray(apiError)) return apiError[0];
  if (typeof apiError === "string") return apiError;
  if (apiError && typeof apiError === "object") {
    const firstError = Object.values(apiError).flat()[0];
    if (firstError) return String(firstError);
  }
  return error?.data?.message || "Unable to update app configuration";
};

export const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};
