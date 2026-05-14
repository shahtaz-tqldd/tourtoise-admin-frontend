import React, { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingInput } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FloatingTextarea } from "@/components/ui/textarea";
import { Text, Title } from "@/components/ui/typography";
import {
  useCreateDestinationMutation,
  useDestinationDetailQuery,
  useUpdateDestinationMutation,
} from "@/features/destination/destinationApiSlice";
import { COUNTRY_LIST } from "@/lib/countries";

const destinationTypes = [
  "city",
  "beach",
  "mountain",
  "island",
  "country",
  "region",
  "park",
];
const budgetTiers = ["budget", "mid", "mid_range", "luxury"];
const difficulties = ["easy", "moderate", "challenging"];
const statuses = ["draft", "published", "archived"];
const dataSources = ["manual", "admin", "partner", "import"];
const tagCategories = [
  "experience",
  "season",
  "style",
  "audience",
  "food",
  "nature",
];
const attractionTypes = [
  "temple",
  "museum",
  "landmark",
  "market",
  "park",
  "viewpoint",
  "historic_site",
];
const activityTypes = [
  "cultural",
  "adventure",
  "food",
  "nature",
  "shopping",
  "wellness",
];
const cuisineTypes = [
  "Street food",
  "Local dish",
  "Dessert",
  "Drink",
  "Fine dining",
];
const spiceLevels = ["mild", "medium", "hot"];
const mealTypes = ["breakfast", "lunch", "dinner", "snack", "dessert"];
const timeOfDayOptions = [
  "morning",
  "afternoon",
  "evening",
  "night",
  "anytime",
];
const costUnits = ["per person", "per group", "per day", "fixed"];

const monthOptions = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

const emptyAttraction = {
  name: "",
  attraction_type: "",
  description: "",
  latitude: "",
  longitude: "",
  address: "",
  cover_image: "",
  budget_tier: "",
  avg_duration_hours: "",
  best_time_of_day: "",
  entrance_fee_required: false,
  approx_entrance_fee: "",
  sort_order: "",
  is_featured: false,
};

const emptyActivity = {
  name: "",
  activity_type: "",
  description: "",
  difficulty_level: "",
  budget_tier: "",
  approx_cost: "",
  cost_unit: "",
  duration_hours: "",
  best_season: "",
  cover_image: "",
  booking_required: false,
  is_featured: false,
};

const emptyCuisine = {
  name: "",
  cuisine_type: "",
  description: "",
  ingredients_note: "",
  spice_level: "",
  meal_type: "",
  cover_image: "",
  is_vegetarian_friendly: false,
  is_must_try: false,
  approx_price_range: "",
};

const defaultValues = {
  name: "",
  country: "",
  country_code: "",
  region: "",
  destination_type: "",
  latitude: "",
  longitude: "",
  tagline: "",
  overview: "",
  cover_image: "",
  cover_image_file: null,
  gallery_images: null,
  tags: [{ name: "", category: "" }],
  min_stay_days: "",
  max_stay_days: "",
  budget_tier: "",
  difficulty: "",
  local_languages: "",
  best_travel_months: [],
  currency: "",
  currency_code: "",
  getting_around: "",
  visa_notes: "",
  cultural_tips: "",
  status: "draft",
  data_source: "manual",
  attractions: [{ ...emptyAttraction }],
  activities: [{ ...emptyActivity }],
  cuisines: [{ ...emptyCuisine }],
};

const scalarFields = [
  "name",
  "country",
  "country_code",
  "region",
  "destination_type",
  "latitude",
  "longitude",
  "tagline",
  "overview",
  "cover_image",
  "min_stay_days",
  "max_stay_days",
  "budget_tier",
  "difficulty",
  "currency",
  "currency_code",
  "getting_around",
  "visa_notes",
  "status",
  "data_source",
];

const steps = [
  { id: "basics", title: "Basics" },
  { id: "planning", title: "Planning" },
  { id: "media", title: "Media & Tags" },
  { id: "attractions", title: "Attractions" },
  { id: "activities", title: "Activities" },
  { id: "cuisines", title: "Cuisine" },
];

function splitList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];

  return String(value)
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return "";
  const number = Number(value);
  return Number.isNaN(number) ? "" : number;
}

