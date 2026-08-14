import { useState } from "react";
import { ChevronRight, FileText, ShieldCheck } from "lucide-react";
import { useWatch } from "react-hook-form";

import Card from "@/components/ui/card";
import { FloatingTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DOCUMENT_TABS } from "../constants";

const DocumentSettings = ({ control, register }) => {
  const [activeDocument, setActiveDocument] = useState(DOCUMENT_TABS[0].value);
  const documentContent = useWatch({
    control,
    name: `legal_document.${activeDocument}`,
  });
  const current = DOCUMENT_TABS.find((item) => item.value === activeDocument);

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
      <Card className="p-3 xl:sticky xl:top-10">
        <div className="px-3 pb-4 pt-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Legal documents
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Select a document to review and edit.
          </p>
        </div>
        <div className="space-y-1" role="tablist" aria-label="Legal documents">
          {DOCUMENT_TABS.map((document) => {
            const active = activeDocument === document.value;
            return (
              <button
                key={document.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveDocument(document.value)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition",
                  active
                    ? "bg-emerald-50 text-primary"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    active ? "bg-white shadow-sm" : "bg-slate-100",
                  )}
                >
                  <FileText className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-bold">
                  {document.label}
                </span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">{current.label}</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {current.description}
              </p>
            </div>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold tabular-nums text-slate-500">
            {(documentContent || "").length.toLocaleString()} characters
          </span>
        </div>

        <FloatingTextarea
          key={activeDocument}
          label={current.label}
          rows={18}
          textareaClassName="min-h-[460px] resize-y leading-7"
          {...register(`legal_document.${activeDocument}`)}
        />
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Changes to every document are kept while you switch tabs and are saved together.
        </p>
      </Card>
    </div>
  );
};

export default DocumentSettings;
