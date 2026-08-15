import React, { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingInput } from "@/components/ui/input";
import {
  FloatingSelect,
  SelectField as ControlledSelectField,
  SelectItem,
} from "@/components/ui/select";
import { FloatingTextarea } from "@/components/ui/textarea";
import { Text, Title } from "@/components/ui/typography";
import GalleryUploader from "@/components/shared/gallery-upload";
import { TAG_CATEGORIES } from "../upsert-destination/constants";
import Card from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MonthPicker } from "../upsert-destination/components/_common";
import { normalizeMonths } from "@/lib/date-time";

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value?.map((item) => String(item || "")?.trim())?.filter(Boolean);
  }

  return String(value || "")
    ?.split(/\r?\n/)
    ?.map((item) => item.trim())
    ?.filter(Boolean);
};

const toTextareaValue = (value) =>
  Array.isArray(value) ? value.join("\n") : String(value || "");

const normalizeImages = (images) =>
  (Array.isArray(images) ? images : [])
    ?.map((image) => ({
      id: image?.id,
      url: image?.image_url || image?.url || "",
      caption: image?.caption || "",
      sort_order: image?.sort_order || "",
    }))
    ?.filter((image) => image.url);

const appendScalar = (formData, key, value, includeEmpty = false) => {
  if (
    !includeEmpty &&
    (value === "" || value === null || value === undefined)
  ) {
    return;
  }
  formData.append(key, value ?? "");
};

const hasFormDataEntries = (formData) => !formData.entries().next().done;

function mapResourceToForm(resource, config) {
  const tags = (resource?.tags || [])
    ?.map((tag) => ({
      name: typeof tag === "string" ? tag : tag?.name || "",
      category: typeof tag === "string" ? "" : tag?.category || "",
    }))
    ?.filter((tag) => tag.name || tag.category);

  return {
    ...config.defaultValues,
    ...config.scalarFields.reduce((values, field) => {
      values[field] = resource?.[field] ?? config.defaultValues[field] ?? "";
      return values;
    }, {}),
    picking_reasons: toTextareaValue(resource?.picking_reasons),
    notes: toTextareaValue(resource?.notes),
    tags: tags.length ? tags : [{ name: "", category: "" }],
    cover_image_file: null,
    gallery_images: null,
    existing_gallery_images: normalizeImages(resource?.images),
    removed_images: [],
  };
}

function buildPayload(data, dirtyFields, config, isUpdateMode) {
  const formData = new FormData();

  config.scalarFields.forEach((field) => {
    if (!isUpdateMode || dirtyFields[field]) {
      const isMonthField = config.bestSeasons?.some(
        (monthField) => monthField.name === field,
      );
      const value = isMonthField
        ? JSON.stringify(normalizeMonths(data[field]))
        : data[field];
      appendScalar(formData, field, value, isUpdateMode);
    }
  });

  ["picking_reasons", "notes"].forEach((field) => {
    if (!isUpdateMode || dirtyFields[field]) {
      formData.append(field, JSON.stringify(normalizeList(data[field])));
    }
  });

  if (config.supportsTags && (!isUpdateMode || dirtyFields.tags)) {
    const tags = (data.tags || [])
      ?.map((tag) => ({
        name: String(tag?.name || "").trim(),
        category: String(tag?.category || "").trim(),
      }))
      ?.filter((tag) => tag.name && tag.category);
    formData.append("tags", JSON.stringify(tags));
  }

  const coverImageFile = data.cover_image_file?.[0];
  if (coverImageFile && (!isUpdateMode || dirtyFields.cover_image_file)) {
    formData.delete("cover_image");
    formData.append("cover_image_file", coverImageFile);
  }

  if (!isUpdateMode || dirtyFields.gallery_images) {
    Array.from(data.gallery_images || []).forEach((file) => {
      formData.append("images", file);
    });
  }

  if (data.removed_images?.length) {
    formData.append("removed_images", JSON.stringify(data.removed_images));
  }

  return formData;
}

function SelectField({ control, field }) {
  return (
    <ControlledSelectField
      name={field.name}
      control={control}
      rules={
        field.required ? { required: `${field.label} is required` } : undefined
      }
      label={field.label}
      options={field.options || []}
      className={field.className}
    />
  );
}

function FormField({ control, field, className }) {
  if (field.type === "select") {
    return <SelectField control={control} field={field} />;
  }

  return (
    <Controller
      name={field.name}
      control={control}
      rules={
        field.required ? { required: `${field.label} is required` } : undefined
      }
      render={({ field: input, fieldState }) => {
        const Component =
          field.type === "textarea" ? FloatingTextarea : FloatingInput;
        return (
          <Component
            {...input}
            type={field.type === "number" ? "number" : undefined}
            step={field.step}
            min={field.min}
            rows={field.rows}
            label={field.label}
            error={fieldState.error?.message}
            className={cn(field.className, className)}
          />
        );
      }}
    />
  );
}

function CheckboxField({ control, field }) {
  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: input }) => (
        <label className="flex cursor-pointer select-none items-center gap-3 text-sm text-slate-700">
          <Checkbox
            checked={Boolean(input.value)}
            onCheckedChange={input.onChange}
          />
          {field.label}
        </label>
      )}
    />
  );
}

