import ReusableTable from "@/components/table";
import { Button } from "@/components/ui/button";
import { TableProfile } from "@/components/ui/table";
import { Title } from "@/components/ui/typography";
import {
  useAttractionListQuery,
  useDeleteAttractionMutation,
} from "@/features/destination/destinationApiSlice";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import AttractionDetailsDialog from "./attraction-details-dialog";

const formatLabel = (value) => (value ? value.replaceAll("_", " ") : "N/A");

const formatDuration = (hours) => {
  if (!hours) return "N/A";

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (!days) return `${hours} hr`;
  if (!remainingHours) return `${days} day${days > 1 ? "s" : ""}`;

  return `${days} day${days > 1 ? "s" : ""} ${remainingHours} hr`;
};

const AttractionListPage = () => {
  const navigate = useNavigate();
  const { destination_id } = useParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const attractionColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Type", accessorKey: "attraction_type" },
    { header: "Budget", accessorKey: "budget_tier" },
    { header: "Duration", accessorKey: "avg_duration_hours" },
    { header: "Best Time", accessorKey: "best_time_of_day" },
    { header: "Featured", accessorKey: "is_featured" },
    { header: "Action", accessorKey: "action" },
  ];

  const { data: attractionData, isLoading } = useAttractionListQuery({
    destination_id,
    page: page,
    page_size: pageSize,
  });
  const [deleteAttraction, { isLoading: deleteLoading }] =
    useDeleteAttractionMutation();

  const handleAdd = () => {
    navigate(`/destinations/${destination_id}/attractions/new-attraction`);
  };

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
    attractionData?.meta?.count || attractionData?.meta?.total || 0;

  return (
    <section className="space-y-8">
      <div className="flbx">
        <Title variant="lg">Attractions</Title>
        <Button className="rounded-full !pl-4" onClick={handleAdd}>
          <Plus size={16} />
          Add Attraction
        </Button>
      </div>

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
        deleteLoading={deleteLoading}
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
