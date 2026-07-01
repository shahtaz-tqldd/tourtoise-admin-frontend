import React from "react";
import { Controller } from "react-hook-form";

// components
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox";
import { CollectionBlock, StepShell } from "./_common";
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

// icons
import { Trash2 } from "lucide-react";

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
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Attraction {index + 1}
              </p>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 size={15} />
              </Button>
            </div>
            <div className="grid grid-cols-5 gap-4">
              <div className="space-y-5 col-span-3">
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
                <div className="grid grid-cols-2 gap-4">
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
                <div className="flex gap-6">
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
                </div>
                <Controller
                  name={`attractions.${index}.description`}
                  control={control}
                  render={({ field }) => (
                    <FloatingTextarea
                      {...field}
                      label="Description"
                      rows={3}
                      className="lg:col-span-4"
                    />
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
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
                  {/* <Controller
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
                  /> */}
                  <Controller
                    name={`attractions.${index}.approx_entrance_fee`}
                    control={control}
                    render={({ field }) => (
                      <FloatingInput {...field} label="Entrance Fee" />
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
              </div>
              <div className="space-y-5 col-span-2">
                <GalleryUploader
                  control={control}
                  setValue={setValue}
                  coverImageName={`attractions.${index}.cover_image`}
                  coverImageFileName={`attractions.${index}.cover_image_file`}
                  galleryImagesName={`attractions.${index}.gallery_images`}
                  existingGalleryImagesName={`attractions.${index}.existing_gallery_images`}
                  removedGalleryImageIdsName={`attractions.${index}.removed_gallery_image_ids`}
                />

                <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>
          </div>
        ))}
      </CollectionBlock>
    </StepShell>
  );
}

export default AttractionInfo;
