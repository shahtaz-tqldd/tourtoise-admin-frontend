import React from "react";
import { Controller } from "react-hook-form";

// components
import { StepShell } from "./_common";
import { FloatingInput } from "@/components/ui/input";
import { FloatingTextarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/ui/select";

// constants
import { DESTINATION_TYPES } from "../constants";
import { COUNTRY_LIST } from "@/lib/countries";

const BasicInfo = ({ control, errors }) => {
  return (
    <StepShell
      title="Basics"
      description="Capture the identity, geography, and short traveler-facing story."
    >
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            <Controller
              name="name"
              control={control}
              rules={{ required: "Destination name is required" }}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Destination Name"
                  error={errors.name?.message}
                  className="col-span-3"
                />
              )}
            />
            <SelectField
              control={control}
              name="destination_type"
              label="Destination Type"
              options={DESTINATION_TYPES}
              error={errors.destination_type?.message}
              rules={{ required: "Destination type is required" }}
              className="col-span-2"
            />
          </div>
          <Controller
            name="tagline"
            control={control}
            render={({ field }) => <FloatingInput {...field} label="Tagline" />}
          />
          <Controller
            name="description"
            control={control}
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <FloatingTextarea
                {...field}
                label="Description"
                rows={8}
                error={errors.description?.message}
                className="md:col-span-2 lg:col-span-3"
              />
            )}
          />
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              control={control}
              name="country"
              label="Country"
              options={COUNTRY_LIST.map((country) => ({
                value: country.name,
                label: country.name,
                icon: country.flag,
              }))}
              error={errors.country?.message}
              rules={{ required: "Country is required" }}
            />
            <Controller
              name="country_code"
              control={control}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Country Code"
                  error={errors.country_code?.message}
                />
              )}
              rules={{ required: "Country code is required" }}
            />
          </div>
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <FloatingInput {...field} label="Region" />
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Currency"
                  error={errors.currency?.message}
                />
              )}
              rules={{ required: "Currency is required" }}
            />
            <Controller
              name="currency_code"
              control={control}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Currency Code"
                  error={errors.currency_code?.message}
                />
              )}
              rules={{ required: "Currency code is required" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="latitude"
              control={control}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  type="number"
                  step="any"
                  label="Latitude"
                />
              )}
            />
            <Controller
              name="longitude"
              control={control}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  type="number"
                  step="any"
                  label="Longitude"
                />
              )}
            />
          </div>
        </div>
      </div>
    </StepShell>
  );
};

export default BasicInfo;
