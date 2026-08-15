import React from "react";
import { Controller } from "react-hook-form";

// components
import { Button, DeleteButton } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { StepShell } from "./_common";
import GalleryUploader from "@/components/shared/gallery-upload";

// constants
import { TAG_CATEGORIES } from "../constants";

// icons
import { Plus, Trash2 } from "lucide-react";

const MediaTags = ({ control, fields, append, remove, setValue }) => {
  return (
    <StepShell
      title="Media & Tags"
      description="Add a cover image, preview selected uploads, and label the destination."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_520px]">
        <div className="space-y-5">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">Tags</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => append({ name: "", category: "" })}
              >
                <Plus size={15} />
                Add Tag
              </Button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flx gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_220px_auto]"
                >
                  <Controller
                    name={`tags.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <FloatingInput
                        {...field}
                        label="Tag Name"
                        className="flex-1"
                      />
                    )}
                  />
                  <SelectField
                    control={control}
                    name={`tags.${index}.category`}
                    label="Category"
                    options={TAG_CATEGORIES}
                    className="max-w-[180px] w-full"
                  />
                  <DeleteButton
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <GalleryUploader control={control} setValue={setValue} />
      </div>
    </StepShell>
  );
};

export default MediaTags;
