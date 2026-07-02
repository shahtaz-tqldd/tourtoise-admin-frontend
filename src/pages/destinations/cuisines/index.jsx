import ReusableTable from "@/components/table";
import { TableProfile } from "@/components/ui/table";
import {
  useBulkCuisineUploadMutation,
  useCuisineListQuery,
  useDeleteCuisineMutation,
  useDownloadCuisineTemplateQuery,
} from "@/features/destination/destinationApiSlice";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import CuisineDetailsDialog from "./cuisine-details-dialog";
import DestinationContentActions from "../components/destination-content-actions";
import DestinationContentHeader from "../components/destination-content-header";

const formatLabel = (value) => (value ? value.replaceAll("_", " ") : "N/A");

const formatDuration = (hours) => {
  if (!hours) return "N/A";

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (!days) return `${hours} hr`;
  if (!remainingHours) return `${days} day${days > 1 ? "s" : ""}`;

  return `${days} day${days > 1 ? "s" : ""} ${remainingHours} hr`;
};

const CuisineListPage = () => {
  const navigate = useNavigate();
  const { destination_id } = useParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloadRequested, setDownloadRequested] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const cuisineColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Type", accessorKey: "cuisine_type" },
    { header: "Budget", accessorKey: "budget_tier" },
    { header: "Duration", accessorKey: "avg_duration_hours" },
    { header: "Best Time", accessorKey: "best_time_of_day" },
    { header: "Featured", accessorKey: "is_featured" },
    { header: "Action", accessorKey: "action" },
  ];

  const { data: cuisineData, isLoading } = useCuisineListQuery({
    destination_id,
    page: page,
    page_size: pageSize,
  });
  const [deleteCuisine, { isLoading: deleteLoading }] =
    useDeleteCuisineMutation();
  const {
    data: templateData,
    isFetching: templateDownloading,
    error: templateError,
    refetch: refetchTemplate,
  } = useDownloadCuisineTemplateQuery(
    { destination_id },
    { skip: !downloadRequested },
  );
  const [bulkUpload, { isLoading: bulkUploading }] =
    useBulkCuisineUploadMutation();

  const handleUpdate = (cuisineId) => {
    navigate(`/destinations/${destination_id}/cuisines/update/${cuisineId}`);
  };

  const handleView = (_, item) => {
    setSelectedCuisine(item.raw_cuisine || item);
    setDetailsOpen(true);
  };

  const handleDelete = async (cuisineId) => {
    try {
      await deleteCuisine({
        destination_id,
        cuisine_id: cuisineId,
      }).unwrap();
      toast.success("Cuisine deleted successfully");
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error?.[0] ||
        error?.data?.detail ||
        "Cuisine could not be deleted";
      toast.error(message);
    }
  };

  const tableOptions = [
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

  const cuisines =
    cuisineData?.data?.map((item) => ({
      ...item,
      raw_cuisine: item,
      name: (
        <TableProfile
          name={item.name}
          email={item.address || item.slug || "No address"}
          profile_img_url={item.cover_image}
          non_rounded
        />
      ),
      cuisine_type: (
        <span className="capitalize">{formatLabel(item.cuisine_type)}</span>
      ),
      budget_tier: (
        <span className="capitalize">{formatLabel(item.budget_tier)}</span>
      ),
      avg_duration_hours: formatDuration(item.avg_duration_hours),
      best_time_of_day: (
        <span className="capitalize">{formatLabel(item.best_time_of_day)}</span>
      ),
      is_featured: item.is_featured ? "Yes" : "No",
    })) || [];
  const total_item = cuisineData?.meta?.count || cuisineData?.meta?.total || 0;

  return (
    <section className="space-y-8">
      <DestinationContentHeader
        destinationId={destination_id}
        title="Cuisines"
        action={
          <DestinationContentActions
            label="Cuisine"
            addPath={`/destinations/${destination_id}/cuisines/new-cuisine`}
            templateKey="cuisines"
            templateData={templateData}
            templateError={templateError}
            templateDownloading={templateDownloading}
            refetchTemplate={refetchTemplate}
            setDownloadRequested={setDownloadRequested}
            uploadBulk={(formData) =>
              bulkUpload({ destination_id, formData })
            }
            bulkUploading={bulkUploading}
          />
        }
      />

      <ReusableTable
        data={cuisines}
        columns={cuisineColumns}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalItems={total_item}
        table_options={tableOptions}
        onDeleteConfirm={handleDelete}
        deleteLoading={deleteLoading}
        className="mt-4"
      />
      <CuisineDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        cuisine={selectedCuisine}
      />
    </section>
  );
};

export default CuisineListPage;
