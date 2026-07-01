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
  ACTIVITY_TYPES,
  BUDGET_TIERS,
  DIFFICULTIES,
  EMPTY_ACTIVITY,
} from "../constants";

// icons
import { Trash2 } from "lucide-react";

const ActivityInfo = ({ control, fields, append, remove, setValue }) => {
  return (
    <StepShell
      title="Activities"
      description="Add guided, seasonal, or self-directed things to do."
    >
      <CollectionBlock
        title="Activities"
        addLabel="Add Activity"
        onAdd={() => append({ ...EMPTY_ACTIVITY })}
      >
        {fields.map((item, index) => (
          <div
            key={item.id}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Activity {index + 1}
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
              <div className="col-span-3 space-y-5">
                <div className="grid grid-cols-5 gap-4">
                  <Controller
                    name={`activities.${index}.name`}
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
                    name={`activities.${index}.activity_type`}
                    label="Type"
                    options={ACTIVITY_TYPES}
                    className="col-span-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    control={control}
                    name={`activities.${index}.difficulty_level`}
                    label="Difficulty"
                    options={DIFFICULTIES}
                  />
                  <SelectField
                    control={control}
                    name={`activities.${index}.budget_tier`}
                    label="Budget"
                    options={BUDGET_TIERS}
                  />
                </div>
                <Controller
                  name={`activities.${index}.best_season`}
                  control={control}
                  render={({ field }) => (
                    <FloatingInput {...field} label="Best Season" />
                  )}
                />
                <div className="flex gap-6">
                  <CheckboxField
                    control={control}
                    name={`activities.${index}.booking_required`}
                    label="Booking required"
                  />
                  <CheckboxField
                    control={control}
                    name={`activities.${index}.is_featured`}
                    label="Featured"
                  />
                </div>
                <Controller
                  name={`activities.${index}.description`}
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
                    name={`activities.${index}.approx_cost`}
                    control={control}
                    render={({ field }) => (
                      <FloatingInput {...field} label="Approx Cost" />
                    )}
                  />
                  <Controller
                    name={`activities.${index}.duration_hours`}
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
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Controller
                    name={`activities.${index}.picking_reasons`}
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
                    name={`activities.${index}.notes`}
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
              <div className="col-span-2 space-y-5">
                <GalleryUploader
                  control={control}
                  setValue={setValue}
                  coverImageName={`activities.${index}.cover_image`}
                  coverImageFileName={`activities.${index}.cover_image_file`}
                  galleryImagesName={`activities.${index}.gallery_images`}
                  existingGalleryImagesName={`activities.${index}.existing_gallery_images`}
                  removedGalleryImageIdsName={`activities.${index}.removed_gallery_image_ids`}
                />
              </div>
            </div>
          </div>
        ))}
      </CollectionBlock>
    </StepShell>
  );
};

export default ActivityInfo;