function TagFields({ fields, control, append, remove }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">Tags</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full h-10 !pr-3.5"
          onClick={() => append({ name: "", category: "" })}
        >
          <Plus size={15} />
          Add Tag
        </Button>
      </div>
      <div className="space-y-3">
        {fields?.map((item, index) => (
          <div
            key={item.id}
            className="flex gap-3 rounded-xl items-center border border-slate-200 bg-slate-50 p-3"
          >
            <Controller
              name={`tags.${index}.name`}
              control={control}
              render={({ field }) => (
                <FloatingInput {...field} label="Tag Name" />
              )}
            />
            <Controller
              name={`tags.${index}.category`}
              control={control}
              render={({ field }) => (
                <FloatingSelect
                  label="Category"
                  value={field.value || ""}
                  displayValue={field.value || ""}
                  onValueChange={field.onChange}
                  className="max-w-[160px]"
                >
                  {TAG_CATEGORIES?.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="capitalize"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </FloatingSelect>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 rounded-full bg-red-600 text-white"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

const ChildUpsertForm = ({
  config,
  destinationId,
  resourceId,
  detailData,
  isDetailFetching,
  createResource,
  updateResource,
  isCreateLoading,
  isUpdateLoading,
}) => {
  const navigate = useNavigate();
  const isUpdateMode = Boolean(resourceId);
  const resource = detailData?.data || detailData;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { dirtyFields },
  } = useForm({ defaultValues: config.defaultValues });

  const tags = useFieldArray({ control, name: "tags" });

  useEffect(() => {
    if (isUpdateMode && resource) {
      reset(mapResourceToForm(resource, config));
    }
  }, [config, isUpdateMode, reset, resource]);

  const isSaving = isCreateLoading || isUpdateLoading;

  const onSubmit = async (data) => {
    try {
      const formData = buildPayload(data, dirtyFields, config, isUpdateMode);

      if (isUpdateMode) {
        if (!hasFormDataEntries(formData)) {
          toast.info("No changes to update");
          return;
        }
        await updateResource(formData).unwrap();
        toast.success(`${config.label} updated successfully`);
      } else {
        await createResource(formData).unwrap();
        toast.success(`${config.label} created successfully`);
      }

      navigate(config.listPath(destinationId));
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error?.[0] ||
        error?.data?.detail ||
        `${config.label} could not be saved`;
      toast.error(message);
    }
  };

  if (isUpdateMode && isDetailFetching) {
    return (
      <div className="center min-h-[420px] text-primary">
        <Loader2 className="mr-2 animate-spin" size={22} />
        Loading {config.label.toLowerCase()}...
      </div>
    );
  }

  return (
    <section className="min-w-0 space-y-6">
      <div className="flbx gap-4">
        <div className="flx gap-2">
          <Link
            to={config.listPath(destinationId)}
            className="center h-10 w-10 rounded-full bg-primary/5 text-slate-900 transition hover:bg-primary/10"
          >
            <ChevronLeft size={16} />
          </Link>
          <Title variant="lg">
            {isUpdateMode ? "Update" : "Create"} {config.label}
          </Title>
        </div>

        <Button
          type="submit"
          form={`${config.key}-form`}
          disabled={isSaving}
          className="rounded-full"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          {isUpdateMode ? "Update" : "Create"}
        </Button>
      </div>

      <form
        id={`${config.key}-form`}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid md:grid-cols-5 gap-5">
          <div className="md:col-span-3 space-y-5">
            <Card>
              <div className="mb-6">
                <Title variant="xs">Basic Information</Title>
                <Text variant="sm" className="mt-1">
                  Core {config.label.toLowerCase()} details.
                </Text>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {config.basicFields?.map((field) => (
                  <FormField key={field.name} control={control} field={field} />
                ))}
              </div>
            </Card>
            <GalleryUploader
              control={control}
              setValue={setValue}
              coverImageName="cover_image"
              coverImageFileName="cover_image_file"
              galleryImagesName="gallery_images"
              existingGalleryImagesName="existing_gallery_images"
              removedGalleryImageIdsName="removed_images"
              removedGalleryImageValueKey="url"
            />
          </div>
          <div className="md:col-span-2 space-y-5">
            <Card>
              <div className="mb-6">
                <Title variant="xs">Planning Settings</Title>
                <Text variant="sm" className="mt-1">
                  Cost, timing, and traveler-facing attributes.
                </Text>
              </div>
              <div className="grid gap-4 grid-cols-3">
                {config.settingFields?.map((field) => (
                  <FormField key={field.name} control={control} field={field} />
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-5">
                {config.checkboxFields?.map((field) => (
                  <CheckboxField
                    key={field.name}
                    control={control}
                    field={field}
                  />
                ))}
              </div>
            </Card>
            {config.bestSeasons?.length ? (
              <Card>
                {config.bestSeasons.map((field) => (
                  <MonthPicker
                    key={field.name}
                    control={control}
                    name={field.name}
                    label={field.label}
                  />
                ))}
              </Card>
            ) : null}
            {config.addressField?.length ? (
              <Card>
                <div className="mb-6">
                  <Title variant="xs">Address</Title>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {config.addressField.map((field) => (
                    <FormField
                      key={field.name}
                      control={control}
                      field={field}
                    />
                  ))}
                </div>
              </Card>
            ) : null}
            <Card>
              <div className="mb-6">
                <Title variant="xs">Reasoning</Title>
                <Text variant="sm" className="mt-1">
                  Reasons to choose place
                </Text>
              </div>
              <div className="space-y-5">
                <Controller
                  name="picking_reasons"
                  control={control}
                  render={({ field }) => (
                    <FloatingTextarea
                      {...field}
                      label="Picking Reasons"
                      rows={5}
                      placeholder="One reason per line"
                    />
                  )}
                />
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <FloatingTextarea
                      {...field}
                      label="Notes"
                      rows={5}
                      placeholder="One note per line"
                    />
                  )}
                />
              </div>
            </Card>
            {config.supportsTags ? (
              <Card>
                <TagFields
                  fields={tags.fields}
                  control={control}
                  append={tags.append}
                  remove={tags.remove}
                />
              </Card>
            ) : null}
          </div>
        </div>
      </form>
    </section>
  );
};

export default ChildUpsertForm;
