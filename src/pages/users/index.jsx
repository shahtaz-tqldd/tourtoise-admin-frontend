import React, { useState } from "react";
import ReusableTable from "@/components/table";
import { Text, Title } from "@/components/ui/typography";
import { useUserListQuery } from "@/features/auth/authApiSlice";
import moment from "moment";
import { TableProfile } from "@/components/ui/table";

const UserPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const destinationColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Location", accessorKey: "region" },
    { header: "Last Login", accessorKey: "last_login" },
    { header: "Joined at", accessorKey: "joined_at" },
    { header: "Action", accessorKey: "action" },
  ];

  const { data: usersData, isLoading } = useUserListQuery({
    page: page,
    page_size: pageSize,
  });

  const users =
    usersData?.data?.map((user) => ({
      ...user,
      name: (
        <TableProfile
          name={user.first_name + " " + user.last_name}
          email={user.email}
        />
      ),
      last_login: user.last_login
        ? moment(user.last_login).fromNow()
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
  const total_item = usersData?.meta?.total || 0;

  console.log("users Data:", users);

  return (
    <section className="space-y-8">
      <div className="flbx">
        <Title variant="lg">Users</Title>
      </div>

      <ReusableTable
        data={users}
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

export default UserPage;
