import React, { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Plus,
  Trash2,
  Upload,
  X,
  Info,
  MapPin,
  Calendar,
  Utensils,
  Hotel,
  Car,
  Camera,
  Palmtree,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Text, Title } from "@/components/ui/typography";
import {
  useAccomodationTypeListQuery,
  useActivityTypeListQuery,
  useCreateNewDestinationMutation,
  useTransportTypeListQuery,
  useUploadDestinationImagesMutation,
} from "@/features/destination/destinationApiSlice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AddDestinationPage = () => {
  const navigate = useNavigate();
  const [destinationImages, setDestinationImages] = useState([]);
  const { register, control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      description: "",
      tags: "",
      best_time: "",
      cost_level: "",
      avg_duration: "",
      suitable_for: "",
      popular_for: "",
      country: "",
      region: "",
      longitude: "",
      latitude: "",
      timezone: "UTC",
      weather: "",
      peak_season: "",
      festivals: "",
      languages: "",
      payment_methods: "",
      safety_tips: "",
      customs: "",
      how_to_reach: "",
      accommodation_types: [],
      transport_options: [],
      activities: [],
      signature_dishes: [],
      accommodations: [],
      attractions: [],
    },
  });

  const {
    fields: transportFields,
    append: addTransport,
    remove: removeTransport,
  } = useFieldArray({ control, name: "transport_options" });

  const {
    fields: activityFields,
    append: addActivity,
    remove: removeActivity,
  } = useFieldArray({ control, name: "activities" });

  const {
    fields: dishFields,
    append: addDish,
    remove: removeDish,
  } = useFieldArray({ control, name: "signature_dishes" });

  const {
    fields: accommodationTypeFields,
    append: addAccommodationType,
    remove: removeAccommodationType,
  } = useFieldArray({ control, name: "accommodation_types" });

  const {
    fields: accommodationFields,
    append: addAccommodation,
    remove: removeAccommodation,
  } = useFieldArray({ control, name: "accommodations" });

  const {
    fields: attractionFields,
    append: addAttraction,
    remove: removeAttraction,
  } = useFieldArray({ control, name: "attractions" });

  const {
    data: accommodationTypesData,
    isLoading: accommodationTypeListLoading,
  } = useAccomodationTypeListQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const accommodationTypeOptions = accommodationTypesData?.data || [];

  const { data: transportTypesData, isLoading: transportTypeListLoading } =
    useTransportTypeListQuery(undefined, {
      refetchOnMountOrArgChange: false,
    });

  const transportTypeOptions = transportTypesData?.data || [];

  const { data: activityTypesData, isLoading: activityTypeListLoading } =
    useActivityTypeListQuery(undefined, {
      refetchOnMountOrArgChange: false,
    });

  const activityTypeOptions = activityTypesData?.data || [];

  const [createNewDestination, { isLoading: destinationCreateLoading }] =
    useCreateNewDestinationMutation();

  const [
    uploadDestinationImages,
    { isLoading: destinationImageUploadLoading },
  ] = useUploadDestinationImagesMutation();

  const onSubmit = async (data) => {
    const destinationData = {
      ...data,
      tags: data.tags.split(",").map((tag) => tag.trim()),
      suitable_for: data.suitable_for.split(",").map((tag) => tag.trim()),
      popular_for: data.popular_for.split(",").map((tag) => tag.trim()),
      languages: data.languages.split(",").map((tag) => tag.trim()),
      payment_methods: data.payment_methods.split(",").map((tag) => tag.trim()),
      images: undefined,
      attractions: data.attractions.map((attr) => ({
        ...attr,
        available_transports: attr.available_transports
          .split(",")
          .map((t) => t.trim()),
        image_file: undefined,
        image_url: undefined,
      })),
    };

    const createResponse = await createNewDestination(destinationData);

    if (!createResponse?.data?.success) {
      toast.error("Failed to create destination");
      return;
    }

    const destinationId = createResponse?.data?.data?.id;
    const attractions = createResponse?.data?.data?.attractions || [];

    const formData = new FormData();

    destinationImages.forEach((img) => {
      formData.append("type", "destination");
      formData.append("file", img.file);
      formData.append("destination_id", destinationId);
      formData.append("alt_text", img.alt_text ?? "");
    });

    /* ---------- Attraction images ---------- */
    data.attractions.forEach((attr) => {
      const createdAttraction = attractions.find((a) => a.name === attr.name);

      if (!createdAttraction || !attr.image_file) return;

      formData.append("type", "attraction");
      formData.append("file", attr.image_file);
      formData.append("attraction_id", createdAttraction.id);
      formData.append("alt_text", attr.alt_text ?? "");
    });

    const imageResponse = await uploadDestinationImages(formData);

    if (imageResponse?.data?.success) {
      toast.success("Destination Created Successfully!");
    } else {
      toast.error("Failed to upload destination images");
    }

    navigate(`/destinations`);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      file, // keep the File object
      preview: URL.createObjectURL(file),
      altText: "",
    }));
    setDestinationImages([...destinationImages, ...previews]);
  };

  const handleAttractionImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      setValue(`attractions.${index}.image_file`, file); // store the actual File
      setValue(`attractions.${index}.image_url`, URL.createObjectURL(file)); // for preview only
    }
  };

  const removeImage = (index) => {
    setDestinationImages(destinationImages.filter((_, i) => i !== index));
  };

  const removeAttractionImage = (index) => {
    setValue(`attractions.${index}.image_url`, "");
    setValue(`attractions.${index}.image_file`, null);
  };

  return (
    <div className="">
      <div className="flex justify-between items-start mb-8">
        <div>
          <Title variant="lg">Add New Destination</Title>
          <Text className="mt-2">
            Create a comprehensive travel destination listing
          </Text>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download size={18} />
          Import Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Basic Information</h2>
              </div>
              <p className="text-sm text-gray-500">
                Essential destination details
              </p>
            </CardHeader>

            <div className="space-y-4">
              <div>
                <Label>Destination Name *</Label>
                <Input
                  placeholder="e.g., Cox's Bazar"
                  className="mt-1.5"
                  {...register("name", { required: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country *</Label>
                  <Input
                    placeholder="e.g., Bangladesh"
                    className="mt-1.5"
                    {...register("country", { required: true })}
                  />
                </div>
                <div>
                  <Label>Region *</Label>
                  <Input
                    placeholder="e.g., Chittagong Division"
                    className="mt-1.5"
                    {...register("region", { required: true })}
                  />
                </div>
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  rows={5}
                  placeholder="Provide a captivating description of the destination..."
                  className="mt-1.5"
                  {...register("description", { required: true })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="0.0000001"
                    placeholder="21.4272"
                    className="mt-1.5"
                    {...register("latitude")}
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="0.0000001"
                    placeholder="92.0058"
                    className="mt-1.5"
                    {...register("longitude")}
                  />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Input
                    placeholder="Asia/Dhaka"
                    className="mt-1.5"
                    {...register("timezone")}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Destination Images</h2>
              </div>
              <p className="text-sm text-gray-500">
                Upload high-quality images
              </p>
            </CardHeader>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/75 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="destination-images"
                onChange={handleImageUpload}
              />
              <label htmlFor="destination-images" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  Upload destination images
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG or WEBP (max. 5MB each)
                </p>
              </label>
            </div>

            {destinationImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {destinationImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Destination ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Attractions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md flex items-center justify-center bg-primary/10">
                    <Palmtree className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Attractions</h2>
                    <p className="text-sm text-gray-500">
                      Add tourist spots with details
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    addAttraction({
                      name: "",
                      description: "",
                      image_url: "",
                      image_file: null,
                      tag: "",
                      entry_fee: "",
                      opening_hours: "",
                      best_time_to_visit: "",
                      available_transports: "",
                      is_recommended: false,
                      region: "",
                      longitude: "",
                      latitude: "",
                    })
                  }
                >
                  <Plus size={14} /> Attraction
                </Button>
              </div>
            </CardHeader>

            <div className="space-y-4">
              {attractionFields.map((field, index) => {
                const image_url = watch(`attractions.${index}.image_url`);

                return (
                  <div
                    key={field.id}
                    className="p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Attraction #{index + 1}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttraction(index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`attractions.${index}.name`}>
                          Name *
                        </Label>
                        <Input
                          id={`attractions.${index}.name`}
                          placeholder="Attraction name"
                          {...register(`attractions.${index}.name`, {
                            required: true,
                          })}
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`attractions.${index}.region`}>
                          Region *
                        </Label>
                        <Input
                          id={`attractions.${index}.region`}
                          placeholder="e.g., Northern, Southern"
                          {...register(`attractions.${index}.region`, {
                            required: true,
                          })}
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`attractions.${index}.tag`}>Tag</Label>
                        <Controller
                          control={control}
                          name={`attractions.${index}.tag`}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="mt-1.5 w-full">
                                <SelectValue placeholder="Select Tag" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Nature">Nature</SelectItem>
                                <SelectItem value="Historic">
                                  Historic
                                </SelectItem>
                                <SelectItem value="Culture">Culture</SelectItem>
                                <SelectItem value="Adventure">
                                  Adventure
                                </SelectItem>
                                <SelectItem value="Photo Spot">
                                  Photo Spot
                                </SelectItem>
                                <SelectItem value="Religious">
                                  Religious
                                </SelectItem>
                                <SelectItem value="Beach">Beach</SelectItem>
                                <SelectItem value="Shopping">
                                  Shopping
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`attractions.${index}.entry_fee`}>
                          Entry Fee
                        </Label>
                        <Input
                          id={`attractions.${index}.entry_fee`}
                          placeholder="e.g., 100 BDT or Free"
                          {...register(`attractions.${index}.entry_fee`)}
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`attractions.${index}.opening_hours`}>
                          Opening Hours
                        </Label>
                        <Input
                          id={`attractions.${index}.opening_hours`}
                          placeholder="e.g., 9:00 AM - 5:00 PM"
                          {...register(`attractions.${index}.opening_hours`)}
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor={`attractions.${index}.best_time_to_visit`}
                        >
                          Best Time to Visit
                        </Label>
                        <Input
                          id={`attractions.${index}.best_time_to_visit`}
                          placeholder="e.g., Winter (Nov-Feb)"
                          {...register(
                            `attractions.${index}.best_time_to_visit`
                          )}
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`attractions.${index}.longitude`}>
                          Longitude
                        </Label>
                        <Input
                          id={`attractions.${index}.longitude`}
                          type="number"
                          step="0.0000001"
                          placeholder="e.g., 90.4125"
                          {...register(`attractions.${index}.longitude`)}
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`attractions.${index}.latitude`}>
                          Latitude
                        </Label>
                        <Input
                          id={`attractions.${index}.latitude`}
                          type="number"
                          step="0.0000001"
                          placeholder="e.g., 23.8103"
                          {...register(`attractions.${index}.latitude`)}
                          className="mt-1.5"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor={`attractions.${index}.description`}>
                          Description
                        </Label>
                        <Textarea
                          id={`attractions.${index}.description`}
                          placeholder="Describe the attraction..."
                          {...register(`attractions.${index}.description`)}
                          className="mt-1.5"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label
                          htmlFor={`attractions.${index}.available_transports`}
                        >
                          Available Transports (comma-separated)
                        </Label>
                        <Input
                          id={`attractions.${index}.available_transports`}
                          placeholder="e.g., Bus, Car, Boat"
                          {...register(
                            `attractions.${index}.available_transports`
                          )}
                          className="mt-1.5"
                        />
                      </div>

                      <div className="md:col-span-2 max-w-xs">
                        <Label>Attraction Image</Label>
                        <div className="mt-1.5">
                          {image_url ? (
                            <div className="relative group">
                              <img
                                src={image_url}
                                alt="Attraction preview"
                                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeAttractionImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/75 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id={`attraction-image-${index}`}
                                onChange={(e) =>
                                  handleAttractionImageUpload(e, index)
                                }
                              />
                              <label
                                htmlFor={`attraction-image-${index}`}
                                className="cursor-pointer"
                              >
                                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">
                                  Upload attraction image
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  PNG, JPG or WEBP (max. 5MB)
                                </p>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Controller
                          control={control}
                          name={`attractions.${index}.is_recommended`}
                          render={({ field }) => (
                            <Checkbox
                              id={`is_recommended_${index}`}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label
                          htmlFor={`is_recommended_${index}`}
                          className="cursor-pointer"
                        >
                          Recommended
                        </Label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Accommodation Types */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md flex items-center justify-center bg-primary/10">
                    <Hotel className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      Accommodation Types
                    </h2>
                    <p className="text-sm text-gray-500">
                      Categories of accommodations available
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    addAccommodationType({
                      accommodation_type_id: "",
                      price_range: "",
                      availability: "",
                      description: "",
                    })
                  }
                >
                  <Plus size={14} /> Type
                </Button>
              </div>
            </CardHeader>

            <div className="space-y-3">
              {accommodationTypeFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 bg-gray-50 rounded-lg border space-y-3"
                >
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Label>Accommodation Type *</Label>
                      <Controller
                        control={control}
                        name={`accommodation_types.${index}.accommodation_type_id`}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="mt-1.5 w-full">
                              <SelectValue placeholder="Select Accommodation Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {accommodationTypeListLoading ? (
                                <div className="h-16 w-full center">
                                  <span className="spinner"></span>
                                </div>
                              ) : (
                                accommodationTypeOptions?.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="flex-1">
                      <Label>Price Range *</Label>
                      <Input
                        placeholder="e.g., 1,500 - 8,000 BDT"
                        {...register(
                          `accommodation_types.${index}.price_range`,
                          {
                            required: true,
                          }
                        )}
                        className="mt-1.5"
                      />
                    </div>

                    <div className="flex-1">
                      <Label>Availability</Label>
                      <Input
                        placeholder="e.g., Year-round, Seasonal"
                        {...register(
                          `accommodation_types.${index}.availability`
                        )}
                        className="mt-1.5"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAccommodationType(index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div>
                    <Textarea
                      placeholder="Additional notes about this accommodation type..."
                      {...register(`accommodation_types.${index}.description`)}
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Accommodations */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md flex items-center justify-center bg-primary/10">
                    <Hotel className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Accommodations</h2>
                    <p className="text-sm text-gray-500">
                      Individual properties with contact details
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    addAccommodation({
                      name: "",
                      accommodation_type_id: "",
                      price_range: "",
                      rating: "",
                      distance: "",
                      region: "",
                      longitude: "",
                      latitude: "",
                      phone: "",
                      email: "",
                      website: "",
                    })
                  }
                >
                  <Plus size={14} /> Accommodation
                </Button>
              </div>
            </CardHeader>

            <div className="space-y-3">
              {accommodationFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Accommodation #{index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAccommodation(index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name *</Label>
                      <Input
                        placeholder="Property name"
                        {...register(`accommodations.${index}.name`, {
                          required: true,
                        })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Accommodation Type *</Label>
                      <Controller
                        control={control}
                        name={`accommodations.${index}.accommodation_type_id`}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="mt-1.5 w-full">
                              <SelectValue placeholder="Select Accommodation Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {accommodationTypeListLoading ? (
                                <div className="h-16 w-full center">
                                  <span className="spinner"></span>
                                </div>
                              ) : (
                                accommodationTypeOptions?.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div>
                      <Label>Price Range *</Label>
                      <Input
                        placeholder="e.g., 2,000 - 5,000 BDT/night"
                        {...register(`accommodations.${index}.price_range`, {
                          required: true,
                        })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Rating</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="9.99"
                        placeholder="0.00 - 9.99"
                        {...register(`accommodations.${index}.rating`)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Distance</Label>
                      <Input
                        placeholder="e.g., 5 km from city center"
                        {...register(`accommodations.${index}.distance`)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Region *</Label>
                      <Input
                        placeholder="e.g., Downtown, Beachfront"
                        {...register(`accommodations.${index}.region`, {
                          required: true,
                        })}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Phone</Label>
                      <Input
                        placeholder="+8801234567890"
                        {...register(`accommodations.${index}.phone`)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="contact@property.com"
                        {...register(`accommodations.${index}.email`)}
                        className="mt-1.5"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Website</Label>
                      <Input
                        placeholder="https://www.property.com"
                        {...register(`accommodations.${index}.website`)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Longitude</Label>
                      <Input
                        type="number"
                        step="0.0000001"
                        placeholder="e.g., 90.4125"
                        {...register(`accommodations.${index}.longitude`)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Latitude</Label>
                      <Input
                        type="number"
                        step="0.0000001"
                        placeholder="e.g., 23.8103"
                        {...register(`accommodations.${index}.latitude`)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Transport Options */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 flex items-center justify-center rounded-md bg-primary/10">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      Transportation Options
                    </h2>
                    <p className="text-sm text-gray-500">
                      Available transport types
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    addTransport({
                      transport_type_id: "",
                      price_range: "",
                      availability: "",
                      description: "",
                    })
                  }
                >
                  <Plus size={14} /> Transport
                </Button>
              </div>
            </CardHeader>

            <div className="space-y-3">
              {transportFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 bg-gray-50 rounded-lg border space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label>Transport Type *</Label>
                      <Controller
                        control={control}
                        name={`transport_options.${index}.transport_type_id`}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="mt-1.5 w-full">
                              <SelectValue placeholder="Select Transport Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {transportTypeListLoading ? (
                                <div className="h-16 w-full center">
                                  <span className="spinner"></span>
                                </div>
                              ) : (
                                transportTypeOptions?.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Price Range *</Label>
                      <Input
                        placeholder="e.g., 100 - 300 BDT"
                        {...register(`transport_options.${index}.price_range`, {
                          required: true,
                        })}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Availability</Label>
                      <Input
                        placeholder="e.g., 24/7, 6 AM - 10 PM"
                        {...register(`transport_options.${index}.availability`)}
                        className="mt-1.5"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTransport(index)}
                      className="text-red-600 hover:bg-red-50 mt-6"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div>
                    <Textarea
                      placeholder="Additional notes (local tips, booking info, etc.)"
                      {...register(`transport_options.${index}.description`)}
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Activities */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">Activities</h2>
                  <p className="text-sm text-gray-500">
                    Things to do at destination
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    addActivity({
                      activity_type_id: "",
                      price_range: "",
                      duration: "",
                      best_season: "",
                      booking_required: false,
                      is_popular: false,
                      description: "",
                    })
                  }
                >
                  <Plus size={14} /> Activity
                </Button>
              </div>
            </CardHeader>

            <div className="space-y-4">
              {activityFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 bg-gray-50 rounded-lg border space-y-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Activity #{index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeActivity(index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex-1">
                      <Label>Activity Type *</Label>
                      <Controller
                        control={control}
                        name={`activities.${index}.activity_type_id`}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="mt-1.5 w-full">
                              <SelectValue placeholder="Select Activity Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {activityTypeListLoading ? (
                                <div className="h-16 w-full center">
                                  <span className="spinner"></span>
                                </div>
                              ) : (
                                activityTypeOptions?.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div>
                      <Label>Price Range</Label>
                      <Input
                        placeholder="e.g., 500 - 1,500 BDT"
                        {...register(`activities.${index}.price_range`)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        placeholder="e.g., 2-3 hours"
                        {...register(`activities.${index}.duration`)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Best Season</Label>
                      <Input
                        placeholder="e.g., November to March"
                        {...register(`activities.${index}.best_season`)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Destination-specific details about this activity..."
                      {...register(`activities.${index}.description`)}
                      className="min-h-[60px] mt-1.5"
                    />
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Controller
                        control={control}
                        name={`activities.${index}.booking_required`}
                        render={({ field }) => (
                          <Checkbox
                            id={`booking_required_${index}`}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label
                        htmlFor={`booking_required_${index}`}
                        className="cursor-pointer"
                      >
                        Booking Required
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Controller
                        control={control}
                        name={`activities.${index}.is_popular`}
                        render={({ field }) => (
                          <Checkbox
                            id={`is_popular_${index}`}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label
                        htmlFor={`is_popular_${index}`}
                        className="cursor-pointer"
                      >
                        Popular Activity
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Signature Dishes */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-md flex items-center justify-center bg-primary/10">
                    <Utensils className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Signature Dishes</h2>
                    <p className="text-sm text-gray-500">
                      Local food specialties
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    addDish({
                      name: "",
                      tags: "",
                      dietary_info: "",
                      price_range: "",
                      is_recommended: false,
                      local_notes: "",
                    })
                  }
                  variant="outline"
                >
                  <Plus size={14} /> Dish
                </Button>
              </div>
            </CardHeader>

            <div className="space-y-3">
              {dishFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 bg-gray-50 rounded-lg border space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label>Dish Name *</Label>
                      <Input
                        placeholder="e.g., Hilsa Curry"
                        {...register(`signature_dishes.${index}.name`, {
                          required: true,
                        })}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Price Range</Label>
                      <Input
                        placeholder="e.g., 200-500 BDT"
                        {...register(`signature_dishes.${index}.price_range`)}
                        className="mt-1.5"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDish(index)}
                      className="text-red-600 hover:bg-red-50 mt-6"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Tags (comma-separated)</Label>
                      <Input
                        placeholder="e.g., spicy, traditional, seafood"
                        {...register(`signature_dishes.${index}.tags`)}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Dietary Information</Label>
                      <Controller
                        control={control}
                        name={`signature_dishes.${index}.dietary_info`}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full mt-1.5">
                              <SelectValue placeholder="Select dietary info" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Halal">Halal</SelectItem>
                              <SelectItem value="Vegetarian">
                                Vegetarian
                              </SelectItem>
                              <SelectItem value="Vegan">Vegan</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Local Notes</Label>
                    <Textarea
                      placeholder="Special preparation, serving style, or where to find it..."
                      {...register(`signature_dishes.${index}.local_notes`)}
                      className="min-h-[60px] mt-1.5"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      control={control}
                      name={`signature_dishes.${index}.is_recommended`}
                      render={({ field }) => (
                        <Checkbox
                          id={`dish_recommended_${index}`}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label
                      htmlFor={`dish_recommended_${index}`}
                      className="cursor-pointer"
                    >
                      Recommended
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Categorization */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Categorization</h2>
            </CardHeader>

            <div className="space-y-4">
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  placeholder="e.g., beach, nature, adventure"
                  className="mt-1.5"
                  {...register("tags")}
                />
              </div>

              <div>
                <Label>Suitable For (comma-separated)</Label>
                <Input
                  placeholder="e.g., families, couples, solo travelers"
                  className="mt-1.5"
                  {...register("suitable_for")}
                />
              </div>

              <div>
                <Label>Popular For (comma-separated)</Label>
                <Input
                  placeholder="e.g., beaches, seafood, sunsets"
                  className="mt-1.5"
                  {...register("popular_for")}
                />
              </div>
            </div>
          </Card>

          {/* Travel Planning */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Travel Planning</h2>
              </div>
            </CardHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Best Time to Visit</Label>
                  <Input
                    placeholder="e.g., November to March"
                    className="mt-1.5"
                    {...register("best_time")}
                  />
                </div>
                <div>
                  <Label>Peak Season</Label>
                  <Input
                    placeholder="e.g., December to February"
                    className="mt-1.5"
                    {...register("peak_season")}
                  />
                </div>
                <div>
                  <Label>Average Duration</Label>
                  <Input
                    placeholder="e.g., 2-3 days"
                    className="mt-1.5"
                    {...register("avg_duration")}
                  />
                </div>
                <Controller
                  control={control}
                  name="cost_level"
                  render={({ field }) => (
                    <div>
                      <Label>Cost Level *</Label>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="mt-1.5 w-full">
                          <SelectValue placeholder="Select cost level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
              </div>

              <div>
                <Label>Weather Information</Label>
                <Textarea
                  rows={3}
                  placeholder="Describe typical weather conditions..."
                  className="mt-1.5"
                  {...register("weather")}
                />
              </div>

              <div>
                <Label>Festivals & Events</Label>
                <Textarea
                  rows={3}
                  placeholder="List major festivals and events..."
                  className="mt-1.5"
                  {...register("festivals")}
                />
              </div>
            </div>
          </Card>

          {/* Practical Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Practical Information</h2>
              </div>
            </CardHeader>

            <div className="space-y-4">
              <div>
                <Label>How to Reach</Label>
                <Textarea
                  rows={3}
                  placeholder="Describe transportation options to reach the destination..."
                  className="mt-1.5"
                  {...register("how_to_reach")}
                />
              </div>

              <div>
                <Label>Languages (comma-separated)</Label>
                <Input
                  placeholder="e.g., Bengali, English"
                  className="mt-1.5"
                  {...register("languages")}
                />
              </div>

              <div>
                <Label>Payment Methods (comma-separated)</Label>
                <Input
                  placeholder="e.g., Cash, Credit Card, Mobile Banking"
                  className="mt-1.5"
                  {...register("payment_methods")}
                />
              </div>

              <div>
                <Label>Safety Tips</Label>
                <Textarea
                  rows={3}
                  placeholder="Provide safety recommendations for travelers..."
                  className="mt-1.5"
                  {...register("safety_tips")}
                />
              </div>

              <div>
                <Label>Local Customs & Etiquette</Label>
                <Textarea
                  rows={3}
                  placeholder="Describe local customs and cultural considerations..."
                  className="mt-1.5"
                  {...register("customs")}
                />
              </div>
            </div>
          </Card>

          {/* Status */}
          <Card className="!bg-primary/5 border-primary/10">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-primary mb-1">
                  Publishing Status
                </p>
                <p className="text-primary/75">
                  Destination will be saved as draft. You can activate it later
                  from the destinations list.
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Quick Statistics</h2>
            </CardHeader>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Attractions</span>
                <span className="font-semibold">{attractionFields.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Accommodation Types</span>
                <span className="font-semibold">
                  {accommodationTypeFields.length}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Specific Accommodations</span>
                <span className="font-semibold">
                  {accommodationFields.length}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Transport Options</span>
                <span className="font-semibold">{transportFields.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Activities</span>
                <span className="font-semibold">{activityFields.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Signature Dishes</span>
                <span className="font-semibold">{dishFields.length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Destination Images</span>
                <span className="font-semibold">
                  {destinationImages.length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Submit Footer */}
      <div className="sticky bottom-0 bg-white border-t translate-y-8 -mx-8 px-8 py-5 shadow-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Button variant="outline">Cancel</Button>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg">
              Save as Draft
            </Button>
            <Button onClick={handleSubmit(onSubmit)} size="lg" className="w-44">
              {destinationCreateLoading || destinationImageUploadLoading ? (
                <span className="spinner spinner-white"></span>
              ) : (
                "Publish Destination"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="mb-6 pb-4 border-b border-gray-100">{children}</div>
);

export default AddDestinationPage;
