import { Controller, useFieldArray } from "react-hook-form";
import { Title, Text } from "@/components/ui/typography";
import { MONTH_OPTIONS, TAG_CATEGORIES } from "../constants";
import { normalizeMonths } from "@/lib/date-time";
import { Button, DeleteButton } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Card from "@/components/ui/card";
import { SelectField } from "@/components/ui/select";
import { FloatingInput } from "@/components/ui/input";

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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="rounded-full h-10"
        >
          <Plus size={15} />
          {addLabel}
        </Button>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export const MonthPicker = ({
  control,
  name = "best_travel_months",
  label = "Best Travel Months",
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const selected = normalizeMonths(field.value);

        return (
          <div className="md:col-span-2 lg:col-span-3">
            <label className="mb-2 block text-xs font-medium text-slate-500">
              {label}
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

export const TagsPicker = ({
  control,
  name,
  categoryClassName = "max-w-[180px] w-full",
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">Tags</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-full"
          onClick={() => append({ name: "", category: "" })}
        >
          <Plus size={15} />
          Add Tag
        </Button>
      </div>
      <div className="space-y-3">
        {fields?.map((field, index) => (
          <div
            key={field.id}
            className="flx gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_220px_auto]"
          >
            <Controller
              name={`tags.${index}.name`}
              control={control}
              render={({ field }) => (
                <FloatingInput {...field} label="Tag Name" className="flex-1" />
              )}
            />
            <SelectField
              control={control}
              name={`tags.${index}.category`}
              label="Category"
              options={TAG_CATEGORIES}
              className={categoryClassName}
            />
            <DeleteButton
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};
