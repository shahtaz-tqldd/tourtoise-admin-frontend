import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, ChevronLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/typography";
import {
  useCreateNewDestinationMutation,
  useDestinationDetailQuery,
  useUpdateDestinationMutation,
} from "@/features/destination/destinationApiSlice";
import { COUNTRY_LIST } from "@/lib/countries";
import BasicInfo from "./components/basic-info";
import PlanningInfo from "./components/planning";
import { normalizeMonths } from "@/lib/date-time";
import MediaTags from "./components/media-tags";
import AttractionInfo from "./components/attraction";
import ActivityInfo from "./components/activity";
import CuisineInfo from "./components/cuisine";
import {
  BUDGET_TIERS,
  DESTINATION_TYPES,
  DIFFICULTIES,
  EMPTY_ACTIVITY,
  EMPTY_ATTRACTION,
  EMPTY_CUISINE,
} from "./constants";
import { toComparableOptionValue } from "@/lib/utils";

const defaultValues = {
  name: "",
  country: "",
  country_code: "",
  region: "",
  destination_type: "",
  latitude: "",
  longitude: "",
  tagline: "",
  description: "",
  cover_image: "",
  cover_image_file: null,
  gallery_images: null,
  existing_gallery_images: [],
  removed_gallery_image_ids: [],
  tags: [{ name: "", category: "" }],
  min_stay_days: "",
  max_stay_days: "",
  budget_tier: "",
  difficulty_level: "",
  local_languages: "",
  best_travel_months: [],
  currency: "",
  currency_code: "",

  getting_around: "",
  visa_notes: "",
  notes: "",
  status: "draft",
  attractions: [{ ...EMPTY_ATTRACTION }],
  activities: [{ ...EMPTY_ACTIVITY }],
  cuisines: [{ ...EMPTY_CUISINE }],
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
  "description",
  "cover_image",
  "min_stay_days",
  "max_stay_days",
  "budget_tier",
  "difficulty_level",
  "currency",
  "currency_code",
  "getting_around",
  "visa_notes",
  "status",
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

const numericFields = [
  "latitude",
  "longitude",
  "min_stay_days",
  "max_stay_days",
  "avg_duration_hours",
  "duration_hours",
  "sort_order",
];

const listTextFields = ["picking_reasons", "notes"];

function getCollectionPayload(items, requiredKey = "name") {
  return (items || [])
    .map((item) =>
      Object.entries(item || {}).reduce((acc, [key, value]) => {
        const isFileValue =
          typeof File !== "undefined" && value instanceof File;
        if (
          key.endsWith("_file") ||
          isFileValue ||
          (typeof FileList !== "undefined" && value instanceof FileList) ||
          [
            "cover_image",
            "gallery_images",
            "existing_gallery_images",
            "removed_gallery_image_ids",
          ].includes(key)
        ) {
          return acc;
        }
        if (typeof value === "boolean") {
          acc[key] = value;
        } else if (listTextFields.includes(key)) {
          acc[key] = splitList(value);
        } else if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          acc[key] = numericFields.includes(key) ? toNumber(value) : value;
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
    gallery_images: null,
    existing_gallery_images: normalizeExistingImages(item?.images),
    removed_gallery_image_ids: [],
    picking_reasons: joinList(item?.picking_reasons),
    notes: joinList(item?.notes),
  }));
  return normalized.length ? normalized : [{ ...fallback }];
}

function normalizeExistingImages(images) {
  if (!Array.isArray(images)) return [];

  return images
    .map((image) => ({
      id: image?.id,
      url: image?.image_url || image?.url || "",
      caption: image?.caption || "",
      sort_order: image?.sort_order || "",
    }))
    .filter((image) => image.url);
}

function serializeExistingGalleryImages(images = []) {
  return images
    .filter((image) => image.id)
    .map((image) => ({
      id: image.id,
      caption: image.caption || "",
      sort_order: image.sort_order || "",
    }));
}

function appendCollectionMediaFiles(formData, collectionName, items = []) {
  items.forEach((item, index) => {
    const file = item?.cover_image_file?.[0];
    if (file) {
      formData.append(`${collectionName}[${index}].cover_image`, file);
    }

    Array.from(item?.gallery_images || []).forEach((galleryFile) => {
      formData.append(`${collectionName}[${index}].images`, galleryFile);
    });
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
    value.type,
    value.country,
    value.country_name,
    value.destination_type,
    value.code,
    value.slug,
  ].filter((item) => item !== null && item !== undefined && item !== "");
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
    notes: joinList(destination?.notes),
    destination_type: normalizeOptionValue(
      destination?.destination_type,
      DESTINATION_TYPES,
    ),
    budget_tier: normalizeOptionValue(destination?.budget_tier, BUDGET_TIERS),
    difficulty_level: normalizeOptionValue(
      destination?.difficulty_level || destination?.difficulty,
      DIFFICULTIES,
    ),
    existing_gallery_images: normalizeExistingImages(destination?.images),
    tags: normalizeTags(destination?.tags),
    attractions: normalizeCollection(destination?.attractions, EMPTY_ATTRACTION),
    activities: normalizeCollection(destination?.activities, EMPTY_ACTIVITY),
    cuisines: normalizeCollection(destination?.cuisines, EMPTY_CUISINE),
  };
}

function getDestinationPayload(data) {
  const formData = new FormData();

  scalarFields.forEach((field) => {
    const value = data[field];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      formData.append(
        field,
        numericFields.includes(field) ? toNumber(value) : value,
      );
    }
  });

  const tags = getCollectionPayload(data.tags);

  formData.append("tags", JSON.stringify(tags));
  formData.append(
    "local_languages",
    JSON.stringify(splitList(data.local_languages)),
  );
  formData.append(
    "best_travel_months",
    JSON.stringify(normalizeMonths(data.best_travel_months)),
  );
  formData.append("notes", JSON.stringify(splitList(data.notes)));
  formData.append(
    "attractions",
    JSON.stringify(getCollectionPayload(data.attractions)),
  );
  formData.append(
    "activities",
    JSON.stringify(getCollectionPayload(data.activities)),
  );
  formData.append(
    "cuisines",
    JSON.stringify(getCollectionPayload(data.cuisines)),
  );

  appendCollectionMediaFiles(formData, "attractions", data.attractions);
  appendCollectionMediaFiles(formData, "activities", data.activities);
  appendCollectionMediaFiles(formData, "cuisines", data.cuisines);

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
      const value = data[field] ?? "";
      formData.append(
        field,
        numericFields.includes(field) ? toNumber(value) : value,
      );
    }
  });

  if (dirtyFields.tags) {
    formData.append("tags", JSON.stringify(getCollectionPayload(data.tags)));
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
  if (dirtyFields.notes) {
    formData.append("notes", JSON.stringify(splitList(data.notes)));
  }
  if (dirtyFields.attractions) {
    formData.append(
      "attractions",
      JSON.stringify(getCollectionPayload(data.attractions)),
    );
    appendCollectionMediaFiles(formData, "attractions", data.attractions);
  }
  if (dirtyFields.activities) {
    formData.append(
      "activities",
      JSON.stringify(getCollectionPayload(data.activities)),
    );
    appendCollectionMediaFiles(formData, "activities", data.activities);
  }
  if (dirtyFields.cuisines) {
    formData.append(
      "cuisines",
      JSON.stringify(getCollectionPayload(data.cuisines)),
    );
    appendCollectionMediaFiles(formData, "cuisines", data.cuisines);
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
  if (dirtyFields.existing_gallery_images) {
    formData.append(
      "existing_gallery_images",
      JSON.stringify(
        serializeExistingGalleryImages(data.existing_gallery_images),
      ),
    );
  }
  if (dirtyFields.removed_gallery_image_ids) {
    formData.append(
      "removed_gallery_image_ids",
      JSON.stringify(data.removed_gallery_image_ids || []),
    );
  }

  return formData;
}

function hasFormDataEntries(formData) {
  return !formData.entries().next().done;
}

const DestinationUpsertForm = ({ destination_id, initialValues, isUpdateMode }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const [createDestination, { isLoading: isCreateLoading }] =
    useCreateNewDestinationMutation();
  const [updateDestination, { isLoading: isUpdateLoading }] =
    useUpdateDestinationMutation();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { dirtyFields, errors },
  } = useForm({ defaultValues: initialValues });

  const tags = useFieldArray({ control, name: "tags" });
  const attractions = useFieldArray({ control, name: "attractions" });
  const activities = useFieldArray({ control, name: "activities" });
  const cuisines = useFieldArray({ control, name: "cuisines" });

  const isSaving = isCreateLoading || isUpdateLoading;
  const currentStep = steps[activeStep];

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

  return (
    <section className="min-w-0 space-y-6">
      <div className="flbx gap-4 sticky">
        <div className="flx gap-2">
          <Link
            to="/destinations"
            className="h-10 w-10 rounded-full bg-primary/5 hover:bg-primary/10 center text-slate-900 tr"
          >
            <ChevronLeft size={16} />
          </Link>
          <Title variant="lg">
            {isUpdateMode ? "Update Destination" : "Create Destination"}
          </Title>
        </div>

        <div className="flex gap-3">
          {!isUpdateMode && (
            <Button variant="outline" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}
              Save as Draft
            </Button>
          )}
        </div>
      </div>
      <form
        id="destination-form"
        onSubmit={handleSubmit(onSubmit)}
        className="min-w-0 space-y-5"
      >
          <div className="z-100 sticky -top-8 flex min-w-0 items-center justify-between gap-3 rounded-full border border-slate-200 bg-primary/10 backdrop-blur-xl py-2 px-3">
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
                        ? "bg-white text-slate-900"
                        : "text-slate-700 hover:bg-white/30"
                    }`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : isComplete
                            ? "bg-primary text-white"
                            : "bg-white/80 text-slate-600"
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
              {isUpdateMode ? "Update" : "Create"}
            </Button>
          </div>

          <div className="space-y-5">
            {currentStep.id === "basics" && (
              <BasicInfo control={control} errors={errors} />
            )}

            {currentStep.id === "planning" && (
              <PlanningInfo control={control} errors={errors} />
            )}

            {currentStep.id === "media" && (
              <MediaTags
                control={control}
                fields={tags.fields}
                append={tags.append}
                remove={tags.remove}
                setValue={setValue}
              />
            )}

            {currentStep.id === "attractions" && (
              <AttractionInfo
                control={control}
                fields={attractions.fields}
                append={attractions.append}
                remove={attractions.remove}
                setValue={setValue}
              />
            )}

            {currentStep.id === "activities" && (
              <ActivityInfo
                control={control}
                fields={activities.fields}
                append={activities.append}
                remove={activities.remove}
                setValue={setValue}
              />
            )}

            {currentStep.id === "cuisines" && (
              <CuisineInfo
                control={control}
                fields={cuisines.fields}
                append={cuisines.append}
                remove={cuisines.remove}
                setValue={setValue}
              />
            )}
          </div>
      </form>
    </section>
  );
};

const DestinationUpsertPage = () => {
  const { destination_id } = useParams();
  const isUpdateMode = Boolean(destination_id);

  const { data: detailData } = useDestinationDetailQuery(destination_id, {
    skip: !isUpdateMode,
  });
  const destination = detailData?.data || detailData;

  if (isUpdateMode && !destination) {
    return (
      <div className="center min-h-[420px] text-primary">
        <Loader2 className="mr-2 animate-spin" size={22} />
        Loading destination...
      </div>
    );
  }

  const initialValues =
    isUpdateMode && destination ? mapDestinationToForm(destination) : defaultValues;

  return (
    <DestinationUpsertForm
      key={isUpdateMode ? destination.id : "create"}
      destination_id={destination_id}
      initialValues={initialValues}
      isUpdateMode={isUpdateMode}
    />
  );
};

export default DestinationUpsertPage;
