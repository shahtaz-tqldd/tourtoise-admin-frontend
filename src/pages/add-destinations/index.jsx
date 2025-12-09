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
  Globe,
  Calendar,
  DollarSign,
  Users,
  Utensils,
  Hotel,
  Car,
  Camera,
} from "lucide-react";
import { Title } from "@/components/ui/typography";

const AddDestinationPage = () => {
  const [destinationImages, setDestinationImages] = useState([]);

  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      description: "",
      tags: "",
      bestTime: "",
      costLevel: "",
      avgDuration: "",
      suitableFor: "",
      popularFor: "",
      country: "",
      region: "",
      longitude: "",
      latitude: "",
      timezone: "UTC",
      weather: "",
      peakSeason: "",
      festivals: "",
      languages: "",
      paymentMethods: "",
      safetyTips: "",
      customs: "",
      howToReach: "",
      accommodationTypes: [],
      transportOptions: [],
      activities: [],
      signatureDishes: [],
      accommodations: [],
      attractions: [],
      restaurants: [],
    },
  });

  const {
    fields: accommodationTypeFields,
    append: addAccommodationType,
    remove: removeAccommodationType,
  } = useFieldArray({ control, name: "accommodationTypes" });
  const {
    fields: transportFields,
    append: addTransport,
    remove: removeTransport,
  } = useFieldArray({ control, name: "transportOptions" });
  const {
    fields: activityFields,
    append: addActivity,
    remove: removeActivity,
  } = useFieldArray({ control, name: "activities" });
  const {
    fields: dishFields,
    append: addDish,
    remove: removeDish,
  } = useFieldArray({ control, name: "signatureDishes" });
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
    fields: restaurantFields,
    append: addRestaurant,
    remove: removeRestaurant,
  } = useFieldArray({ control, name: "restaurants" });

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      images: destinationImages,
      tags: data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      suitableFor: data.suitableFor
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      popularFor: data.popularFor
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      languages: data.languages
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      paymentMethods: data.paymentMethods
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    console.log("Destination Data:", finalData);
    alert("Destination saved successfully! Check console for data.");
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      altText: "",
    }));
    setDestinationImages([...destinationImages, ...previews]);
  };

  const removeImage = (index) => {
    setDestinationImages(destinationImages.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <Title variant="lg">Add New Destination</Title>
          <p className="mt-2 text-gray-600">
            Create a comprehensive travel destination listing
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download size={18} />
          Import Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
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
                  placeholder="Provide a captivating description of the destination, highlighting its unique features..."
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
                <Camera className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Destination Images</h2>
              </div>
              <p className="text-sm text-gray-500">
                Upload high-quality images
              </p>
            </CardHeader>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
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

          {/* Travel Planning */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Travel Planning</h2>
              </div>
            </CardHeader>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Best Time to Visit</Label>
                <Input
                  placeholder="e.g., November to March"
                  className="mt-1.5"
                  {...register("bestTime")}
                />
              </div>
              <div>
                <Label>Peak Season</Label>
                <Input
                  placeholder="e.g., December to February"
                  className="mt-1.5"
                  {...register("peakSeason")}
                />
              </div>
              <div>
                <Label>Average Duration</Label>
                <Input
                  placeholder="e.g., 2-3 days"
                  className="mt-1.5"
                  {...register("avgDuration")}
                />
              </div>
              <Controller
                control={control}
                name="costLevel"
                render={({ field }) => (
                  <div>
                    <Label>Cost Level *</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
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

            <div className="mt-4">
              <Label>Weather Information</Label>
              <Textarea
                rows={3}
                placeholder="Describe the typical weather conditions..."
                className="mt-1.5"
                {...register("weather")}
              />
            </div>

            <div className="mt-4">
              <Label>Festivals & Events</Label>
              <Textarea
                rows={3}
                placeholder="List major festivals and events..."
                className="mt-1.5"
                {...register("festivals")}
              />
            </div>
          </Card>

          {/* Accommodation Types */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-blue-600" />
                  <div>
                    <h2 className="text-lg font-semibold">
                      Accommodation Types
                    </h2>
                    <p className="text-sm text-gray-500">
                      Available accommodation categories
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    addAccommodationType({
                      name: "",
                      priceRange: "",
                      description: "",
                    })
                  }
                >
                  <Plus size={16} className="mr-1" /> Add Type
                </Button>
              </div>
            </CardHeader>

            <div className="space-y-3">
              {accommodationTypeFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-3 p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex-1">
                    <Input
                      placeholder="Type (e.g., Hotels)"
                      {...register(`accommodationTypes.${index}.name`)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Price Range (e.g., 1,500 - 8,000 BDT)"
                      {...register(`accommodationTypes.${index}.priceRange`)}
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
              ))}
            </div>
          </Card>

          {/* Transport Options */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-600" />
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
                  onClick={() =>
                    addTransport({ name: "", priceRange: "", availability: "" })
                  }
                >
                  <Plus size={16} className="mr-1" /> Add Transport
                </Button>
              </div>
            </CardHeader>

            <div className="space-y-3">
              {transportFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-3 p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex-1">
                    <Input
                      placeholder="Type (e.g., CNG/Auto-rickshaw)"
                      {...register(`transportOptions.${index}.name`)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Price Range (e.g., 100 - 300 BDT)"
                      {...register(`transportOptions.${index}.priceRange`)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Availability (e.g., 24/7)"
                      {...register(`transportOptions.${index}.availability`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTransport(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
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
                  <p className="text-sm text-gray-500">Things to do</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    addActivity({
                      name: "",
                      priceRange: "",
                      duration: "",
                      difficulty: "",
                    })
                  }
                >
                  <Plus size={16} className="mr-1" /> Add Activity
                </Button>
              </div>
            </CardHeader>

            <div className="space-y-4">
              {activityFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 bg-gray-50 rounded-lg border space-y-3"
                >
                  <div className="flex gap-3">
                    <Input
                      placeholder="Activity Name (e.g., Surfing)"
                      className="flex-1"
                      {...register(`activities.${index}.name`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeActivity(index)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      placeholder="Price Range"
                      {...register(`activities.${index}.priceRange`)}
                    />
                    <Input
                      placeholder="Duration"
                      {...register(`activities.${index}.duration`)}
                    />
                    <Input
                      placeholder="Difficulty"
                      {...register(`activities.${index}.difficulty`)}
                    />
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
                  <Utensils className="w-5 h-5 text-blue-600" />
                  <div>
                    <h2 className="text-lg font-semibold">Signature Dishes</h2>
                    <p className="text-sm text-gray-500">Local specialties</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    addDish({ name: "", priceRange: "", description: "" })
                  }
                >
                  <Plus size={16} className="mr-1" /> Add Dish
                </Button>
              </div>
            </CardHeader>

            <div className="space-y-3">
              {dishFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-3 p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex-1">
                    <Input
                      placeholder="Dish Name (e.g., Hilsa Curry)"
                      {...register(`signatureDishes.${index}.name`)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Price Range (e.g., 200-500 BDT)"
                      {...register(`signatureDishes.${index}.priceRange`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDish(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Practical Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
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
                  {...register("howToReach")}
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
                  {...register("paymentMethods")}
                />
              </div>

              <div>
                <Label>Safety Tips</Label>
                <Textarea
                  rows={3}
                  placeholder="Provide safety recommendations for travelers..."
                  className="mt-1.5"
                  {...register("safetyTips")}
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
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
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
                  {...register("suitableFor")}
                />
              </div>

              <div>
                <Label>Popular For (comma-separated)</Label>
                <Input
                  placeholder="e.g., beaches, seafood, sunsets"
                  className="mt-1.5"
                  {...register("popularFor")}
                />
              </div>
            </div>
          </Card>

          {/* Status */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">
                  Publishing Status
                </p>
                <p className="text-blue-700">
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
                <span className="text-gray-600">Accommodation Types</span>
                <span className="font-semibold">
                  {accommodationTypeFields.length}
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
                <span className="text-gray-600">Images</span>
                <span className="font-semibold">
                  {destinationImages.length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Submit Footer */}
      <div className="sticky bottom-0 bg-white border-t translate-y-8 py-5 -mx-8">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Button variant="outline">Cancel</Button>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg">
              Save as Draft
            </Button>
            <Button onClick={handleSubmit(onSubmit)} size="lg" className="px-8">
              Publish Destination
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
