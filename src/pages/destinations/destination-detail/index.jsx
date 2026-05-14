import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/status";
import { Text, Title } from "@/components/ui/typography";
import { useDestinationDetailQuery } from "@/features/destination/destinationApiSlice";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function DetailItem({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value || "N/A"}</p>
    </div>
  );
}

const DestinationDetailPage = () => {
  const { destination_id } = useParams();
  const { data, isFetching } = useDestinationDetailQuery(destination_id);
  const destination = data?.data || data;

  if (isFetching) {
    return (
      <div className="center min-h-[420px] text-primary">
        <Loader2 className="mr-2 animate-spin" size={22} />
        Loading destination...
      </div>
    );
  }

  if (!destination) {
    return (
      <section className="space-y-4">
        <Link to="/destinations" className="inline-flex items-center gap-2 text-sm text-primary">
          <ArrowLeft size={16} />
          Destinations
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <Title variant="md">Destination not found</Title>
          <Text variant="sm" className="mt-1">
            The selected destination could not be loaded.
          </Text>
        </div>
      </section>
    );
  }

  const bestTime = destination.best_travel_months?.length
    ? destination.best_travel_months
        .map((month) => monthLabels[Number(month) - 1])
        .filter(Boolean)
        .join(", ")
    : "N/A";

  return (
    <section className="space-y-6">
      <div className="flbx gap-4">
        <div>
          <Link to="/destinations" className="mb-3 inline-flex items-center gap-2 text-sm text-primary">
            <ArrowLeft size={16} />
            Destinations
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Title variant="lg">{destination.name}</Title>
            <StatusBadge status={destination.status || "draft"} />
          </div>
          <Text variant="sm" className="mt-1">
            {destination.tagline || destination.slug}
          </Text>
        </div>
        <Link to={`/destinations/update/${destination.id}`}>
          <Button>Edit Destination</Button>
        </Link>
      </div>

      {destination.cover_image && (
        <div className="aspect-[21/7] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <img src={destination.cover_image} alt={destination.name} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Country" value={destination.country} />
        <DetailItem label="Region" value={destination.region} />
        <DetailItem label="Type" value={destination.destination_type?.replaceAll("_", " ")} />
        <DetailItem label="Best Time" value={bestTime} />
        <DetailItem label="Budget" value={destination.budget_tier?.replaceAll("_", " ")} />
        <DetailItem label="Difficulty" value={destination.difficulty} />
        <DetailItem label="Data Source" value={destination.data_source} />
        <DetailItem label="Country Code" value={destination.country_code} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <Title variant="xs">Overview</Title>
        <Text variant="sm" className="mt-2">
          {destination.overview || "No overview available yet."}
        </Text>
      </div>
    </section>
  );
};

export default DestinationDetailPage;
