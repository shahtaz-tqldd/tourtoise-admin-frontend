import { useRef, useState } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useFilePreviews } from "@/lib/file-preview";
import { getCloudinaryPreviewUrl } from "@/lib/image";
import { cn } from "@/lib/utils";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ConfigImageInput = ({
  control,
  setValue,
  name,
  currentImageName,
  title,
  description,
  square = false,
  className = "",
}) => {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const files = useWatch({ control, name });
  const currentImage = useWatch({ control, name: currentImageName });
  const previews = useFilePreviews(files);
  const activeImage =
    previews[0]?.url || getCloudinaryPreviewUrl(currentImage, 700);
  const selectedFile = files?.[0];

  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose a valid image file");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image must be smaller than 5 MB");
      return;
    }

    setError("");
    setValue(name, [file], { shouldDirty: true, shouldTouch: true });
    event.target.value = "";
  };

  const undoSelection = () => {
    setError("");
    setValue(name, null, { shouldDirty: true, shouldTouch: true });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        </div>
        {selectedFile && (
          <button
            type="button"
            onClick={undoSelection}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            Undo
          </button>
        )}
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50",
          square ? "aspect-square max-w-52" : "aspect-[16/7]",
          activeImage && "border-solid border-slate-200 bg-white",
          className,
        )}
      >
        {activeImage ? (
          <>
            <img
              src={activeImage}
              alt={`${title} preview`}
              className={cn(
                "h-full w-full",
                square ? "object-contain p-5" : "object-contain p-6",
              )}
            />
            <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-slate-950/30 via-transparent to-transparent p-3 opacity-0 transition hover:opacity-100 focus-within:opacity-100">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
              >
                <ImagePlus /> Replace
              </Button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center px-5 text-center text-slate-500 transition hover:bg-emerald-50 hover:text-primary"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Upload className="h-5 w-5" />
            </span>
            <span className="mt-3 text-sm font-bold text-slate-700">
              Choose image
            </span>
            <span className="mt-1 text-xs text-slate-400">
              PNG, JPG or WEBP · max 5 MB
            </span>
          </button>
        )}
      </div>

      {selectedFile && (
        <p className="mt-2 truncate text-xs font-medium text-primary">
          New: {selectedFile.name}
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/x-icon"
        onChange={selectImage}
        className="sr-only"
      />
    </div>
  );
};

export default ConfigImageInput;