function pruneEmptyObjects(items, requiredKey = "name") {
  return (items || [])
    .map((item) =>
      Object.entries(item || {}).reduce((acc, [key, value]) => {
        if (typeof value === "boolean") {
          acc[key] = value;
        } else if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          acc[key] = [
            "latitude",
            "longitude",
            "avg_duration_hours",
            "duration_hours",
            "sort_order",
          ].includes(key)
            ? toNumber(value)
            : value;
        }
        return acc;
      }, {}),
    )
    .filter((item) => item[requiredKey]);
}

function normalizeCollection(items, fallback) {
  if (!Array.isArray(items) || items.length === 0) return [{ ...fallback }];
  const normalized = items.map((item) => ({ ...fallback, ...item }));
  return normalized.length ? normalized : [{ ...fallback }];
}

function normalizeTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return defaultValues.tags;

  const normalizedTags = tags
    .map((tag) => {
      if (typeof tag === "string") return { name: tag, category: "" };
      return {
        name: tag?.name || "",
        category: tag?.category || "",
      };
    })
    .filter((tag) => tag.name || tag.category);

  return normalizedTags.length ? normalizedTags : defaultValues.tags;
}

function normalizeMonths(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item >= 1 && item <= 12);
}

function joinList(value) {
  return Array.isArray(value) ? value.join("\n") : value || "";
}

function mapDestinationToForm(destination) {
  return {
    ...defaultValues,
    ...scalarFields.reduce((acc, field) => {
      acc[field] = destination?.[field] ?? "";
      return acc;
    }, {}),
    local_languages: joinList(destination?.local_languages),
    best_travel_months: normalizeMonths(destination?.best_travel_months),
    cultural_tips: joinList(destination?.cultural_tips),
    tags: normalizeTags(destination?.tags),
    attractions: normalizeCollection(destination?.attractions, emptyAttraction),
    activities: normalizeCollection(destination?.activities, emptyActivity),
    cuisines: normalizeCollection(destination?.cuisines, emptyCuisine),
  };
}

function getDestinationPayload(data) {
  const formData = new FormData();

  scalarFields.forEach((field) => {
    const value = data[field];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      formData.append(field, value);
    }
  });

  const tags = pruneEmptyObjects(data.tags);

  formData.append("tags", JSON.stringify(tags));
  formData.append(
    "local_languages",
    JSON.stringify(splitList(data.local_languages)),
  );
  formData.append(
    "best_travel_months",
    JSON.stringify(normalizeMonths(data.best_travel_months)),
  );
  formData.append(
    "cultural_tips",
    JSON.stringify(splitList(data.cultural_tips)),
  );
  formData.append(
    "attractions",
    JSON.stringify(pruneEmptyObjects(data.attractions)),
  );
  formData.append(
    "activities",
    JSON.stringify(pruneEmptyObjects(data.activities)),
  );
  formData.append("cuisines", JSON.stringify(pruneEmptyObjects(data.cuisines)));

  const coverImageFile = data.cover_image_file?.[0];
  if (coverImageFile) {
    formData.delete("cover_image");
    formData.append("cover_image_file", coverImageFile);
  }

  Array.from(data.gallery_images || []).forEach((file) => {
    formData.append("gallery_images", file);
  });

  return formData;
}

function SelectField({
  control,
  name,
  label,
  options,
  error,
  rules,
  className,
  onValueChange,
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <div className={className}>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            {label}
          </label>
          <Select
            value={
              field.value === "" ||
              field.value === null ||
              field.value === undefined
                ? undefined
                : String(field.value)
            }
            onValueChange={(value) => {
              field.onChange(value);
              onValueChange?.(value);
            }}
          >
            <SelectTrigger className="h-[54px] w-full rounded-xl border-slate-300 bg-white px-4">
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => {
                const value =
                  typeof option === "string" ? option : option.value;
                const optionLabel =
                  typeof option === "string"
                    ? option.replaceAll("_", " ")
                    : option.label;

                return (
                  <SelectItem key={value} value={String(value)}>
                    <span className="capitalize">{optionLabel}</span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
      )}
    />
  );
}

