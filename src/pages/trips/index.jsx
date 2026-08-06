import { useEffect, useState } from "react";
import moment from "moment";
import { Search, X } from "lucide-react";

import ReusableTable from "@/components/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableProfile } from "@/components/ui/table";
import { Title } from "@/components/ui/typography";
import { useTripListQuery } from "@/features/trips/tripApiSlice";
import { COUNTRY_LIST } from "@/lib/countries";
import StatusBadge from "@/components/ui/status";

const tripColumns = [
  { header: "Trip", accessorKey: "trip" },
  { header: "Traveler", accessorKey: "traveler" },
  { header: "Schedule", accessorKey: "schedule" },
  { header: "Status", accessorKey: "status_display" },
  { header: "Planning", accessorKey: "planning_usage" },
  { header: "Trip chat", accessorKey: "chat_usage" },
  { header: "Created At", accessorKey: "created_at" },
];

const formatCost = (value) => {
  const cost = Number(value);

  if (!Number.isFinite(cost)) return "$0.0000";
  return `$${cost.toFixed(4)}`;
};

const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatDate = (value, format = "MMM D, YYYY") =>
  value && moment(value).isValid() ? moment(value).format(format) : "Not set";

const getTripDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null;

  const start = moment(startDate).startOf("day");
  const end = moment(endDate).startOf("day");
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) return null;

  return end.diff(start, "days") + 1;
};

const TripListPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [country, setCountry] = useState("all");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data: tripData, isLoading } = useTripListQuery({
    page,
    page_size: pageSize,
    search_query: searchQuery,
    country: country === "all" ? "" : country,
  });

  const trips =
    tripData?.data?.map((trip) => {
      const status = String(trip.status || "unknown").toLowerCase();
      const duration = getTripDuration(trip.start_date, trip.end_date);

      return {
        ...trip,
        trip: (
          <div className="min-w-[170px]">
            <p className="font-semibold text-slate-800">
              {trip.title || "Untitled trip"}
            </p>
            <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
              {trip.primary_destination?.name || "Destination not set"}
              {trip.primary_destination?.country
                ? ` · ${trip.primary_destination.country}`
                : ""}
              {trip.primary_destination?.region &&
              trip.primary_destination.region !== trip.primary_destination.name
                ? `, ${trip.primary_destination.region}`
                : ""}
            </p>
          </div>
        ),
        traveler: (
          <TableProfile
            className="min-w-[210px]"
            name={trip.user?.name || "Unknown traveler"}
            email={trip.user?.email || "No email address"}
            profile_img_url={trip.user?.avatar_url}
          />
        ),
        schedule: (
          <div className="min-w-[150px]">
            <p className="font-medium text-slate-700">
              {formatDate(trip.start_date)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              to {formatDate(trip.end_date)}
              {duration
                ? ` · ${duration} ${duration === 1 ? "day" : "days"}`
                : ""}
            </p>
          </div>
        ),
        status_display: <StatusBadge status={status} />,
        planning_usage: (
          <div className="min-w-[120px]">
            <p className="font-semibold tabular-nums text-slate-700">
              {formatCost(trip.planning?.cost)}
            </p>
            <p className="mt-1 text-xs tabular-nums text-slate-500">
              {formatNumber(trip.planning?.tokens)} tokens
            </p>
          </div>
        ),
        chat_usage: (
          <div className="min-w-[145px]">
            <p className="font-medium text-slate-700">
              {formatNumber(trip.trip_chat?.total_message)} messages
            </p>
            <p className="mt-1 text-xs tabular-nums text-slate-500">
              {formatCost(trip.trip_chat?.cost)} ·{" "}
              {formatNumber(trip.trip_chat?.tokens)} tokens
            </p>
          </div>
        ),
        created_at: formatDate(trip.created_at),
      };
    }) || [];

  const totalItems = tripData?.meta?.total || tripData?.meta?.count || 0;

  return (
    <section className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title variant="lg">Created Trips</Title>
          <p className="mt-1 text-sm text-slate-500">
            Review trip schedules, traveler details, and AI usage
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
              placeholder="Search trips or travelers..."
              aria-label="Search trips"
              className="!h-11 rounded-xl border-slate-200 bg-slate-50 pl-9 pr-9 shadow-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setPage(1);
                }}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select
            value={country}
            onValueChange={(value) => {
              setCountry(value);
              setPage(1);
            }}
          >
            <SelectTrigger
              className="!h-11 w-full rounded-xl border-slate-200 bg-slate-50 px-3 shadow-none sm:w-[180px]"
              aria-label="Filter trips by country"
            >
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent
              align="end"
              className="max-h-72 rounded-xl border-slate-200"
            >
              <SelectItem value="all">All countries</SelectItem>
              {COUNTRY_LIST.map((item) => (
                <SelectItem key={item.name} value={item.name}>
                  <span className="mr-1" aria-hidden="true">
                    {item.flag}
                  </span>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ReusableTable
        data={trips}
        columns={tripColumns}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalItems={totalItems}
        className="mt-4"
      />
    </section>
  );
};

export default TripListPage;
