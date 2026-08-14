import { Controller } from "react-hook-form";

import { cn } from "@/lib/utils";

const ToggleField = ({ control, name, title, description, icon, danger = false }) => {
  const ToggleIcon = icon;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div
          className={cn(
            "flex items-center gap-4 rounded-2xl border p-4 transition",
            field.value
              ? danger
                ? "border-amber-200 bg-amber-50/70"
                : "border-emerald-200 bg-emerald-50/60"
              : "border-slate-200 bg-slate-50/60",
          )}
        >
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm",
              field.value
                ? danger
                  ? "text-amber-600"
                  : "text-primary"
                : "text-slate-400",
            )}
          >
            <ToggleIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800">{title}</p>
            <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(field.value)}
            aria-label={title}
            onClick={() => field.onChange(!field.value)}
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
              field.value
                ? danger
                  ? "bg-amber-500"
                  : "bg-primary"
                : "bg-slate-300",
            )}
          >
            <span
              className={cn(
                "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                field.value && "translate-x-5",
              )}
            />
          </button>
        </div>
      )}
    />
  );
};

export default ToggleField;
