import ReusableTable from "@/components/table";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/typography";
import {
  useDeleteDestinationMutation,
  useDestinationListQuery,
} from "@/features/destination/destinationApiSlice";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const DestinationsPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const destinationColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Country", accessorKey: "country" },
    { header: "Location", accessorKey: "region" },
    { header: "Tags", accessorKey: "tags" },
    { header: "Best Time to Visit", accessorKey: "best_time" },
    { header: "Action", accessorKey: "action" },
  ];

  const { data: destinationData, isLoading } = useDestinationListQuery({
    page: page,
    page_size: pageSize,
  });

  const [deleteDestination] = useDeleteDestinationMutation();

  const hadleDeleteDestination = async (dest_id) => {
    console.log(dest_id);
    const res = await deleteDestination(dest_id);

    if (res && res.data?.success) {
      toast.success("Destination deleted successfully");
    } else {
      toast.success("Destination could not be deleted!");
    }
  };

  const table_options = [
    {
      label: "View",
      action: null,
    },
    {
      label: "Update",
      action: null,
    },
    {
      label: "Delete",
      action: hadleDeleteDestination,
    },
  ];

  const destinations =
    destinationData?.data?.map((item) => ({
      ...item,
      tags: (
        <div className="space-x-1">
          {item.tags?.map((t, idx) => (
            <span
              key={idx}
              className="inline-block py-1 px-2.5 capitalize text-xs rounded-md bg-primary/10 text-primary"
            >
              {t}
            </span>
          ))}
        </div>
      ),
    })) || [];
  const total_item = destinationData?.meta?.total || 0;

  console.log("Destinations Data:", destinations);

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
        className="mt-4"
      />
    </section>
  );
};

export default DestinationsPage;
