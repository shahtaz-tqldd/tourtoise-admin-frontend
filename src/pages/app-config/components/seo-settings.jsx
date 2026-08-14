import { Globe2, Info, Search } from "lucide-react";
import { useWatch } from "react-hook-form";

import Card from "@/components/ui/card";
import { FloatingInput } from "@/components/ui/input";
import { FloatingTextarea } from "@/components/ui/textarea";
import ConfigSectionHeading from "./config-section-heading";

const SeoSettings = ({ control, register }) => {
  const metaTitle = useWatch({ control, name: "seo.meta_title" });
  const metaDescription = useWatch({ control, name: "seo.meta_description" });
  const appTitle = useWatch({ control, name: "branding.title" });

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <ConfigSectionHeading
          icon={Search}
          title="Search metadata"
          description="Control how the platform appears in search results and shared links."
        />
        <div className="space-y-6">
          <div>
            <FloatingInput
              label="Meta title"
              maxLength={200}
              {...register("seo.meta_title")}
            />
            <div className="mt-2 flex justify-between gap-3 text-xs text-slate-400">
              <span>Aim for a clear title under 60 characters.</span>
              <span className="tabular-nums">{(metaTitle || "").length}/200</span>
            </div>
          </div>
          <div>
            <FloatingTextarea
              label="Meta description"
              rows={6}
              textareaClassName="min-h-40"
              {...register("seo.meta_description")}
            />
            <div className="mt-2 flex justify-between gap-3 text-xs text-slate-400">
              <span>Aim for a useful description under 160 characters.</span>
              <span className="tabular-nums">{(metaDescription || "").length}</span>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            Search engines can choose different text based on the traveler’s query. These fields provide your preferred presentation.
          </div>
        </div>
      </Card>

      <Card className="xl:sticky xl:top-0">
        <div className="mb-5 flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-slate-800">Search preview</h2>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 font-bold text-primary">
              {(appTitle || "T").slice(0, 1).toUpperCase()}
            </span>
            <span className="truncate">{appTitle || "Tourtoise"}</span>
          </div>
          <p className="mt-3 line-clamp-1 text-lg font-medium text-blue-700">
            {metaTitle || appTitle || "Tourtoise — Plan your next journey"}
          </p>
          <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">
            {metaDescription ||
              "Discover destinations and create memorable travel plans with Tourtoise."}
          </p>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-400">
          This preview is illustrative and may differ across search engines.
        </p>
      </Card>
    </div>
  );
};

export default SeoSettings;
