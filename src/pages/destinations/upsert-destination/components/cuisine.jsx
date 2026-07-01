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
  CUISINE_TYPES,
  EMPTY_CUISINE,
  MEAL_TYPES,
  SPICE_LEVELS,
} from "../constants";

// icons
import { Trash2 } from "lucide-react";

const CuisineInfo = ({ control, fields, append, remove, setValue }) => {
  return (
    <StepShell
      title="Cuisine"
      description="Add foods and local dishes connected to this destination."
    >
      <CollectionBlock
        title="Cuisines"
        addLabel="Add Cuisine"
        onAdd={() => append({ ...EMPTY_CUISINE })}
      >
        {fields.map((item, index) => (
          <div
            key={item.id}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Cuisine {index + 1}
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
                    name={`cuisines.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <FloatingInput
                        {...field}
                        label="Name"
                        className="col-span-3"
                      />
                    )}
                  />
                  <Controller
                    name={`cuisines.${index}.approx_cost`}
                    control={control}
                    render={({ field }) => (
                      <FloatingInput
                        {...field}
                        label="Approx Cost"
                        className="col-span-2"
                      />
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <SelectField
                    control={control}
                    name={`cuisines.${index}.cuisine_type`}
                    label="Cuisine Type"
                    options={CUISINE_TYPES}
                  />
                  <SelectField
                    control={control}
                    name={`cuisines.${index}.meal_type`}
                    label="Meal Type"
                    options={MEAL_TYPES}
                  />
                  <SelectField
                    control={control}
                    name={`cuisines.${index}.spice_level`}
                    label="Spice Level"
                    options={SPICE_LEVELS}
                  />
                </div>

                <Controller
                  name={`cuisines.${index}.description`}
                  control={control}
                  render={({ field }) => (
                    <FloatingTextarea
                      {...field}
                      label="Description"
                      rows={3}
                      className="lg:col-span-2"
                    />
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <Controller
                    name={`cuisines.${index}.picking_reasons`}
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
                    name={`cuisines.${index}.notes`}
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
                <div className="flex gap-6 border !bg-white p-4 rounded-lg">
                  <CheckboxField
                    control={control}
                    name={`cuisines.${index}.is_vegetarian_friendly`}
                    label="Vegetarian friendly"
                  />
                  <CheckboxField
                    control={control}
                    name={`cuisines.${index}.is_featured`}
                    label="Featured"
                  />
                </div>
                <GalleryUploader
                  control={control}
                  setValue={setValue}
                  coverImageName={`cuisines.${index}.cover_image`}
                  coverImageFileName={`cuisines.${index}.cover_image_file`}
                  galleryImagesName={`cuisines.${index}.gallery_images`}
                  existingGalleryImagesName={`cuisines.${index}.existing_gallery_images`}
                  removedGalleryImageIdsName={`cuisines.${index}.removed_gallery_image_ids`}
                />
              </div>
            </div>
          </div>
        ))}
      </CollectionBlock>
    </StepShell>
  );
};

export default CuisineInfo;
