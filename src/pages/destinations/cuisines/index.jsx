import ReusableTable from "@/components/table";
import { TableProfile } from "@/components/ui/table";
import {
  useBulkCuisineUploadMutation,
  useCuisineListQuery,
  useDeleteCuisineMutation,
  useDownloadCuisineTemplateQuery,
  useRetrainCuisineMutation,
} from "@/features/destination/destinationApiSlice";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import CuisineDetailsDialog from "./cuisine-details-dialog";
import DestinationContentActions from "../components/destination-content-actions";
import DestinationContentHeader from "../components/destination-content-header";
import { Check } from "lucide-react";
import moment from "moment";
import StatusBadge from "@/components/ui/status";
import SelectedDataActions from "../components/selected-data-actions";

const formatLabel = (value) => (value ? value.replaceAll("_", " ") : "N/A");

const CuisineListPage = () => {
  const navigate = useNavigate();
  const { destination_id } = useParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloadRequested, setDownloadRequested] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const cuisineColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Type", accessorKey: "cuisine_type" },
    { header: "Training Status", accessorKey: "training_status" },
    { header: "Featured", accessorKey: "is_featured" },
    { header: "Last Modified", accessorKey: "timestamp" },
    { header: "Action", accessorKey: "action" },
  ];

  const { data: cuisineData, isLoading } = useCuisineListQuery({
    destination_id,
    page: page,
    page_size: pageSize,
  });
  const [deleteCuisine, { isLoading: deleteLoading }] =
    useDeleteCuisineMutation();
  const [retrainCuisine, { isLoading: retrainLoading }] =
    useRetrainCuisineMutation();
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

  const handleRetrain = async (cuisineId) => {
    try {
      await retrainCuisine({
        destination_id,
        cuisine_id: cuisineId,
      }).unwrap();
      toast.success("Cuisine retraining started");
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error?.[0] ||
        error?.data?.detail ||
        "Cuisine retraining could not be started";
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
            uploadBulk={(formData) => bulkUpload({ destination_id, formData })}
            bulkUploading={bulkUploading}
            type="cuisines"
          />
        }
      />

      <SelectedDataActions
        type="cuisines"
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
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
        onRetrainConfirm={handleRetrain}
        deleteLoading={deleteLoading}
        retrainLoading={retrainLoading}
        className="mt-4"
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
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
