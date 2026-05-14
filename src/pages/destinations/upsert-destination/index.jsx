import React, { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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

const destinationTypes = ["city", "beach", "mountain", "island", "country", "region", "park"];
const budgetTiers = ["budget", "mid_range", "luxury"];
const difficulties = ["easy", "moderate", "challenging"];
const statuses = ["draft", "published", "archived"];
const dataSources = ["admin", "manual", "partner", "import"];

const defaultValues = {
  name: "",
  country: "",
  country_code: "",
  destination_type: "",
  latitude: "",
  longitude: "",
  tagline: "",
  overview: "",
  min_stay_days: "",
  max_stay_days: "",
  budget_tier: "",
  difficulty: "",
  currency: "",
  currency_code: "",
  status: "draft",
  data_source: "admin",
  region: "",
  getting_around: "",
  visa_notes: "",
  local_languages: "",
  best_travel_months: "",
  cultural_tips: "",
  cover_image: "",
  cover_image_file: null,
  gallery_images: null,
  tags: [{ name: "", category: "" }],
};

const scalarFields = [
  "name",
  "country",
  "country_code",
  "destination_type",
  "latitude",
  "longitude",
  "tagline",
  "overview",
  "min_stay_days",
  "max_stay_days",
  "budget_tier",
  "difficulty",
  "currency",
  "currency_code",
  "status",
  "data_source",
  "region",
  "getting_around",
  "visa_notes",
  "cover_image",
];

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

function splitList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];

  return String(value)
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMonths(value) {
  if (Array.isArray(value)) return value;

  return splitList(value)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item >= 1 && item <= 12);
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

