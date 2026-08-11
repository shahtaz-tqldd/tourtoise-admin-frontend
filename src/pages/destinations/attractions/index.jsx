import ReusableTable from "@/components/table";
import { TableProfile } from "@/components/ui/table";
import {
  useAttractionListQuery,
  useBulkAttractionUploadMutation,
  useDeleteAttractionMutation,
  useDownloadAttractionTemplateQuery,
  useRetrainAttractionMutation,
} from "@/features/destination/destinationApiSlice";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import AttractionDetailsDialog from "./attraction-details-dialog";
import DestinationContentActions from "../components/destination-content-actions";
import DestinationContentHeader from "../components/destination-content-header";
import StatusBadge from "@/components/ui/status";
import moment from "moment";
import { Check } from "lucide-react";

const formatLabel = (value) => (value ? value.replaceAll("_", " ") : "N/A");

const AttractionListPage = () => {
  const navigate = useNavigate();
  const { destination_id } = useParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloadRequested, setDownloadRequested] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const attractionColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Type", accessorKey: "attraction_type" },
    { header: "Training Status", accessorKey: "training_status" },
    { header: "Featured", accessorKey: "is_featured" },
    { header: "Last Modified", accessorKey: "timestamp" },
    { header: "Action", accessorKey: "action" },
  ];

  const { data: attractionData, isLoading } = useAttractionListQuery({
    destination_id,
    page: page,
    page_size: pageSize,
  });
  const [deleteAttraction, { isLoading: deleteLoading }] =
    useDeleteAttractionMutation();
  const [retrainAttraction, { isLoading: retrainLoading }] =
    useRetrainAttractionMutation();
  const {
    data: templateData,
    isFetching: templateDownloading,
    error: templateError,
    refetch: refetchTemplate,
  } = useDownloadAttractionTemplateQuery(
    { destination_id },
    { skip: !downloadRequested },
  );
  const [bulkUpload, { isLoading: bulkUploading }] =
    useBulkAttractionUploadMutation();

  const handleUpdate = (attractionId) => {
    navigate(
      `/destinations/${destination_id}/attractions/update/${attractionId}`,
    );
  };

  const handleView = (_, item) => {
    setSelectedAttraction(item.raw_attraction || item);
    setDetailsOpen(true);
  };

  const handleDelete = async (attractionId) => {
    try {
      await deleteAttraction({
        destination_id,
        attraction_id: attractionId,
      }).unwrap();
      toast.success("Attraction deleted successfully");
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error?.[0] ||
        error?.data?.detail ||
        "Attraction could not be deleted";
      toast.error(message);
    }
  };

  const handleRetrain = async (attractionId) => {
    try {
      await retrainAttraction({
        destination_id,
        attraction_id: attractionId,
      }).unwrap();
      toast.success("Attraction retraining started");
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error?.[0] ||
        error?.data?.detail ||
        "Attraction retraining could not be started";
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

  const attractions =
    attractionData?.data?.map((item) => ({
      ...item,
      raw_attraction: item,
      name: (
        <TableProfile
          name={item.name}
          email={item.address || item.slug || "No address"}
          profile_img_url={item.cover_image}
          non_rounded
        />
      ),
      attraction_type: (
        <span className="capitalize">{formatLabel(item.attraction_type)}</span>
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
    attractionData?.meta?.count || attractionData?.meta?.total || 0;

  return (
    <section className="space-y-8">
      <DestinationContentHeader
        destinationId={destination_id}
        title="Attractions"
        action={
          <DestinationContentActions
            label="Attraction"
            addPath={`/destinations/${destination_id}/attractions/new-attraction`}
            templateKey="attractions"
            templateData={templateData}
            templateError={templateError}
            templateDownloading={templateDownloading}
            refetchTemplate={refetchTemplate}
            setDownloadRequested={setDownloadRequested}
            uploadBulk={(formData) => bulkUpload({ destination_id, formData })}
            bulkUploading={bulkUploading}
          />
        }
      />

      <ReusableTable
        data={attractions}
        columns={attractionColumns}
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
      />
      <AttractionDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        attraction={selectedAttraction}
      />
    </section>
  );
};

export default AttractionListPage;
