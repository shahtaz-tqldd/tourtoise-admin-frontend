import { useState } from "react";

import { toast } from "sonner";
import { Eye, FileKey2, Save, ShieldCheck, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Card from "@/components/ui/card";

const CONTENT_TYPES = [
  { id: "privacy", label: "Privacy policy", icon: ShieldCheck },
  { id: "protection", label: "Data protection", icon: FileKey2 },
  { id: "deletion", label: "Account deletion", icon: Trash2 },
];

const INITIAL_CONTENT = {
  privacy: {
    title: "Privacy Policy",
    slug: "/privacy-policy",
    status: "Published",
    updatedAt: "August 4, 2026",
    body: "Tourtoise respects the privacy of every traveler. This policy explains what personal information we collect, why we collect it, and how travelers can exercise control over their information.\n\nWe only process information required to provide trip planning, travel journals, recommendations, and account services.",
  },
  protection: {
    title: "Data Protection",
    slug: "/data-protection",
    status: "Published",
    updatedAt: "July 29, 2026",
    body: "We use appropriate technical and organizational safeguards to protect personal information against unauthorized access, alteration, disclosure, or loss.\n\nAccess to administrative systems is restricted to the platform owner and protected by secure authentication.",
  },
  deletion: {
    title: "Account Deletion",
    slug: "/account-deletion",
    status: "Draft",
    updatedAt: "August 1, 2026",
    body: "Travelers can request deletion of their account and associated personal information from account settings. Requests are reviewed and completed within the period required by applicable regulations.\n\nSome records may be retained where required for fraud prevention, security, or legal compliance.",
  },
};

const LegalContent = () => {
  const [activeContent, setActiveContent] = useState("privacy");
  const [content, setContent] = useState(INITIAL_CONTENT);
  const current = content[activeContent];

  const updateCurrent = (field, value) => {
    setContent((existing) => ({
      ...existing,
      [activeContent]: { ...existing[activeContent], [field]: value },
    }));
  };

  const saveContent = (publish = false) => {
    const nextStatus = publish ? "Published" : current.status;
    setContent((existing) => ({
      ...existing,
      [activeContent]: {
        ...existing[activeContent],
        status: nextStatus,
        updatedAt: "Just now",
      },
    }));
    toast.success(publish ? "Content published" : "Draft saved", {
      description: `${current.title} was updated locally.`,
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Card className="h-fit sticky top-12">
        <div className="pb-6">
          <h3 className="font-bold text-slate-900">Legal pages</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Content shown to travelers across Tourtoise.
          </p>
        </div>
        <div className="space-y-1">
          {CONTENT_TYPES.map((item) => {
            const Icon = item.icon;
            const active = activeContent === item.id;
            const itemContent = content[item.id];

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveContent(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    active ? "bg-white" : "bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] opacity-70">
                    {itemContent.status}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                {current.title}
              </h3>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  current.status === "Published"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {current.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Last updated {current.updatedAt}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm">
            <Eye /> Preview page
          </Button>
        </div>

        <div className="space-y-5 pt-5">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
            <FloatingInput
              name={`${activeContent}-title`}
              label="Page title"
              value={current.title}
              onChange={(event) => updateCurrent("title", event.target.value)}
            />
            <FloatingInput
              name={`${activeContent}-slug`}
              label="Page path"
              value={current.slug}
              onChange={(event) => updateCurrent("slug", event.target.value)}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor={`${activeContent}-body`}
                className="text-sm font-semibold text-slate-700"
              >
                Page content
              </label>
              <span className="text-xs tabular-nums text-slate-400">
                {current.body.length.toLocaleString()} characters
              </span>
            </div>
            <Textarea
              id={`${activeContent}-body`}
              value={current.body}
              onChange={(event) => updateCurrent("body", event.target.value)}
              rows={16}
              className="min-h-[360px] resize-y rounded-2xl border-slate-200 p-4 leading-7 shadow-none"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 mt-5  sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => saveContent(false)}
          >
            Save draft
          </Button>
          <Button type="button" onClick={() => saveContent(true)}>
            <Save /> Save and publish
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LegalContent;