function CheckboxField({ control, name, label }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <label className="flex h-[54px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700">
          <Checkbox
            checked={Boolean(field.value)}
            onCheckedChange={field.onChange}
          />
          {label}
        </label>
      )}
    />
  );
}

function StepShell({ title, description, children }) {
  return (
    <section className="rounded-4xl bg-white p-8 border">
      <div className="mb-5">
        <Title variant="xs">{title}</Title>
        <Text variant="sm" className="mt-1">
          {description}
        </Text>
      </div>
      {children}
    </section>
  );
}

function FormGrid({ children, columns = "lg:grid-cols-3" }) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 ${columns}`}>{children}</div>
  );
}

function FileDropField({ label, helper, register, multiple = false }) {
  return (
    <label className="flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-primary hover:bg-primary/5">
      <ImagePlus size={24} className="mb-2 text-primary" />
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="mt-1 max-w-[260px] text-xs text-slate-500">
        {helper}
      </span>
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        className="sr-only"
        {...register}
      />
    </label>
  );
}

function useFilePreviews(files) {
  const fileList = useMemo(() => Array.from(files || []), [files]);
  const previews = useMemo(
    () =>
      fileList.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [fileList],
  );

  useEffect(
    () => () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    },
    [previews],
  );

  return previews;
}

function ImagePreviewPanel({ coverUrl, coverFiles, galleryFiles }) {
  const coverPreviews = useFilePreviews(coverFiles);
  const galleryPreviews = useFilePreviews(galleryFiles);
  const activeCover = coverPreviews[0]?.url || coverUrl;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Image Preview</p>
          <p className="text-xs text-slate-500">
            Cover and selected gallery images appear here before saving.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
          {galleryPreviews.length} gallery
        </span>
      </div>

      <div className="aspect-[16/9] overflow-hidden rounded-lg border border-slate-200 bg-white">
        {activeCover ? (
          <img
            src={activeCover}
            alt="Cover preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <ImagePlus size={30} />
            <span className="mt-2 text-sm">No cover selected</span>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {galleryPreviews.slice(0, 8).map((preview) => (
          <div
            key={preview.url}
            className="aspect-square overflow-hidden rounded-md border border-slate-200 bg-white"
          >
            <img
              src={preview.url}
              alt={preview.name}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
        {galleryPreviews.length === 0 && (
          <div className="col-span-4 rounded-md border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-500">
            Gallery thumbnails will show after selecting files.
          </div>
        )}
      </div>
    </div>
  );
}

function MonthPicker({ control }) {
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
              {monthOptions.map((month) => {
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
}

function TagsStep({
  control,
  fields,
  append,
  remove,
  coverImageRegister,
  galleryImagesRegister,
}) {
  return (
    <StepShell
      title="Media & Tags"
      description="Add a cover image, preview selected uploads, and label the destination."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <FormGrid columns="lg:grid-cols-2">
            <FileDropField
              label="Upload Cover Image"
              helper="Replaces the cover URL on submit and uploads as cover_image_file."
              register={coverImageRegister}
            />
            <FileDropField
              label="Upload Gallery Images"
              helper="Select multiple images to preview and submit as gallery_images."
              multiple
              register={galleryImagesRegister}
            />
            <Controller
              name="cover_image"
              control={control}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Cover Image URL"
                  className="md:col-span-2"
                />
              )}
            />
            <SelectField
              control={control}
              name="data_source"
              label="Data Source"
              options={dataSources}
            />
          </FormGrid>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">Tags</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
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
                  className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_220px_auto]"
                >
                  <Controller
                    name={`tags.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <FloatingInput {...field} label="Tag Name" />
                    )}
                  />
                  <SelectField
                    control={control}
                    name={`tags.${index}.category`}
                    label="Category"
                    options={tagCategories}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-[54px] w-[54px] self-start"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <WatchedImagePreview control={control} />
      </div>
    </StepShell>
  );
}

function WatchedImagePreview({ control }) {
  const coverUrl = useWatch({ control, name: "cover_image" });
  const coverFiles = useWatch({ control, name: "cover_image_file" });
  const galleryFiles = useWatch({ control, name: "gallery_images" });

  return (
    <ImagePreviewPanel
      coverUrl={coverUrl}
      coverFiles={coverFiles}
      galleryFiles={galleryFiles}
    />
  );
}

