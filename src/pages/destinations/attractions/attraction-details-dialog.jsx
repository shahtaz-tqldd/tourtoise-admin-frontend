import React from "react";
import {
  Clock,
  DollarSign,
  ImageIcon,
  MapPin,
  Navigation,
  Star,
  Tag,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Text, Title } from "@/components/ui/typography";

const formatLabel = (value) => (value ? String(value).replaceAll("_", " ") : "N/A");

const formatDuration = (hours) => {
  if (!hours) return "N/A";

  const days = Math.floor(Number(hours) / 24);
  const remainingHours = Number(hours) % 24;

  if (!days) return `${hours} hr`;
  if (!remainingHours) return `${days} day${days > 1 ? "s" : ""}`;

  return `${days} day${days > 1 ? "s" : ""} ${remainingHours} hr`;
};

const getTagLabel = (tag) => {
  if (typeof tag === "string") return tag;
  return tag?.name || tag?.slug || tag?.id || "";
};

const DetailPill = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-semibold capitalize text-slate-800 shadow-sm">
    {children}
  </span>
);

function InfoItem({ icon: Icon, label, value }) {
  if (value === "" || value === null || value === undefined) return null;

  return (
    <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
      {React.createElement(Icon, {
        size: 16,
        className: "mt-0.5 shrink-0 text-primary",
      })}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
        <p className="mt-0.5 break-words capitalize text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function TextList({ title, items }) {
  const visibleItems = (items || []).filter(Boolean);
  if (!visibleItems.length) return null;

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-800">{title}</p>
      <ul className="space-y-2">
        {visibleItems.map((item, index) => (
          <li
            key={`${title}-${index}`}
            className="rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

const AttractionDetailsDialog = ({ open, onOpenChange, attraction }) => {
  const images = attraction?.images || [];
  const tags = (attraction?.tags || []).map(getTagLabel).filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-hidden rounded-3xl border-none p-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">
          {attraction?.name || "Attraction details"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {attraction?.description || "Attraction details"}
        </DialogDescription>

        {attraction && (
          <div className="custom-scrollbar max-h-[88vh] overflow-y-auto bg-white">
            <div className="relative aspect-[16/8] min-h-[240px] bg-slate-100">
              {attraction.cover_image ? (
                <img
                  src={attraction.cover_image}
                  alt={attraction.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="center h-full w-full text-slate-400">
                  <ImageIcon size={42} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <DetailPill>{formatLabel(attraction.attraction_type)}</DetailPill>
                {attraction.is_featured && (
                  <DetailPill>
                    <Star size={12} className="mr-1 inline-block fill-current" />
                    Featured
                  </DetailPill>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-xs font-semibold uppercase text-white/70">
                  Attraction
                </p>
                <h2 className="mt-1 text-2xl font-bold leading-tight">
                  {attraction.name}
                </h2>
                {attraction.address && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-white/85">
                    <MapPin size={15} />
                    {attraction.address}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6 p-5">
              {attraction.description && (
                <p className="text-sm leading-6 text-slate-650">
                  {attraction.description}
                </p>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                <InfoItem
                  icon={DollarSign}
                  label="Budget"
                  value={formatLabel(attraction.budget_tier)}
                />
                <InfoItem
                  icon={Clock}
                  label="Duration"
                  value={formatDuration(attraction.avg_duration_hours)}
                />
                <InfoItem
                  icon={Clock}
                  label="Best Time"
                  value={formatLabel(attraction.best_time_of_day)}
                />
                <InfoItem
                  icon={DollarSign}
                  label="Entrance Fee"
                  value={
                    attraction.entrance_fee_required
                      ? attraction.approx_entrance_fee || "Required"
                      : "Free"
                  }
                />
                <InfoItem
                  icon={Navigation}
                  label="Coordinates"
                  value={
                    attraction.latitude && attraction.longitude
                      ? `${attraction.latitude}, ${attraction.longitude}`
                      : ""
                  }
                />
                <InfoItem
                  icon={Tag}
                  label="Sort Order"
                  value={attraction.sort_order}
                />
              </div>

              {attraction.how_to_reach && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <Title variant="xs">How To Reach</Title>
                  <Text variant="sm" className="mt-2 leading-6">
                    {attraction.how_to_reach}
                  </Text>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <TextList
                  title="Picking Reasons"
                  items={attraction.picking_reason_list}
                />
                <TextList title="Tips" items={attraction.tip_list} />
              </div>

              {tags.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {images.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-800">
                    Images
                  </p>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {images.map((image) => (
                      <div
                        key={image.id || image.image_url}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <div className="aspect-square bg-slate-100">
                          <img
                            src={image.image_url}
                            alt={image.caption || attraction.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        {image.caption && (
                          <p className="truncate px-3 py-2 text-xs text-slate-600">
                            {image.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AttractionDetailsDialog;
