import ReusableTable from "@/components/table";
import { TableProfile } from "@/components/ui/table";
import {
  useBulkActivityUploadMutation,
  useActivityListQuery,
  useDeleteActivityMutation,
  useDownloadActivityTemplateQuery,
} from "@/features/destination/destinationApiSlice";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import ActivityDetailsDialog from "./activity-details-dialog";
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

const ActivityListPage = () => {
  const navigate = useNavigate();
  const { destination_id } = useParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloadRequested, setDownloadRequested] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const activityColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Type", accessorKey: "activity_type" },
    { header: "Budget", accessorKey: "budget_tier" },
    { header: "Duration", accessorKey: "avg_duration_hours" },
    { header: "Best Time", accessorKey: "best_time_of_day" },
    { header: "Featured", accessorKey: "is_featured" },
    { header: "Action", accessorKey: "action" },
  ];

  const { data: activityData, isLoading } = useActivityListQuery({
    destination_id,
    page: page,
    page_size: pageSize,
  });
  const [deleteActivity, { isLoading: deleteLoading }] =
    useDeleteActivityMutation();
  const {
    data: templateData,
    isFetching: templateDownloading,
    error: templateError,
    refetch: refetchTemplate,
  } = useDownloadActivityTemplateQuery(
    { destination_id },
    { skip: !downloadRequested },
  );
  const [bulkUpload, { isLoading: bulkUploading }] =
    useBulkActivityUploadMutation();

  const handleUpdate = (activityId) => {
    navigate(`/destinations/${destination_id}/activities/update/${activityId}`);
  };

  const handleView = (_, item) => {
    setSelectedActivity(item.raw_activity || item);
    setDetailsOpen(true);
  };

  const handleDelete = async (activityId) => {
    try {
      await deleteActivity({
        destination_id,
        activity_id: activityId,
      }).unwrap();
      toast.success("Activity deleted successfully");
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error?.[0] ||
        error?.data?.detail ||
        "Activity could not be deleted";
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

  const activities =
    activityData?.data?.map((item) => ({
      ...item,
      raw_activity: item,
      name: (
        <TableProfile
          name={item.name}
          email={item.address || item.slug || "No address"}
          profile_img_url={item.cover_image}
          non_rounded
        />
      ),
      activity_type: (
        <span className="capitalize">{formatLabel(item.activity_type)}</span>
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
  const total_item =
    activityData?.meta?.count || activityData?.meta?.total || 0;

  return (
    <section className="space-y-8">
      <DestinationContentHeader
        destinationId={destination_id}
        title="Activities"
        action={
          <DestinationContentActions
            label="Activity"
            addPath={`/destinations/${destination_id}/activities/new-activity`}
            templateKey="activities"
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
        data={activities}
        columns={activityColumns}
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
      <ActivityDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        activity={selectedActivity}
      />
    </section>
  );
};

export default ActivityListPage;