function AttractionFields({ control, fields, append, remove }) {
  return (
    <CollectionBlock
      title="Attractions"
      addLabel="Add Attraction"
      onAdd={() => append({ ...emptyAttraction })}
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
          <FormGrid columns="lg:grid-cols-4">
            <Controller
              name={`attractions.${index}.name`}
              control={control}
              render={({ field }) => <FloatingInput {...field} label="Name" />}
            />
            <SelectField
              control={control}
              name={`attractions.${index}.attraction_type`}
              label="Type"
              options={attractionTypes}
            />
            <SelectField
              control={control}
              name={`attractions.${index}.budget_tier`}
              label="Budget"
              options={budgetTiers}
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
            <Controller
              name={`attractions.${index}.avg_duration_hours`}
              control={control}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  type="number"
                  step="0.5"
                  min="0"
                  label="Avg Hours"
                />
              )}
            />
            <SelectField
              control={control}
              name={`attractions.${index}.best_time_of_day`}
              label="Best Time"
              options={timeOfDayOptions}
            />
            <Controller
              name={`attractions.${index}.address`}
              control={control}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Address"
                  className="lg:col-span-2"
                />
              )}
            />
            <Controller
              name={`attractions.${index}.cover_image`}
              control={control}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Cover Image URL"
                  className="lg:col-span-2"
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
          </FormGrid>
        </div>
      ))}
    </CollectionBlock>
  );
}

function ActivityFields({ control, fields, append, remove }) {
  return (
    <CollectionBlock
      title="Activities"
      addLabel="Add Activity"
      onAdd={() => append({ ...emptyActivity })}
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
          <FormGrid columns="lg:grid-cols-4">
            <Controller
              name={`activities.${index}.name`}
              control={control}
              render={({ field }) => <FloatingInput {...field} label="Name" />}
            />
            <SelectField
              control={control}
              name={`activities.${index}.activity_type`}
              label="Type"
              options={activityTypes}
            />
            <SelectField
              control={control}
              name={`activities.${index}.difficulty_level`}
              label="Difficulty"
              options={difficulties}
            />
            <SelectField
              control={control}
              name={`activities.${index}.budget_tier`}
              label="Budget"
              options={budgetTiers}
            />
            <Controller
              name={`activities.${index}.approx_cost`}
              control={control}
              render={({ field }) => (
                <FloatingInput {...field} label="Approx Cost" />
              )}
            />
            <SelectField
              control={control}
              name={`activities.${index}.cost_unit`}
              label="Cost Unit"
              options={costUnits}
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
            <Controller
              name={`activities.${index}.best_season`}
              control={control}
              render={({ field }) => (
                <FloatingInput {...field} label="Best Season" />
              )}
            />
            <Controller
              name={`activities.${index}.cover_image`}
              control={control}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Cover Image URL"
                  className="lg:col-span-2"
                />
              )}
            />
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
          </FormGrid>
        </div>
      ))}
    </CollectionBlock>
  );
}

function CuisineFields({ control, fields, append, remove }) {
  return (
    <CollectionBlock
      title="Cuisines"
      addLabel="Add Cuisine"
      onAdd={() => append({ ...emptyCuisine })}
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
          <FormGrid columns="lg:grid-cols-4">
            <Controller
              name={`cuisines.${index}.name`}
              control={control}
              render={({ field }) => <FloatingInput {...field} label="Name" />}
            />
            <SelectField
              control={control}
              name={`cuisines.${index}.cuisine_type`}
              label="Type"
              options={cuisineTypes}
            />
            <SelectField
              control={control}
              name={`cuisines.${index}.spice_level`}
              label="Spice Level"
              options={spiceLevels}
            />
            <SelectField
              control={control}
              name={`cuisines.${index}.meal_type`}
              label="Meal Type"
              options={mealTypes}
            />
            <Controller
              name={`cuisines.${index}.approx_price_range`}
              control={control}
              render={({ field }) => (
                <FloatingInput {...field} label="Price Range" />
              )}
            />
            <Controller
              name={`cuisines.${index}.cover_image`}
              control={control}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Cover Image URL"
                  className="lg:col-span-2"
                />
              )}
            />
            <CheckboxField
              control={control}
              name={`cuisines.${index}.is_vegetarian_friendly`}
              label="Vegetarian friendly"
            />
            <CheckboxField
              control={control}
              name={`cuisines.${index}.is_must_try`}
              label="Must try"
            />
            <Controller
              name={`cuisines.${index}.ingredients_note`}
              control={control}
              render={({ field }) => (
                <FloatingTextarea
                  {...field}
                  label="Ingredients Note"
                  rows={3}
                  className="lg:col-span-2"
                />
              )}
            />
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
          </FormGrid>
        </div>
      ))}
    </CollectionBlock>
  );
}

