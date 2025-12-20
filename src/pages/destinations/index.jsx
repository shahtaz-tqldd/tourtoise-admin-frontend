import ReusableTable from "@/components/table";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/typography";
import { useDestinationListQuery } from "@/features/destination/destinationApiSlice";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

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

  const destinations = destinationData?.data || [];
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
        page_size={pageSize}
        totalItems={total_item}
        className="mt-4"
      />
    </section>
  );
};

export default DestinationsPage;
