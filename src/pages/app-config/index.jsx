import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Check,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import TabMenu from "@/components/ui/tab";
import { Title } from "@/components/ui/typography";
import {
  useAppConfigQuery,
  useUpdateAppConfigMutation,
} from "@/features/app-config/appConfigApiSlice";
import ConfigLoadingState from "./components/config-loading-state";
import DocumentSettings from "./components/document-settings";
import PlatformSettings from "./components/platform-settings";
import SeoSettings from "./components/seo-settings";
import {
  buildConfigFormData,
  DEFAULT_VALUES,
  formatDate,
  getErrorMessage,
  normalizeConfig,
  PAGE_TABS,
} from "./constants";

const AppConfigPage = () => {
  const [activeTab, setActiveTab] = useState("platform");
  const {
    data: appConfig,
    isLoading: isConfigLoading,
    isFetching: isConfigFetching,
    isError,
    refetch,
  } = useAppConfigQuery({});
  const [updateAppConfig, { isLoading: isUpdating }] =
    useUpdateAppConfigMutation();

  const config = appConfig?.data ?? appConfig;
  const normalizedConfig = useMemo(() => normalizeConfig(config), [config]);
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (config) reset(normalizedConfig);
  }, [config, normalizedConfig, reset]);

  const onSubmit = async (values) => {
    try {
      const response = await updateAppConfig({
        payload: buildConfigFormData(values),
      }).unwrap();

      reset(normalizeConfig(response?.data ?? config));
      toast.success("Configuration saved", {
        description: "Your platform settings are now up to date.",
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isConfigLoading) return <ConfigLoadingState />;

  if (isError && !config) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <TriangleAlert className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-lg font-bold text-slate-900">
            Couldn’t load configuration
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Check your connection and try loading the platform settings again.
          </p>
          <Button className="mt-5" onClick={refetch}>
            <RefreshCw /> Try again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <section className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Title variant="lg">App configuration</Title>
            {isConfigFetching && (
              <LoaderCircle
                className="h-4 w-4 animate-spin text-primary"
                aria-label="Refreshing"
              />
            )}
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Control your platform identity, public content, feature access, and
            search presence.
          </p>
        </div>

        <div className="rounded-2xl border border-primary/30 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
            <ShieldCheck className="size-3.5" /> Last saved
          </div>
          <p className="mt-1 ml-5 text-xs text-slate-500">
            {formatDate(config?.audit?.updated_at)}
          </p>
        </div>
      </div>

      <TabMenu
        tabs={PAGE_TABS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scrollable
        className="sticky -top-8 z-20 -mx-8 bg-gray-50 px-8 pt-2"
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        {activeTab === "platform" && (
          <PlatformSettings
            control={control}
            register={register}
            setValue={setValue}
            errors={errors}
          />
        )}
        {activeTab === "documents" && (
          <DocumentSettings control={control} register={register} />
        )}
        {activeTab === "seo" && (
          <SeoSettings control={control} register={register} />
        )}

        <div className="fixed bottom-4 left-[256px] right-4 rounded-b-2xl z-30 border-t border-slate-200 bg-white/90 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="hidden items-center gap-2 text-sm sm:flex">
              {isDirty ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="font-semibold text-slate-700">
                    You have unsaved changes
                  </span>
                </>
              ) : (
                <>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-slate-500">All changes saved</span>
                </>
              )}
            </div>
            <div className="ml-auto flex gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={!isDirty || isUpdating}
                onClick={() => reset(normalizedConfig)}
              >
                <RotateCcw /> Reset
              </Button>
              <Button
                type="submit"
                disabled={!isDirty || isUpdating}
                className="rounded-full"
              >
                {isUpdating ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Save />
                )}
                {isUpdating ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default AppConfigPage;