function CollectionBlock({ title, addLabel, onAdd, children }) {
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
}

const DestinationUpsertPage = () => {
  const navigate = useNavigate();
  const { destination_id } = useParams();
  const isUpdateMode = Boolean(destination_id);
  const [activeStep, setActiveStep] = useState(0);

  const { data: detailData, isFetching: isDetailFetching } =
    useDestinationDetailQuery(destination_id, {
      skip: !isUpdateMode,
    });
  const [createDestination, { isLoading: isCreateLoading }] =
    useCreateDestinationMutation();
  const [updateDestination, { isLoading: isUpdateLoading }] =
    useUpdateDestinationMutation();

  const {
    control,
    handleSubmit,
    register,
    reset,
    trigger,
    formState: { errors },
  } = useForm({ defaultValues });

  const tags = useFieldArray({ control, name: "tags" });
  const attractions = useFieldArray({ control, name: "attractions" });
  const activities = useFieldArray({ control, name: "activities" });
  const cuisines = useFieldArray({ control, name: "cuisines" });

  useEffect(() => {
    const destination = detailData?.data || detailData;
    if (isUpdateMode && destination) {
      reset(mapDestinationToForm(destination));
    }
  }, [detailData, isUpdateMode, reset]);

  const isSaving = isCreateLoading || isUpdateLoading;
  const currentStep = steps[activeStep];

  const goNext = async () => {
    const stepFields = {
      basics: ["name", "country", "destination_type", "overview"],
      planning: [],
      media: [],
      attractions: [],
      activities: [],
      cuisines: [],
    };
    const isValid = await trigger(stepFields[currentStep.id]);
    if (isValid) setActiveStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const onSubmit = async (data) => {
    try {
      const formData = getDestinationPayload(data);

      if (isUpdateMode) {
        await updateDestination({ destination_id, formData }).unwrap();
        toast.success("Destination updated successfully");
      } else {
        await createDestination(formData).unwrap();
        toast.success("Destination created successfully");
      }

      navigate("/destinations");
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error?.[0] ||
        "Destination could not be saved";
      toast.error(message);
    }
  };

  if (isUpdateMode && isDetailFetching) {
    return (
      <div className="center min-h-[420px] text-primary">
        <Loader2 className="mr-2 animate-spin" size={22} />
        Loading destination...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flbx gap-4">
        <div>
          <Link
            to="/destinations"
            className="mb-3 inline-flex items-center gap-2 text-sm text-primary"
          >
            <ArrowLeft size={16} />
            Destinations
          </Link>
          <Title variant="lg">
            {isUpdateMode ? "Update Destination" : "Create Destination"}
          </Title>
          <Text variant="sm" className="mt-1">
            Build destination content in focused steps instead of one oversized
            form.
          </Text>
        </div>
      </div>

      <form
        id="destination-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <div className="rounded-full border border-slate-200 bg-white py-2 px-3 flbx">
          <div className="flex gap-2 overflow-x-auto">
            {steps.map((step, index) => {
              const isActive = activeStep === index;
              const isComplete = activeStep > index;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={`flex h-11 shrink-0 items-center gap-2 rounded-full pr-4 pl-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                      isActive
                        ? "border-white/50 bg-white/15 text-white"
                        : isComplete
                          ? "border-primary bg-primary text-white"
                          : "border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    {isComplete ? <Check size={13} /> : index + 1}
                  </span>
                  {step.title}
                </button>
              );
            })}
          </div>
          <Button
            type="submit"
            form="destination-form"
            disabled={isSaving}
            className="!rounded-full !pr-4"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {isUpdateMode ? "Update Destination" : "Create Destination"}
          </Button>
        </div>

        <div className="space-y-5">
          {currentStep.id === "basics" && (
            <StepShell
              title="Basics"
              description="Capture the identity, geography, and short traveler-facing story."
            >
              <FormGrid>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Destination name is required" }}
                  render={({ field }) => (
                    <FloatingInput
                      {...field}
                      label="Destination Name"
                      error={errors.name?.message}
                    />
                  )}
                />
                <SelectField
                  control={control}
                  name="destination_type"
                  label="Destination Type"
                  options={destinationTypes}
                  error={errors.destination_type?.message}
                  rules={{ required: "Destination type is required" }}
                />
                <SelectField
                  control={control}
                  name="country"
                  label="Country"
                  options={COUNTRY_LIST.map((country) => country.name)}
                  error={errors.country?.message}
                  rules={{ required: "Country is required" }}
                />
                <Controller
                  name="country_code"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput {...field} label="Country Code" />
                  )}
                />
                <Controller
                  name="region"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput {...field} label="Region" />
                  )}
                />
                <SelectField
                  control={control}
                  name="status"
                  label="Status"
                  options={statuses}
                />
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
                <Controller
                  name="tagline"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput {...field} label="Tagline" />
                  )}
                />
                <Controller
                  name="overview"
                  control={control}
                  rules={{ required: "Overview is required" }}
                  render={({ field }) => (
                    <FloatingTextarea
                      {...field}
                      label="Overview"
                      rows={5}
                      error={errors.overview?.message}
                      className="md:col-span-2 lg:col-span-3"
                    />
                  )}
                />
              </FormGrid>
            </StepShell>
          )}

          {currentStep.id === "planning" && (
            <StepShell
              title="Planning"
              description="Keep compact numeric fields small and give narrative notes more room."
            >
              <FormGrid>
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
                  name="budget_tier"
                  label="Budget Tier"
                  options={budgetTiers}
                />
                <SelectField
                  control={control}
                  name="difficulty"
                  label="Difficulty"
                  options={difficulties}
                />
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput {...field} label="Currency" />
                  )}
                />
                <Controller
                  name="currency_code"
                  control={control}
                  render={({ field }) => (
                    <FloatingInput {...field} label="Currency Code" />
                  )}
                />
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
                    <FloatingTextarea {...field} label="Visa Notes" rows={4} />
                  )}
                />
                <Controller
                  name="cultural_tips"
                  control={control}
                  render={({ field }) => (
                    <FloatingTextarea
                      {...field}
                      label="Cultural Tips"
                      rows={4}
                      placeholder="One tip per line"
                      className="md:col-span-2"
                    />
                  )}
                />
              </FormGrid>
            </StepShell>
          )}

          {currentStep.id === "media" && (
            <TagsStep
              control={control}
              fields={tags.fields}
              append={tags.append}
              remove={tags.remove}
              coverImageRegister={register("cover_image_file")}
              galleryImagesRegister={register("gallery_images")}
            />
          )}

          {currentStep.id === "attractions" && (
            <StepShell
              title="Attractions"
              description="Add structured places travelers can visit."
            >
              <AttractionFields
                control={control}
                fields={attractions.fields}
                append={attractions.append}
                remove={attractions.remove}
              />
            </StepShell>
          )}

          {currentStep.id === "activities" && (
            <StepShell
              title="Activities"
              description="Add guided, seasonal, or self-directed things to do."
            >
              <ActivityFields
                control={control}
                fields={activities.fields}
                append={activities.append}
                remove={activities.remove}
              />
            </StepShell>
          )}

          {currentStep.id === "cuisines" && (
            <StepShell
              title="Cuisine"
              description="Add foods and local dishes connected to this destination."
            >
              <CuisineFields
                control={control}
                fields={cuisines.fields}
                append={cuisines.append}
                remove={cuisines.remove}
              />
            </StepShell>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}
              disabled={activeStep === 0}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>

            <div className="flex gap-3">
              <Link to="/destinations">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              {activeStep < steps.length - 1 ? (
                <Button type="button" onClick={goNext}>
                  Next
                  <ChevronRight size={16} />
                </Button>
              ) : (
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  {isUpdateMode ? "Update Destination" : "Create Destination"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default DestinationUpsertPage;