function mapDestinationToForm(destination) {
  return {
    ...defaultValues,
    ...scalarFields.reduce((acc, field) => {
      acc[field] = destination?.[field] ?? "";
      return acc;
    }, {}),
    local_languages: joinList(destination?.local_languages),
    best_travel_months: joinList(destination?.best_travel_months),
    cultural_tips: joinList(destination?.cultural_tips),
    tags: normalizeTags(destination?.tags),
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

  const tags = data.tags
    .map((tag) => ({
      name: tag.name?.trim(),
      category: tag.category?.trim(),
    }))
    .filter((tag) => tag.name);

  formData.append("tags", JSON.stringify(tags));
  formData.append("local_languages", JSON.stringify(splitList(data.local_languages)));
  formData.append("best_travel_months", JSON.stringify(parseMonths(data.best_travel_months)));
  formData.append("cultural_tips", JSON.stringify(splitList(data.cultural_tips)));

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

function FieldGroup({ title, description, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div className="mb-5">
        <Title variant="xs">{title}</Title>
        {description && (
          <Text variant="sm" className="mt-1">
            {description}
          </Text>
        )}
      </div>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

function SelectField({ control, name, label, options, error, rules }) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">{label}</label>
          <Select value={field.value || undefined} onValueChange={field.onChange}>
            <SelectTrigger className="h-[54px] w-full rounded-xl border-slate-300 bg-white px-4">
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => {
                const value = typeof option === "string" ? option : option.value;
                const optionLabel = typeof option === "string" ? option.replaceAll("_", " ") : option.label;

                return (
                  <SelectItem key={value} value={String(value)}>
                    <span className="capitalize">{optionLabel}</span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}
    />
  );
}

function FileField({ label, helper, register, multiple = false }) {
  return (
    <label className="flex min-h-[112px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-primary hover:bg-primary/5">
      <ImagePlus size={22} className="mb-2 text-primary" />
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="mt-1 text-xs text-slate-500">{helper}</span>
      <input type="file" accept="image/*" multiple={multiple} className="sr-only" {...register} />
    </label>
  );
}

const DestinationUpsertPage = () => {
  const navigate = useNavigate();
  const { destination_id } = useParams();
  const isUpdateMode = Boolean(destination_id);

  const { data: detailData, isFetching: isDetailFetching } = useDestinationDetailQuery(destination_id, {
    skip: !isUpdateMode,
  });
  const [createDestination, { isLoading: isCreateLoading }] = useCreateDestinationMutation();
  const [updateDestination, { isLoading: isUpdateLoading }] = useUpdateDestinationMutation();

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tags",
  });

  useEffect(() => {
    const destination = detailData?.data || detailData;
    if (isUpdateMode && destination) {
      reset(mapDestinationToForm(destination));
    }
  }, [detailData, isUpdateMode, reset]);

  const isSaving = isCreateLoading || isUpdateLoading;

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
          <Link to="/destinations" className="mb-3 inline-flex items-center gap-2 text-sm text-primary">
            <ArrowLeft size={16} />
            Destinations
          </Link>
          <Title variant="lg">{isUpdateMode ? "Update Destination" : "Create Destination"}</Title>
          <Text variant="sm" className="mt-1">
            Keep destination content, travel details, and media organized in one place.
          </Text>
        </div>
        <Button type="submit" form="destination-form" disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {isUpdateMode ? "Update" : "Create"}
        </Button>
      </div>

      <form id="destination-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FieldGroup title="Core Details" description="Primary naming, location, and publishing metadata.">
          <Controller
            name="name"
            control={control}
            rules={{ required: "Destination name is required" }}
            render={({ field }) => (
              <FloatingInput {...field} label="Destination Name" error={errors.name?.message} />
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
            render={({ field }) => <FloatingInput {...field} label="Country Code" />}
          />
          <Controller
            name="region"
            control={control}
            render={({ field }) => <FloatingInput {...field} label="Region" />}
          />
          <SelectField control={control} name="status" label="Status" options={statuses} />
          <Controller
            name="latitude"
            control={control}
            render={({ field }) => <FloatingInput {...field} type="number" step="any" label="Latitude" />}
          />
          <Controller
            name="longitude"
            control={control}
            render={({ field }) => <FloatingInput {...field} type="number" step="any" label="Longitude" />}
          />
        </FieldGroup>

        <FieldGroup title="Story" description="Readable content shown to travelers.">
          <Controller
            name="tagline"
            control={control}
            render={({ field }) => <FloatingInput {...field} label="Tagline" className="md:col-span-2" />}
          />
          <Controller
            name="overview"
            control={control}
            rules={{ required: "Overview is required" }}
            render={({ field }) => (
              <FloatingTextarea
                {...field}
                label="Overview"
                rows={6}
                error={errors.overview?.message}
                className="md:col-span-2"
              />
            )}
          />
          <Controller
            name="getting_around"
            control={control}
            render={({ field }) => (
              <FloatingTextarea {...field} label="Getting Around" rows={4} className="md:col-span-2" />
            )}
          />
          <Controller
            name="visa_notes"
            control={control}
            render={({ field }) => (
              <FloatingTextarea {...field} label="Visa Notes" rows={4} className="md:col-span-2" />
            )}
          />
        </FieldGroup>

        <FieldGroup title="Planning" description="Structured travel planning attributes and JSON-backed lists.">
          <Controller
            name="min_stay_days"
            control={control}
            render={({ field }) => <FloatingInput {...field} type="number" min="0" label="Minimum Stay Days" />}
          />
          <Controller
            name="max_stay_days"
            control={control}
            render={({ field }) => <FloatingInput {...field} type="number" min="0" label="Maximum Stay Days" />}
          />
          <SelectField control={control} name="budget_tier" label="Budget Tier" options={budgetTiers} />
          <SelectField control={control} name="difficulty" label="Difficulty" options={difficulties} />
          <Controller
            name="currency"
            control={control}
            render={({ field }) => <FloatingInput {...field} label="Currency" />}
          />
          <Controller
            name="currency_code"
            control={control}
            render={({ field }) => <FloatingInput {...field} label="Currency Code" />}
          />
          <Controller
            name="local_languages"
            control={control}
            render={({ field }) => (
              <FloatingTextarea
                {...field}
                label="Local Languages"
                rows={3}
                className="md:col-span-2"
                placeholder="English, Thai"
              />
            )}
          />
          <Controller
            name="best_travel_months"
            control={control}
            render={({ field }) => (
              <FloatingTextarea
                {...field}
                label="Best Travel Months"
                rows={3}
                className="md:col-span-2"
                placeholder="11, 12, 1"
              />
            )}
          />
          <div className="md:col-span-2 flex flex-wrap gap-2">
            {monthOptions.map((month) => (
              <span key={month.value} className="rounded-md bg-primary/10 px-2.5 py-1 text-xs text-primary">
                {month.value} = {month.label}
              </span>
            ))}
          </div>
          <Controller
            name="cultural_tips"
            control={control}
            render={({ field }) => (
              <FloatingTextarea
                {...field}
                label="Cultural Tips"
                rows={4}
                className="md:col-span-2"
                placeholder="One tip per line"
              />
            )}
          />
        </FieldGroup>

        <FieldGroup title="Tags" description="Add searchable labels with optional categories.">
          <div className="md:col-span-2 space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_1fr_auto]">
                <Controller
                  name={`tags.${index}.name`}
                  control={control}
                  render={({ field }) => <FloatingInput {...field} label="Tag Name" />}
                />
                <Controller
                  name={`tags.${index}.category`}
                  control={control}
                  render={({ field }) => <FloatingInput {...field} label="Category" />}
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
            <Button type="button" variant="outline" onClick={() => append({ name: "", category: "" })}>
              <Plus size={16} />
              Add Tag
            </Button>
          </div>
        </FieldGroup>

        <FieldGroup title="Media" description="Upload a main cover image, attach gallery images, or provide a cover URL.">
          <FileField
            label="Cover Image"
            helper="Uploads as cover_image_file"
            register={register("cover_image_file")}
          />
          <FileField
            label="Gallery Images"
            helper="Multiple files upload as gallery_images"
            multiple
            register={register("gallery_images")}
          />
          <Controller
            name="cover_image"
            control={control}
            render={({ field }) => (
              <FloatingInput {...field} label="Cover Image URL" className="md:col-span-2" />
            )}
          />
          <SelectField control={control} name="data_source" label="Data Source" options={dataSources} />
        </FieldGroup>

        <div className="flex justify-end gap-3">
          <Link to="/destinations">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {isUpdateMode ? "Update Destination" : "Create Destination"}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default DestinationUpsertPage;
