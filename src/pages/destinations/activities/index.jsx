import ReusableTable from "@/components/table";
import { TableProfile } from "@/components/ui/table";
import {
  useBulkActivityUploadMutation,
  useActivityListQuery,
  useDeleteActivityMutation,
  useDownloadActivityTemplateQuery,
  useRetrainActivityMutation,
} from "@/features/destination/destinationApiSlice";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import ActivityDetailsDialog from "./activity-details-dialog";
import DestinationContentActions from "../components/destination-content-actions";
import DestinationContentHeader from "../components/destination-content-header";
import moment from "moment";
import StatusBadge from "@/components/ui/status";
import { Check } from "lucide-react";
import SelectedDataActions from "../components/selected-data-actions";

const formatLabel = (value) => (value ? value.replaceAll("_", " ") : "N/A");

const ActivityListPage = () => {
  const navigate = useNavigate();
  const { destination_id } = useParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloadRequested, setDownloadRequested] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const activityColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Type", accessorKey: "activity_type" },
    { header: "Training Status", accessorKey: "training_status" },
    { header: "Featured", accessorKey: "is_featured" },
    { header: "Last Modified", accessorKey: "timestamp" },
    { header: "Action", accessorKey: "action" },
  ];

  const { data: activityData, isLoading } = useActivityListQuery({
    destination_id,
    page: page,
    page_size: pageSize,
  });
  const [deleteActivity, { isLoading: deleteLoading }] =
    useDeleteActivityMutation();
  const [retrainActivity, { isLoading: retrainLoading }] =
    useRetrainActivityMutation();
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

  const handleRetrain = async (activityId) => {
    try {
      await retrainActivity({
        destination_id,
        activity_id: activityId,
      }).unwrap();
      toast.success("Activity retraining started");
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error?.[0] ||
        error?.data?.detail ||
        "Activity retraining could not be started";
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
      label: "Retrain",
      type: "retrain",
      disabled: () => retrainLoading,
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
      training_status: (
        <StatusBadge
          status={item.is_trained_completed ? "Complete" : "Incomplete"}
        />
      ),
      timestamp: (
        <div>
          <span className="block font-semibold">
            {moment(item?.updated_at).format("MMM D, YYYY")}
          </span>
          <span className="text-xs text-slate-500">
            Created on {moment(item?.created_at).format("MMM D, YYYY")}
          </span>
        </div>
      ),
      is_featured: item.is_featured ? (
        <div className="flx gap-2 font-semibold text-primary">
          <Check className="size-3" />
          Yes
        </div>
      ) : (
        <span className="text-slate-500 ml-7">-</span>
      ),
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
            uploadBulk={(formData) => bulkUpload({ destination_id, formData })}
            bulkUploading={bulkUploading}
            type="activities"
          />
        }
      />

      <SelectedDataActions
        type="activities"
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
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
        onRetrainConfirm={handleRetrain}
        deleteLoading={deleteLoading}
        retrainLoading={retrainLoading}
        className="mt-4"
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
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
