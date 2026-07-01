import { Controller } from "react-hook-form";
import { Title, Text } from "@/components/ui/typography";
import { MONTH_OPTIONS } from "../constants";
import { normalizeMonths } from "@/lib/date-time";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const StepShell = ({ title, description, children }) => {
  return (
    <section className="min-w-0 rounded-3xl bg-white p-8 border">
      <div className="mb-10">
        <Title variant="xs">{title}</Title>
        <Text variant="sm" className="mt-1">
          {description}
        </Text>
      </div>
      {children}
    </section>
  );
};

export const CollectionBlock = ({ title, addLabel, onAdd, children }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus size={15} />
          {addLabel}
        </Button>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export const MonthPicker = ({ control }) => {
  return (
    <Controller
      name="best_travel_months"
      control={control}
      render={({ field }) => {
        const selected = normalizeMonths(field.value);

        return (
          <div className="md:col-span-2 lg:col-span-3">
            <label className="mb-2 block text-xs font-medium text-slate-500">
              Best Travel Months
            </label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {MONTH_OPTIONS.map((month) => {
                const checked = selected.includes(month.value);
                return (
                  <button
                    key={month.value}
                    type="button"
                    onClick={() => {
                      const next = checked
                        ? selected.filter((item) => item !== month.value)
                        : [...selected, month.value].sort((a, b) => a - b);
                      field.onChange(next);
                    }}
                    className={`h-10 rounded-lg border text-sm font-medium transition ${
                      checked
                        ? "border-primary bg-primary text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-primary/60"
                    }`}
                  >
                    {month.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }}
    />
  );
};
