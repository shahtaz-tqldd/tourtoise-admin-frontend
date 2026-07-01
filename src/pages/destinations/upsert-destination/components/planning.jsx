import React from "react";
import { Controller } from "react-hook-form";

// components
import { MonthPicker, StepShell } from "./_common";
import { FloatingInput } from "@/components/ui/input";
import { FloatingTextarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/ui/select";

// constants
import { BUDGET_TIERS, DIFFICULTIES, STATUSES } from "../constants";

const PlanningInfo = ({ control, errors }) => {
  return (
    <StepShell
      title="Planning"
      description="Keep compact numeric fields small and give narrative notes more room."
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <Controller
              name="min_stay_days"
              control={control}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  type="number"
                  min="0"
                  label="Min Stay Days"
                />
              )}
            />
            <Controller
              name="max_stay_days"
              control={control}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  type="number"
                  min="0"
                  label="Max Stay Days"
                />
              )}
            />
            <SelectField
              control={control}
              name="difficulty_level"
              label="Difficulty"
              options={DIFFICULTIES}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              control={control}
              name="budget_tier"
              label="Budget Tier"
              options={BUDGET_TIERS}
            />

            <SelectField
              control={control}
              name="status"
              label="Status"
              options={STATUSES}
            />
          </div>
          <Controller
            name="local_languages"
            control={control}
            render={({ field }) => (
              <FloatingTextarea
                {...field}
                label="Local Languages"
                rows={3}
                placeholder="Nepali, English"
              />
            )}
          />
          <MonthPicker control={control} />
        </div>
        <div className="space-y-5">
          <Controller
            name="getting_around"
            control={control}
            render={({ field }) => (
              <FloatingTextarea
                {...field}
                label="Getting Around"
                rows={4}
                className="md:col-span-2 lg:col-span-3"
              />
            )}
          />
          <Controller
            name="visa_notes"
            control={control}
            render={({ field }) => (
              <FloatingTextarea {...field} label="Visa Notes" rows={3} />
            )}
          />
          <Controller
            name="notes"
            control={control}
            error={errors.notes?.message}
            render={({ field }) => (
              <FloatingTextarea
                {...field}
                label="Notes"
                rows={4}
                placeholder="One note per line"
                className="md:col-span-2"
              />
            )}
          />
        </div>
      </div>
    </StepShell>
  );
};

export default PlanningInfo;
