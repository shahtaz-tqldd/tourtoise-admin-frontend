import React, { useEffect, useMemo, useRef } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingInput } from "@/components/ui/input";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import { FloatingTextarea } from "@/components/ui/textarea";
import { Text, Title } from "@/components/ui/typography";
import {
  useAttractionDetailQuery,
  useCreateAttractionMutation,
  useUpdateAttractionMutation,
} from "@/features/destination/destinationApiSlice";

const attractionTypes = [
  "natural_site",
  "temple",
  "museum",
  "landmark",
  "market",
  "park",
  "viewpoint",
  "historic_site",
];
const budgetTiers = ["budget", "mid", "mid_range", "premium", "luxury"];
const timeOfDayOptions = ["morning", "afternoon", "evening", "night", "anytime"];

const defaultValues = {
  name: "",
  attraction_type: "",
  description: "",
  how_to_reach: "",
  latitude: "",
  longitude: "",
  address: "",
  cover_image: "",
  budget_tier: "",
  avg_duration_hours: "",
  best_time_of_day: "",
  picking_reason_list: [{ value: "" }],
  tip_list: [{ value: "" }],
  tag_ids: [{ value: "" }],
  initial_tag_ids: [],
  removed_tag_ids: [],
  entrance_fee_required: false,
  approx_entrance_fee: "",
  sort_order: "",
  is_featured: false,
  attraction_images: null,
  existing_attraction_images: [],
  removed_attraction_images: [],
};

const scalarFields = [
  "name",
  "attraction_type",
  "description",
  "how_to_reach",
  "latitude",
  "longitude",
  "address",
  "cover_image",
  "budget_tier",
  "avg_duration_hours",
  "best_time_of_day",
  "entrance_fee_required",
  "approx_entrance_fee",
  "sort_order",
  "is_featured",
];

function appendValue(formData, key, value) {
  if (value === "" || value === null || value === undefined) return;
  formData.append(key, value);
}

function normalizeList(values) {
  return (values || [])
    .map((item) => (typeof item === "string" ? item : item?.value))
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];

  return images
    .map((image) => ({
      id: image.id,
      image_url: image.image_url || image.url || "",
      caption: image.caption || "",
      sort_order: image.sort_order || "",
    }))
    .filter((image) => image.id || image.image_url);
}

function mapAttractionToForm(attraction) {
  const tagIds = (attraction.tags || attraction.tag_ids || [])
    .map((tag) => (typeof tag === "string" ? tag : tag?.id || tag?.uuid))
    .filter(Boolean);

  return {
    ...defaultValues,
    ...scalarFields.reduce((values, field) => {
      values[field] = attraction[field] ?? defaultValues[field];
      return values;
    }, {}),
    picking_reason_list: (attraction.picking_reason_list?.length
      ? attraction.picking_reason_list
      : [""]
    ).map((value) => ({ value })),
    tip_list: (attraction.tip_list?.length ? attraction.tip_list : [""]).map(
      (value) => ({ value }),
    ),
    tag_ids: (tagIds.length ? tagIds : [""]).map((value) => ({ value })),
    initial_tag_ids: tagIds,
    existing_attraction_images: normalizeImages(attraction.images),
    attraction_images: null,
    removed_tag_ids: [],
    removed_attraction_images: [],
  };
}

function getCreatePayload(data) {
  const formData = new FormData();

  scalarFields.forEach((field) => appendValue(formData, field, data[field]));
  formData.append(
    "picking_reason_list",
    JSON.stringify(normalizeList(data.picking_reason_list)),
  );
  formData.append("tip_list", JSON.stringify(normalizeList(data.tip_list)));

  normalizeList(data.tag_ids).forEach((tagId) => {
    formData.append("tag_ids", tagId);
  });

  Array.from(data.attraction_images || []).forEach((file) => {
    formData.append("attraction_images", file);
  });

  return formData;
}

