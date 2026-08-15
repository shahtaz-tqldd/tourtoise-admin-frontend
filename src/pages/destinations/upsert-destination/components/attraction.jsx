import React from "react";
import { Controller } from "react-hook-form";

// components
import { Button, DeleteButton } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox";
import { CollectionBlock, MonthPicker, StepShell, TagsPicker } from "./_common";
import { FloatingInput } from "@/components/ui/input";
import { FloatingTextarea } from "@/components/ui/textarea";
import GalleryUploader from "@/components/shared/gallery-upload";
import { SelectField } from "@/components/ui/select";

// constants
import {
  ATTRACTION_TYPES,
  BUDGET_TIERS,
  EMPTY_ATTRACTION,
  TIME_OF_DAY_OPTIONS,
} from "../constants";
import Card from "@/components/ui/card";
import { Title } from "@/components/ui/typography";

// icons

function AttractionInfo({ control, fields, append, remove, setValue }) {
  return (
    <StepShell
      title="Attractions"
      description="Add structured places travelers can visit."
    >
      <CollectionBlock
        title="Attractions"
        addLabel="Add Attraction"
        onAdd={() => append({ ...EMPTY_ATTRACTION })}
      >
        {fields.map((item, index) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Attraction {index + 1}
              </p>
              <DeleteButton
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              />
            </div>
            <div className="grid grid-cols-5 gap-4">
              <div className="space-y-5 col-span-3">
                <Card className="space-y-5">
                  <Title variant="xs">Basic Details</Title>
                  <div className="grid grid-cols-5 gap-4">
                    <Controller
                      name={`attractions.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <FloatingInput
                          {...field}
                          label="Name"
                          className="col-span-3"
                        />
                      )}
                    />
                    <SelectField
                      control={control}
                      name={`attractions.${index}.attraction_type`}
                      label="Type"
                      options={ATTRACTION_TYPES}
                      className="col-span-2"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Controller
                      name={`attractions.${index}.description`}
                      control={control}
                      render={({ field }) => (
                        <FloatingTextarea
                          {...field}
                          label="Description"
                          rows={3}
                        />
                      )}
                    />

                    <Controller
                      name={`attractions.${index}.how_to_reach`}
                      control={control}
                      render={({ field }) => (
                        <FloatingTextarea
                          {...field}
                          label="How To Reach"
                          rows={3}
                        />
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Controller
                      name={`attractions.${index}.picking_reasons`}
                      control={control}
                      render={({ field }) => (
                        <FloatingTextarea
                          {...field}
                          label="Picking Reasons"
                          rows={3}
                          placeholder="One reason per line"
                        />
                      )}
                    />
                    <Controller
                      name={`attractions.${index}.notes`}
                      control={control}
                      render={({ field }) => (
                        <FloatingTextarea
                          {...field}
                          label="Notes"
                          rows={3}
                          placeholder="One note per line"
                        />
                      )}
                    />
                  </div>
                </Card>

                <Card>
                  <Title variant="xs">Planning</Title>
                  <div className="grid grid-cols-2 gap-4 mt-5">
                    <SelectField
                      control={control}
                      name={`attractions.${index}.budget_tier`}
                      label="Budget"
                      options={BUDGET_TIERS}
                    />
                    <SelectField
                      control={control}
                      name={`attractions.${index}.best_time_of_day`}
                      label="Best Time"
                      options={TIME_OF_DAY_OPTIONS}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-5">
                    <Controller
                      name={`attractions.${index}.avg_duration_hours`}
                      control={control}
                      render={({ field }) => (
                        <FloatingInput
                          {...field}
                          type="number"
                          step="0.5"
                          min="0"
                          label="Duration Hours"
                        />
                      )}
                    />
                    <Controller
                      name={`attractions.${index}.sort_order`}
                      control={control}
                      render={({ field }) => (
                        <FloatingInput
                          {...field}
                          type="number"
                          min="0"
                          label="Sort Order"
                        />
                      )}
                    />
                    <Controller
                      name={`attractions.${index}.approx_entrance_fee`}
                      control={control}
                      render={({ field }) => (
                        <FloatingInput {...field} label="Entrance Fee" />
                      )}
                    />
                  </div>
                  <div className="mt-5">
                    <MonthPicker
                      control={control}
                      name={`attractions.${index}.best_months`}
                      label="Best Months"
                    />
                  </div>
                </Card>

                <TagsPicker
                  name={`attractions.${index}.tags`}
                  control={control}
                  categoryClassName="max-w-[140px] w-full"
                />
              </div>
              <div className="space-y-5 col-span-2">
                <Card className="flex gap-6">
                  <CheckboxField
                    control={control}
                    name={`attractions.${index}.entrance_fee_required`}
                    label="Fee required"
                  />
                  <CheckboxField
                    control={control}
                    name={`attractions.${index}.is_featured`}
                    label="Featured"
                  />
                </Card>
                <Card>
                  <Title variant="sm">Address</Title>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <Controller
                      name={`attractions.${index}.address`}
                      control={control}
                      render={({ field }) => (
                        <FloatingInput
                          {...field}
                          label="Location"
                          className="lg:col-span-2"
                        />
                      )}
                    />
                    <Controller
                      name={`attractions.${index}.latitude`}
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
                      name={`attractions.${index}.longitude`}
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
                </Card>
                <GalleryUploader
                  control={control}
                  setValue={setValue}
                  coverImageName={`attractions.${index}.cover_image`}
                  coverImageFileName={`attractions.${index}.cover_image_file`}
                  galleryImagesName={`attractions.${index}.gallery_images`}
                  existingGalleryImagesName={`attractions.${index}.existing_gallery_images`}
                  removedGalleryImageIdsName={`attractions.${index}.removed_gallery_image_ids`}
                />
              </div>
            </div>
          </div>
        ))}
      </CollectionBlock>
    </StepShell>
  );
}

export default AttractionInfo;
