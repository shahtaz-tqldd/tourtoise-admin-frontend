import React, { useState } from "react";
import moment from "moment";

import { TableProfile } from "@/components/ui/table";
import { Title } from "@/components/ui/typography";
import ReusableTable from "@/components/table";
import { useJournalListQuery } from "@/features/journals/journalApiSlice";

const JournalListPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const journalColumn = [
    { header: "Name", accessorKey: "name" },
    { header: "Location", accessorKey: "region" },
    { header: "Last Login", accessorKey: "last_login" },
    { header: "Joined at", accessorKey: "joined_at" },
    { header: "Action", accessorKey: "action" },
  ];

  const { data: journalData, isLoading } = useJournalListQuery({
    page: page,
    page_size: pageSize,
  });

  const journals =
    journalData?.data?.map((user) => ({
      ...user,
      name: <TableProfile name={user.name} email={user.email} />,
      last_login: user.last_active_at
        ? moment(user.last_active_at).fromNow()
        : "Never logged in",
      region: user.region || "N/A",
      joined_at: moment(user.created_at).format("MMMM Do, YYYY"),
      action: (
        <div className="flbx gap-2">
          <button className="btn btn-sm btn-primary">Edit</button>
          <button className="btn btn-sm btn-danger">Delete</button>
        </div>
      ),
    })) || [];
  const total_item = journalData?.meta?.total || 0;

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
      action: null,
    },
  ];

  return (
    <section className="space-y-8">
      <div className="flbx">
        <Title variant="lg">Travel Journals</Title>
      </div>

      <ReusableTable
        data={journals}
        columns={journalColumn}
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

export default JournalListPage;