function getChangedPayload(data, dirtyFields) {
  const formData = new FormData();

  scalarFields.forEach((field) => {
    if (dirtyFields[field]) formData.append(field, data[field] ?? "");
  });

  if (dirtyFields.picking_reason_list) {
    formData.append(
      "picking_reason_list",
      JSON.stringify(normalizeList(data.picking_reason_list)),
    );
  }

  if (dirtyFields.tip_list) {
    formData.append("tip_list", JSON.stringify(normalizeList(data.tip_list)));
  }

  if (dirtyFields.tag_ids) {
    const initialTagIds = new Set(data.initial_tag_ids || []);
    const addedTagIds = normalizeList(data.tag_ids).filter(
      (tagId) => !initialTagIds.has(tagId),
    );

    addedTagIds.forEach((tagId) => {
      formData.append("tag_ids", tagId);
    });
  }

  if (data.removed_tag_ids?.length) {
    formData.append("removed_tag_ids", JSON.stringify(data.removed_tag_ids));
  }

  if (dirtyFields.attraction_images) {
    Array.from(data.attraction_images || []).forEach((file) => {
      formData.append("attraction_images", file);
    });
  }

  if (data.removed_attraction_images?.length) {
    formData.append(
      "removed_attraction_images",
      JSON.stringify(data.removed_attraction_images),
    );
  }

  return formData;
}

function hasFormDataEntries(formData) {
  return !formData.entries().next().done;
}

