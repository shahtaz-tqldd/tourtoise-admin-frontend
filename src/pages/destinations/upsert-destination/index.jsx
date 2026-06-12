import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { FloatingSelect, SelectItem } from "@/components/ui/select";
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
  cover_image_file: null,
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
  cover_image_file: null,
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
  cover_image_file: null,
  is_vegetarian_friendly: false,
  is_must_try: false,
  approx_price_range: "",
};

const defaultValues = {
  name: "",
  country: "",
  region: "",
  destination_type: "",
  latitude: "",
  longitude: "",
  tagline: "",
  overview: "",
  cover_image: "",
  cover_image_file: null,
  gallery_images: null,
  existing_gallery_images: [],
  tags: [{ name: "", category: "" }],
  min_stay_days: "",
  max_stay_days: "",
  budget_tier: "",
  difficulty: "",
  local_languages: "",
  best_travel_months: [],
  currency: "",

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
        const isFileValue =
          typeof File !== "undefined" && value instanceof File;
        if (
          key.endsWith("_file") ||
          isFileValue ||
          Array.isArray(value) ||
          (typeof FileList !== "undefined" && value instanceof FileList)
        ) {
          return acc;
        }
        if (key === "cover_image" && item?.cover_image_file?.[0]) {
          return acc;
        }
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

function getPrimaryImageUrl(item) {
  if (item?.cover_image) return item.cover_image;
  if (Array.isArray(item?.images) && item.images.length > 0) {
    return item.images[0]?.image_url || item.images[0]?.url || "";
  }
  return "";
}

function normalizeCollection(items, fallback) {
  if (!Array.isArray(items) || items.length === 0) return [{ ...fallback }];
  const normalized = items.map((item) => ({
    ...fallback,
    ...item,
    cover_image: getPrimaryImageUrl(item),
    cover_image_file: null,
  }));
  return normalized.length ? normalized : [{ ...fallback }];
}

function normalizeExistingImages(images) {
  if (!Array.isArray(images)) return [];

  return images
    .map((image) => ({
      id: image?.id || image?.image_url || image?.url,
      url: image?.image_url || image?.url || "",
      caption: image?.caption || "",
      sort_order: image?.sort_order || "",
    }))
    .filter((image) => image.url);
}

function appendCollectionCoverFiles(formData, collectionName, items = []) {
  items.forEach((item, index) => {
    const file = item?.cover_image_file?.[0];
    if (file) {
      formData.append(`${collectionName}[${index}].cover_image_file`, file);
    }
  });
}

function getChangedCollectionItems(items = [], dirtyItems = []) {
  if (!Array.isArray(dirtyItems)) return [];

  return dirtyItems
    .map((dirtyItem, index) => {
      if (!dirtyItem) return null;

      const item = items[index] || {};
      const payload = item.id ? { id: item.id } : {};

      Object.entries(dirtyItem).forEach(([key, isDirty]) => {
        if (!isDirty || key.endsWith("_file")) return;
        if (key === "cover_image" && dirtyItem.cover_image_file) return;

        const value = item[key];
        if (typeof value === "boolean") {
          payload[key] = value;
        } else if (value !== undefined && value !== null) {
          payload[key] = [
            "latitude",
            "longitude",
            "avg_duration_hours",
            "duration_hours",
            "sort_order",
          ].includes(key)
            ? toNumber(value)
            : value;
        }
      });

      if (Object.keys(payload).length === 0) return null;
      return { index, item, payload };
    })
    .filter(Boolean);
}

function appendChangedCollection(
  formData,
  collectionName,
  items = [],
  dirtyItems = [],
) {
  const changedItems = getChangedCollectionItems(items, dirtyItems);
  if (changedItems.length === 0) return;

  formData.append(
    collectionName,
    JSON.stringify(changedItems.map((changedItem) => changedItem.payload)),
  );

  changedItems.forEach((changedItem, changedIndex) => {
    const file = changedItem.item?.cover_image_file?.[0];
    if (file) {
      formData.append(
        `${collectionName}[${changedIndex}].cover_image_file`,
        file,
      );
    }
  });
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

function getOptionCandidateValues(value) {
  if (value === null || value === undefined || value === "") return [];

  if (typeof value !== "object") return [String(value)];

  return [
    value.value,
    value.label,
    value.name,
    value.title,
    value.code,
    value.slug,
  ].filter((item) => item !== null && item !== undefined && item !== "");
}

function toComparableOptionValue(value) {
  return String(value).trim().toLowerCase().replaceAll("-", "_");
}

function normalizeOptionValue(value, options) {
  const rawValues = getOptionCandidateValues(value);
  if (!rawValues.length) return "";

  const comparableValues = rawValues.map(toComparableOptionValue);
  const matchedOption = options.find((option) => {
    const optionValue = typeof option === "string" ? option : option.value;
    const optionLabel = typeof option === "string" ? option : option.label;
    return [optionValue, optionLabel].some((candidate) => {
      return comparableValues.includes(toComparableOptionValue(candidate));
    });
  });

  if (!matchedOption) return String(rawValues[0]).trim();

  return String(
    typeof matchedOption === "string" ? matchedOption : matchedOption.value,
  );
}

function mapDestinationToForm(destination) {
  return {
    ...defaultValues,
    ...scalarFields.reduce((acc, field) => {
      acc[field] = destination?.[field] ?? "";
      return acc;
    }, {}),
    country: normalizeOptionValue(
      destination?.country,
      COUNTRY_LIST.map((country) => ({
        value: country.name,
        label: country.name,
      })),
    ),
    local_languages: joinList(destination?.local_languages),
    best_travel_months: normalizeMonths(destination?.best_travel_months),
    cultural_tips: joinList(destination?.cultural_tips),
    destination_type: normalizeOptionValue(
      destination?.destination_type,
      destinationTypes,
    ),
    budget_tier: normalizeOptionValue(destination?.budget_tier, budgetTiers),
    difficulty: normalizeOptionValue(destination?.difficulty, difficulties),
    existing_gallery_images: normalizeExistingImages(destination?.images),
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

  appendCollectionCoverFiles(formData, "attractions", data.attractions);
  appendCollectionCoverFiles(formData, "activities", data.activities);
  appendCollectionCoverFiles(formData, "cuisines", data.cuisines);

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

function getChangedDestinationPayload(data, dirtyFields) {
  const formData = new FormData();

  scalarFields.forEach((field) => {
    if (dirtyFields[field]) {
      formData.append(field, data[field] ?? "");
    }
  });

  if (dirtyFields.tags) {
    formData.append("tags", JSON.stringify(pruneEmptyObjects(data.tags)));
  }
  if (dirtyFields.local_languages) {
    formData.append(
      "local_languages",
      JSON.stringify(splitList(data.local_languages)),
    );
  }
  if (dirtyFields.best_travel_months) {
    formData.append(
      "best_travel_months",
      JSON.stringify(normalizeMonths(data.best_travel_months)),
    );
  }
  if (dirtyFields.cultural_tips) {
    formData.append(
      "cultural_tips",
      JSON.stringify(splitList(data.cultural_tips)),
    );
  }
  if (dirtyFields.attractions) {
    appendChangedCollection(
      formData,
      "attractions",
      data.attractions,
      dirtyFields.attractions,
    );
  }
  if (dirtyFields.activities) {
    appendChangedCollection(
      formData,
      "activities",
      data.activities,
      dirtyFields.activities,
    );
  }
  if (dirtyFields.cuisines) {
    appendChangedCollection(
      formData,
      "cuisines",
      data.cuisines,
      dirtyFields.cuisines,
    );
  }

  const coverImageFile = data.cover_image_file?.[0];
  if (dirtyFields.cover_image_file && coverImageFile) {
    formData.delete("cover_image");
    formData.append("cover_image_file", coverImageFile);
  }

  if (dirtyFields.gallery_images) {
    Array.from(data.gallery_images || []).forEach((file) => {
      formData.append("gallery_images", file);
    });
  }

  return formData;
}

function hasFormDataEntries(formData) {
  return !formData.entries().next().done;
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
      render={({ field }) => {
        const optionItems = options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          return {
            value: String(value),
            label:
              typeof option === "string"
                ? option.replaceAll("_", " ")
                : option.label,
            icon: typeof option === "string" ? null : option.icon,
          };
        });
        const rawValue =
          field.value === "" ||
          field.value === null ||
          field.value === undefined
            ? ""
            : String(field.value);
        const comparableValue = toComparableOptionValue(rawValue);
        const selectedOption =
          optionItems.find((option) => option.value === rawValue) ||
          optionItems.find(
            (option) =>
              toComparableOptionValue(option.value) === comparableValue,
          ) ||
          optionItems.find(
            (option) =>
              toComparableOptionValue(option.label) === comparableValue,
          );

        return (
          <div className={className}>
            <FloatingSelect
              label={label}
              placeholder={`Select ${label.toLowerCase()}`}
              value={selectedOption?.value}
              displayValue={selectedOption?.label}
              onValueChange={(value) => {
                field.onChange(value);
                onValueChange?.(value);
              }}
            >
              {optionItems.map((option) => {
                return (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    textValue={option.label}
                    className="capitalize"
                  >
                    {option.icon && (
                      <span
                        className="text-base leading-none"
                        aria-hidden="true"
                      >
                        {option.icon}
                      </span>
                    )}
                    {option.label}
                  </SelectItem>
                );
              })}
            </FloatingSelect>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
        );
      }}
    />
  );
}

function CheckboxField({ control, name, label }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer select-none">
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
    <section className="min-w-0 rounded-4xl bg-white p-8 border">
      <div className="mb-10">
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

function TagsStep({ control, fields, append, remove, setValue }) {
  return (
    <StepShell
      title="Media & Tags"
      description="Add a cover image, preview selected uploads, and label the destination."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
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

        <MediaUploadPanel control={control} setValue={setValue} />
      </div>
    </StepShell>
  );
}

function MediaUploadPanel({ control, setValue }) {
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const coverUrl = useWatch({ control, name: "cover_image" });
  const coverFiles = useWatch({ control, name: "cover_image_file" });
  const galleryFiles = useWatch({ control, name: "gallery_images" });
  const existingGalleryImages =
    useWatch({ control, name: "existing_gallery_images" }) || [];
  const coverPreviews = useFilePreviews(coverFiles);
  const galleryPreviews = useFilePreviews(galleryFiles);
  const activeCover = coverPreviews[0]?.url || coverUrl;
  const selectedGalleryFiles = Array.from(galleryFiles || []);
  const galleryImageCount =
    existingGalleryImages.length + selectedGalleryFiles.length;
  const canAddGallery = galleryImageCount < 6;

  const openCoverPicker = () => coverInputRef.current?.click();
  const openGalleryPicker = () => galleryInputRef.current?.click();

  const updateCover = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setValue("cover_image_file", [file], { shouldDirty: true });
  };

  const removeCover = () => {
    setValue("cover_image_file", null, { shouldDirty: true });
    setValue("cover_image", "", { shouldDirty: true });
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const addGalleryImages = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = Math.max(6 - existingGalleryImages.length, 0);
    const nextFiles = [...selectedGalleryFiles, ...files].slice(
      0,
      remainingSlots,
    );
    setValue("gallery_images", nextFiles, { shouldDirty: true });
    event.target.value = "";
  };

  const removeGalleryImage = (index) => {
    const nextFiles = selectedGalleryFiles.filter((_, itemIndex) => {
      return itemIndex !== index;
    });
    setValue("gallery_images", nextFiles.length ? nextFiles : null, {
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <div
          className={`relative aspect-[16/9] overflow-hidden rounded-xl border ${
            activeCover
              ? "border-slate-200 bg-white"
              : "border-dashed border-slate-300 bg-white"
          }`}
        >
          {activeCover ? (
            <>
              <img
                src={activeCover}
                alt="Cover preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-3 bottom-3 flex justify-end gap-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-white text-slate-800 shadow-sm hover:bg-slate-100"
                    onClick={openCoverPicker}
                  >
                    <ImagePlus size={15} />
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeCover}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={openCoverPicker}
              className="flex h-full w-full flex-col items-center justify-center px-4 text-center text-slate-500 transition hover:bg-primary/5 hover:text-primary"
            >
              <ImagePlus size={28} />
              <span className="mt-2 text-sm font-semibold text-slate-800">
                Upload Cover
              </span>
            </button>
          )}
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={updateCover}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Gallery Images
            </p>
            <p className="text-xs text-slate-500">
              Add up to 6 square gallery images.
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
            {galleryImageCount}/6
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {existingGalleryImages.map((image) => (
            <div
              key={image.id || image.url}
              className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <img
                src={image.url}
                alt={image.caption || "Gallery image"}
                className="h-full w-full object-cover"
              />
              <span className="absolute left-1.5 top-1.5 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-medium text-slate-600 shadow-sm">
                Existing
              </span>
            </div>
          ))}

          {galleryPreviews.map((preview, index) => (
            <div
              key={preview.url}
              className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <img
                src={preview.url}
                alt={preview.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeGalleryImage(index)}
                className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm opacity-0 transition hover:text-red-600 group-hover:opacity-100"
                aria-label="Remove gallery image"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {canAddGallery && (
            <button
              type="button"
              onClick={openGalleryPicker}
              className="flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-3 text-center text-slate-500 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <ImagePlus size={24} />
              <span className="mt-2 text-xs font-semibold text-slate-800">
                Upload
              </span>
            </button>
          )}
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={addGalleryImages}
        />
      </div>
    </div>
  );
}

function SingleImageUploadTile({
  control,
  setValue,
  name,
  urlName,
  title,
  className = "",
}) {
  const inputRef = useRef(null);
  const imageUrl = useWatch({ control, name: urlName });
  const imageFiles = useWatch({ control, name });
  const previews = useFilePreviews(imageFiles);
  const activeImage = previews[0]?.url || imageUrl;

  const openPicker = () => inputRef.current?.click();

  const updateImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setValue(name, [file], { shouldDirty: true });
    setValue(urlName, "", { shouldDirty: true });
  };

  const removeImage = () => {
    setValue(name, null, { shouldDirty: true });
    setValue(urlName, "", { shouldDirty: true });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={className}>
      <div
        className={`relative aspect-[16/9] overflow-hidden rounded-xl border ${
          activeImage
            ? "border-slate-200 bg-white"
            : "border-dashed border-slate-300 bg-white"
        }`}
      >
        {activeImage ? (
          <>
            <img
              src={activeImage}
              alt={`${title} preview`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-3 bottom-3 flex justify-end flex gap-2">
              <Button
                type="button"
                size="sm"
                className="bg-white text-slate-800 shadow-sm hover:bg-slate-100"
                onClick={openPicker}
              >
                <ImagePlus size={15} />
                Change
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeImage}
              >
                <Trash2 size={15} />
                Remove
              </Button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={openPicker}
            className="flex h-full w-full flex-col items-center justify-center px-4 text-center text-slate-500 transition hover:bg-primary/5 hover:text-primary"
          >
            <ImagePlus size={26} />
            <span className="mt-2 text-sm font-semibold text-slate-800">
              Upload Cover
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={updateImage}
      />
    </div>
  );
}

function AttractionFields({ control, fields, append, remove, setValue }) {
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
                  options={attractionTypes}
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
                  options={budgetTiers}
                />
                <SelectField
                  control={control}
                  name={`attractions.${index}.best_time_of_day`}
                  label="Best Time"
                  options={timeOfDayOptions}
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
            </div>
            <div className="space-y-5 col-span-2">
              <SingleImageUploadTile
                control={control}
                setValue={setValue}
                name={`attractions.${index}.cover_image_file`}
                urlName={`attractions.${index}.cover_image`}
                title="Cover Image"
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
  );
}

function ActivityFields({ control, fields, append, remove, setValue }) {
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
                  options={activityTypes}
                  className="col-span-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="col-span-2 space-y-5">
              <SingleImageUploadTile
                control={control}
                setValue={setValue}
                name={`activities.${index}.cover_image_file`}
                urlName={`activities.${index}.cover_image`}
                title="Cover Image"
              />
              <div className="grid grid-cols-2 gap-4">
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
              </div>
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
          </div>
        </div>
      ))}
    </CollectionBlock>
  );
}

function CuisineFields({ control, fields, append, remove, setValue }) {
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
                <SelectField
                  control={control}
                  name={`cuisines.${index}.cuisine_type`}
                  label="Type"
                  options={cuisineTypes}
                  className="col-span-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="flex gap-6">
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
              </div>
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
            </div>
            <div className="col-span-2 space-y-5">
              <SingleImageUploadTile
                control={control}
                setValue={setValue}
                name={`cuisines.${index}.cover_image_file`}
                urlName={`cuisines.${index}.cover_image`}
                title="Cover Image"
              />
              <Controller
                name={`cuisines.${index}.approx_price_range`}
                control={control}
                render={({ field }) => (
                  <FloatingInput {...field} label="Price Range" />
                )}
              />
            </div>
          </div>
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
    reset,
    setValue,
    trigger,
    formState: { dirtyFields, errors },
  } = useForm({ defaultValues });

  const tags = useFieldArray({ control, name: "tags" });
  const attractions = useFieldArray({ control, name: "attractions" });
  const activities = useFieldArray({ control, name: "activities" });
  const cuisines = useFieldArray({ control, name: "cuisines" });

  // Add this state
  const [isFormReady, setIsFormReady] = useState(!isUpdateMode);

  useEffect(() => {
    const destination = detailData?.data || detailData;
    if (isUpdateMode && destination) {
      const formValues = mapDestinationToForm(destination);
      reset(formValues);
      setIsFormReady(true); // <-- add this
    }
  }, [detailData, isUpdateMode, reset, setValue]);

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
      const formData = isUpdateMode
        ? getChangedDestinationPayload(data, dirtyFields)
        : getDestinationPayload(data);

      if (isUpdateMode) {
        if (!hasFormDataEntries(formData)) {
          toast.info("No changes to update");
          return;
        }
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
    <section className="min-w-0 space-y-6">
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
      {isFormReady && (
        <form
          id="destination-form"
          onSubmit={handleSubmit(onSubmit)}
          className="min-w-0 space-y-5"
        >
          <div className="flex min-w-0 items-center justify-between gap-3 rounded-full border border-slate-200 bg-white py-2 px-3">
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
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
              className="shrink-0 !rounded-full !pr-4"
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
                        options={destinationTypes}
                        error={errors.destination_type?.message}
                        rules={{ required: "Destination type is required" }}
                        className="col-span-2"
                      />
                    </div>
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
                          rows={8}
                          error={errors.overview?.message}
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
                        name="region"
                        control={control}
                        render={({ field }) => (
                          <FloatingInput {...field} label="Region" />
                        )}
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
            )}

            {currentStep.id === "planning" && (
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
                        name="difficulty"
                        label="Difficulty"
                        options={difficulties}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <SelectField
                        control={control}
                        name="budget_tier"
                        label="Budget Tier"
                        options={budgetTiers}
                      />

                      <Controller
                        name="currency"
                        control={control}
                        render={({ field }) => (
                          <FloatingInput {...field} label="Currency" />
                        )}
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
                    <Controller
                      name="visa_notes"
                      control={control}
                      render={({ field }) => (
                        <FloatingTextarea
                          {...field}
                          label="Visa Notes"
                          rows={3}
                        />
                      )}
                    />
                  </div>
                </div>
              </StepShell>
            )}

            {currentStep.id === "media" && (
              <TagsStep
                control={control}
                fields={tags.fields}
                append={tags.append}
                remove={tags.remove}
                setValue={setValue}
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
                  setValue={setValue}
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
                  setValue={setValue}
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
                  setValue={setValue}
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
      )}
    </section>
  );
};

export default DestinationUpsertPage;
