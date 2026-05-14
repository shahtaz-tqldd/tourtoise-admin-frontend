import ReusableTable from "@/components/table";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/status";
import { TableProfile } from "@/components/ui/table";
import { Title } from "@/components/ui/typography";
import {
  useDeleteDestinationMutation,
  useDestinationListQuery,
} from "@/features/destination/destinationApiSlice";
import { Plus } from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DestinationsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const destinationColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Country", accessorKey: "country" },
    { header: "Type", accessorKey: "destination_type" },
    { header: "Budget", accessorKey: "budget_tier" },
    { header: "Tags", accessorKey: "tags" },
    { header: "Best Time", accessorKey: "best_time" },
    { header: "Status", accessorKey: "status" },
    { header: "Updated", accessorKey: "updated_at" },
    { header: "Action", accessorKey: "action" },
  ];

  const { data: destinationData, isLoading } = useDestinationListQuery({
    page: page,
    page_size: pageSize,
  });

  const [deleteDestination, { isLoading: deleteLoading }] =
    useDeleteDestinationMutation();

  const handleDeleteDestination = async (dest_id) => {
    try {
      await deleteDestination(dest_id).unwrap();
      toast.success("Destination deleted successfully");
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error?.[0] ||
        "Destination could not be deleted";
      toast.error(message);
    }
  };

  const handleView = (dest_id) => {
    navigate(`/destinations/${dest_id}`);
  };

  const handleUpdate = (dest_id) => {
    navigate(`/destinations/update/${dest_id}`);
  };

  const table_options = [
    {
      label: "View",
      action: handleView,
    },
    {
      label: "Update",
      action: handleUpdate,
    },
    {
      label: "Delete",
      type: "delete",
    },
  ];

  const destinations =
    destinationData?.data?.map((item) => ({
      ...item,
      name: (
        <TableProfile
          name={item.name}
          email={item.slug || item.tagline || "No slug"}
          profile_img_url={item.cover_image}
          non_rounded
        />
      ),
      destination_type: (
        <span className="capitalize">
          {item.destination_type?.replaceAll("_", " ") || "N/A"}
        </span>
      ),
      budget_tier: (
        <span className="capitalize">
          {item.budget_tier?.replaceAll("_", " ") || "N/A"}
        </span>
      ),
      best_time: item.best_travel_months?.length
        ? item.best_travel_months
            .map((month) => monthLabels[Number(month) - 1])
            .filter(Boolean)
            .join(", ")
        : "N/A",
      status: <StatusBadge status={item.status || "draft"} />,
      updated_at: item.updated_at
        ? moment(item.updated_at).format("MMM D, YYYY")
        : "N/A",
      tags: (
        <div className="flex max-w-[220px] flex-wrap gap-1">
          {item.tags?.length ? (
            item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id || tag.slug || tag.name}
                className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-xs capitalize text-primary"
              >
                {tag.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">No tags</span>
          )}
          {item.tags?.length > 3 && (
            <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              +{item.tags.length - 3}
            </span>
          )}
        </div>
      ),
    })) || [];
  const total_item =
    destinationData?.meta?.count || destinationData?.meta?.total || 0;

  return (
    <section className="space-y-8">
      <div className="flbx">
        <Title variant="lg">Destinations</Title>
        <Link to="/destinations/new-destination">
          <Button>
            <div className="flx gap-2">
              <Plus size={16} />
              New Destination
            </div>
          </Button>
        </Link>
      </div>

      <ReusableTable
        data={destinations}
        columns={destinationColumns}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalItems={total_item}
        table_options={table_options}
        onDeleteConfirm={handleDeleteDestination}
        deleteLoading={deleteLoading}
        className="mt-4"
      />
    </section>
  );
};

export default DestinationsPage;