function SelectField({ control, name, label, options, error, rules }) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <div>
          <FloatingSelect
            label={label}
            placeholder={`Select ${label.toLowerCase()}`}
            value={field.value ? String(field.value) : ""}
            displayValue={String(field.value || "").replaceAll("_", " ")}
            onValueChange={field.onChange}
          >
            {options.map((option) => (
              <SelectItem key={option} value={option} className="capitalize">
                {option.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </FloatingSelect>
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
        <label className="flex cursor-pointer select-none items-center gap-3 text-sm text-slate-700">
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

function ListFields({ title, fields, control, name, append, remove, placeholder }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ value: "" })}
        >
          <Plus size={15} />
          Add
        </Button>
      </div>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Controller
              name={`${name}.${index}.value`}
              control={control}
              render={({ field }) => (
                <FloatingInput {...field} label={placeholder} />
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-[54px] w-[54px]"
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

function TagFields({ control, fields, append, remove, setValue, getValues, isUpdateMode }) {
  const removeTag = (index) => {
    const tagId = getValues(`tag_ids.${index}.value`);
    if (isUpdateMode && tagId) {
      const currentRemoved = getValues("removed_tag_ids") || [];
      setValue("removed_tag_ids", [...new Set([...currentRemoved, tagId])], {
        shouldDirty: true,
      });
    }
    remove(index);
  };

  return (
    <ListFields
      title="Tag UUIDs"
      fields={fields}
      control={control}
      name="tag_ids"
      append={append}
      remove={removeTag}
      placeholder="Tag UUID"
    />
  );
}

function AttractionImages({ control, setValue }) {
  const inputRef = useRef(null);
  const files = useWatch({ control, name: "attraction_images" });
  const existingImages = useWatch({ control, name: "existing_attraction_images" }) || [];
  const removedImageIds = useWatch({ control, name: "removed_attraction_images" }) || [];
  const previews = useFilePreviews(files);
  const selectedFiles = Array.from(files || []);

  const addImages = (event) => {
    const nextFiles = [...selectedFiles, ...Array.from(event.target.files || [])];
    setValue("attraction_images", nextFiles.length ? nextFiles : null, {
      shouldDirty: true,
    });
    event.target.value = "";
  };

  const removeSelectedImage = (index) => {
    const nextFiles = selectedFiles.filter((_, itemIndex) => itemIndex !== index);
    setValue("attraction_images", nextFiles.length ? nextFiles : null, {
      shouldDirty: true,
    });
  };

  const removeExistingImage = (index) => {
    const image = existingImages[index];
    const nextImages = existingImages.filter((_, itemIndex) => itemIndex !== index);
    const nextRemovedIds = image?.id
      ? [...new Set([...removedImageIds, image.id])]
      : removedImageIds;

    setValue("existing_attraction_images", nextImages, { shouldDirty: true });
    setValue("removed_attraction_images", nextRemovedIds, {
      shouldDirty: true,
    });
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Attraction Images</p>
          <Text variant="sm">Upload one or more gallery images.</Text>
        </div>
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          <ImagePlus size={16} />
          Add Images
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {existingImages.map((image, index) => (
          <div
            key={image.id || image.image_url}
            className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white"
          >
            <img
              src={image.image_url}
              alt={image.caption || "Attraction image"}
              className="h-full w-full object-cover"
            />
            <span className="absolute left-1.5 top-1.5 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-medium text-slate-600 shadow-sm">
              Existing
            </span>
            <button
              type="button"
              onClick={() => removeExistingImage(index)}
              className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-white/95 text-slate-700 opacity-0 shadow-sm transition hover:text-red-600 group-hover:opacity-100"
              aria-label="Remove existing image"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {previews.map((preview, index) => (
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
              onClick={() => removeSelectedImage(index)}
              className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-white/95 text-slate-700 opacity-0 shadow-sm transition hover:text-red-600 group-hover:opacity-100"
              aria-label="Remove selected image"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={addImages}
      />
    </section>
  );
}

const UpsertAttractionPage = () => {
  const navigate = useNavigate();
  const { destination_id, attraction_id } = useParams();
  const isUpdateMode = Boolean(attraction_id);

  const { data: detailData, isFetching: isDetailFetching } =
    useAttractionDetailQuery(
      { destination_id, attraction_id },
      { skip: !isUpdateMode },
    );
  const [createAttraction, { isLoading: isCreateLoading }] =
    useCreateAttractionMutation();
  const [updateAttraction, { isLoading: isUpdateLoading }] =
    useUpdateAttractionMutation();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { dirtyFields, errors },
  } = useForm({ defaultValues });

  const pickingReasons = useFieldArray({ control, name: "picking_reason_list" });
  const tips = useFieldArray({ control, name: "tip_list" });
  const tags = useFieldArray({ control, name: "tag_ids" });

  useEffect(() => {
    const attraction = detailData?.data || detailData;
    if (isUpdateMode && attraction) {
      reset(mapAttractionToForm(attraction));
    }
  }, [detailData, isUpdateMode, reset]);

  const isSaving = isCreateLoading || isUpdateLoading;

  const onSubmit = async (data) => {
    try {
      const formData = isUpdateMode
        ? getChangedPayload(data, dirtyFields)
        : getCreatePayload(data);

      if (isUpdateMode) {
        if (!hasFormDataEntries(formData)) {
          toast.info("No changes to update");
          return;
        }

        await updateAttraction({
          destination_id,
          attraction_id,
          formData,
        }).unwrap();
        toast.success("Attraction updated successfully");
      } else {
        await createAttraction({ destination_id, formData }).unwrap();
        toast.success("Attraction created successfully");
      }

      navigate(`/destinations/${destination_id}/attractions`);
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error?.[0] ||
        error?.data?.detail ||
        "Attraction could not be saved";
      toast.error(message);
    }
  };

  if (isUpdateMode && isDetailFetching) {
    return (
      <div className="center min-h-[420px] text-primary">
        <Loader2 className="mr-2 animate-spin" size={22} />
        Loading attraction...
      </div>
    );
  }

  return (
    <section className="min-w-0 space-y-6">
      <div className="flbx gap-4">
        <div className="flx gap-2">
          <Link
            to={`/destinations/${destination_id}/attractions`}
            className="center h-10 w-10 rounded-full bg-primary/5 text-slate-900 transition hover:bg-primary/10"
          >
            <ChevronLeft size={16} />
          </Link>
          <Title variant="lg">
            {isUpdateMode ? "Update Attraction" : "Create Attraction"}
          </Title>
        </div>

        <Button type="submit" form="attraction-form" disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {isUpdateMode ? "Update" : "Create"}
        </Button>
      </div>

      <form id="attraction-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6">
            <Title variant="xs">Basic Information</Title>
            <Text variant="sm" className="mt-1">
              Core attraction details and planning data.
            </Text>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Controller
              name="name"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FloatingInput
                  {...field}
                  label="Name"
                  error={errors.name?.message}
                  className="lg:col-span-2"
                />
              )}
            />
            <SelectField
              control={control}
              name="attraction_type"
              label="Type"
              options={attractionTypes}
              rules={{ required: "Type is required" }}
              error={errors.attraction_type?.message}
            />
            <Controller
              name="description"
              control={control}
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <FloatingTextarea
                  {...field}
                  label="Description"
                  error={errors.description?.message}
                  className="lg:col-span-3"
                />
              )}
            />
            <Controller
              name="how_to_reach"
              control={control}
              render={({ field }) => (
                <FloatingTextarea {...field} label="How To Reach" className="lg:col-span-3" />
              )}
            />
            <Controller
              name="address"
              control={control}
              render={({ field }) => <FloatingInput {...field} label="Address" />}
            />
            <Controller
              name="latitude"
              control={control}
              render={({ field }) => (
                <FloatingInput {...field} type="number" step="any" label="Latitude" />
              )}
            />
            <Controller
              name="longitude"
              control={control}
              render={({ field }) => (
                <FloatingInput {...field} type="number" step="any" label="Longitude" />
              )}
            />
            <Controller
              name="cover_image"
              control={control}
              render={({ field }) => (
                <FloatingInput {...field} label="Cover Image URL" className="lg:col-span-3" />
              )}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6">
            <Title variant="xs">Visit Settings</Title>
            <Text variant="sm" className="mt-1">
              Budget, duration, timing, and fee information.
            </Text>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <SelectField
              control={control}
              name="budget_tier"
              label="Budget"
              options={budgetTiers}
            />
            <Controller
              name="avg_duration_hours"
              control={control}
              render={({ field }) => (
                <FloatingInput {...field} type="number" step="any" label="Duration Hours" />
              )}
            />
            <SelectField
              control={control}
              name="best_time_of_day"
              label="Best Time"
              options={timeOfDayOptions}
            />
            <Controller
              name="approx_entrance_fee"
              control={control}
              render={({ field }) => <FloatingInput {...field} label="Approx Entrance Fee" />}
            />
            <Controller
              name="sort_order"
              control={control}
              render={({ field }) => (
                <FloatingInput {...field} type="number" step="1" label="Sort Order" />
              )}
            />
            <div className="flex min-h-[54px] flex-wrap items-center gap-6 rounded-xl border border-slate-200 px-4">
              <CheckboxField
                control={control}
                name="entrance_fee_required"
                label="Entrance fee required"
              />
              <CheckboxField control={control} name="is_featured" label="Featured" />
            </div>
          </div>
        </section>

        <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 lg:grid-cols-2">
          <ListFields
            title="Picking Reasons"
            fields={pickingReasons.fields}
            control={control}
            name="picking_reason_list"
            append={pickingReasons.append}
            remove={pickingReasons.remove}
            placeholder="Reason"
          />
          <ListFields
            title="Tips"
            fields={tips.fields}
            control={control}
            name="tip_list"
            append={tips.append}
            remove={tips.remove}
            placeholder="Tip"
          />
        </section>

        <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <TagFields
            control={control}
            fields={tags.fields}
            append={tags.append}
            remove={tags.remove}
            setValue={setValue}
            getValues={getValues}
            isUpdateMode={isUpdateMode}
          />
          <AttractionImages control={control} setValue={setValue} />
        </section>
      </form>
    </section>
  );
};

export default UpsertAttractionPage;
