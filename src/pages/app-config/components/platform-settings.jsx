import { useWatch } from "react-hook-form";
import {
  BellRing,
  Bot,
  Coins,
  Megaphone,
  Settings2,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import Card from "@/components/ui/card";
import { FloatingInput } from "@/components/ui/input";
import { FloatingTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ConfigImageInput from "./config-image-input";
import ConfigSectionHeading from "./config-section-heading";
import ToggleField from "./toggle-field";

const optionalEmail = {
  validate: (value) =>
    !value ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
    "Enter a valid email address",
};

const PlatformSettings = ({ control, register, setValue, errors }) => {
  const announcementEnabled = useWatch({
    control,
    name: "announcement.notify_banner_enabled",
  });

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-5 gap-5">
        <div className="md:col-span-3 space-y-5">
          <Card>
            <ConfigSectionHeading
              icon={Sparkles}
              title="Branding"
              description="Set the identity and contact details shown across the platform."
            />
            <div className="grid gap-5 md:grid-cols-2">
              <FloatingInput
                label="Application title"
                error={errors.branding?.title?.message}
                {...register("branding.title", {
                  required: "Application title is required",
                })}
              />
              <FloatingInput
                type="email"
                label="Support email"
                error={errors.branding?.support_email?.message}
                {...register("branding.support_email", optionalEmail)}
              />
            </div>
            <div className="mt-6 flex gap-5">
              <ConfigImageInput
                control={control}
                setValue={setValue}
                name="uploads.logo"
                currentImageName="branding.logo"
                title="Application logo"
                square
                className="max-w-48"
              />
              <ConfigImageInput
                control={control}
                setValue={setValue}
                name="uploads.favicon"
                currentImageName="branding.favicon"
                title="Favicon"
                square
                className="max-w-36"
              />
            </div>
          </Card>
          <Card>
            <ConfigSectionHeading
              icon={Settings2}
              title="Feature controls"
              description="Turn core platform capabilities on or off for all travelers."
            />
            <div className="grid md:grid-cols-2 gap-4">
              <ToggleField
                control={control}
                name="feature.is_vectorize_enabled"
                title="AI vectorization"
                description="Enable semantic indexing and AI-powered discovery."
                icon={Bot}
              />
              <ToggleField
                control={control}
                name="feature.maintenance_mode"
                title="Maintenance mode"
                description="Temporarily restrict traveler access to the platform."
                icon={TriangleAlert}
                danger
              />
            </div>
          </Card>
        </div>
        <div className="md:col-span-2 space-y-5">
          <Card>
            <ConfigSectionHeading
              icon={Megaphone}
              title="Announcement banner"
              description="Share a timely notice or call to action across the traveler experience."
            />

            <div
              className={cn(
                "mt-5 flex flex-col gap-4",
                !announcementEnabled && "opacity-55",
              )}
            >
              <ToggleField
                control={control}
                name="announcement.notify_banner_enabled"
                title="Show announcement banner"
                description="Display the message below to everyone using the platform."
                icon={BellRing}
              />
              <FloatingInput
                label="Action URL"
                disabled={!announcementEnabled}
                {...register("announcement.notify_banner_url")}
              />
              <FloatingTextarea
                label="Banner message"
                rows={3}
                maxLength={500}
                disabled={!announcementEnabled}
                textareaClassName="min-h-24"
                {...register("announcement.notify_banner_text")}
              />
            </div>
          </Card>
          <Card>
            <ConfigSectionHeading
              icon={Coins}
              title="Credit defaults"
              description="Define the free allowance for new and existing traveler accounts."
            />
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <FloatingInput
                  type="number"
                  min="0"
                  step="1"
                  label="New user credits"
                  error={errors.platform_default?.default_free_credits?.message}
                  {...register("platform_default.default_free_credits", {
                    required: "New user credits are required",
                    min: { value: 0, message: "Credits cannot be negative" },
                  })}
                />
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Granted once when a traveler creates an account.
                </p>
              </div>
              <div>
                <FloatingInput
                  type="number"
                  min="0"
                  step="1"
                  label="Monthly free credits"
                  error={errors.platform_default?.monthly_free_credits?.message}
                  {...register("platform_default.monthly_free_credits", {
                    required: "Monthly credits are required",
                    min: { value: 0, message: "Credits cannot be negative" },
                  })}
                />
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Refreshed for eligible travelers each month.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;
