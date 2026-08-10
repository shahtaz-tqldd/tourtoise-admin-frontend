import React, { useState } from "react";
import moment from "moment";
import { Eye } from "lucide-react";

import { TableProfile } from "@/components/ui/table";
import { Text, Title } from "@/components/ui/typography";
import ReusableTable from "@/components/table";
import { useCreditRequestListQuery } from "@/features/credits/creditApiSlice";
import StatusBadge from "@/components/ui/status";
import CreditRequestDetailsDialog from "./credit-request-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { label: "All Requests", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
  { label: "Approved", value: "approved" },
];

const formatDate = (value) =>
  value ? moment(value).format("MMM D, YYYY [at] h:mm A") : "N/A";

const formatAmount = (value) =>
  value === null || value === undefined
    ? "N/A"
    : new Intl.NumberFormat("en-US").format(Number(value || 0));

const truncateText = (value, limit = 72) => {
  if (!value) return "No reason provided";
  return value.length > limit ? `${value.slice(0, limit)}...` : value;
};

const CreditRequestPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const requestColumns = [
    { header: "Requester", accessorKey: "requester" },
    { header: "Reason", accessorKey: "reason_preview" },
    { header: "Status", accessorKey: "status_display" },
    { header: "Approved Credit", accessorKey: "approved_amount_display" },
    { header: "Requested At", accessorKey: "created_at_display" },
    { header: "Action", accessorKey: "view" },
  ];

  const {
    data: requestData,
    isLoading,
    refetch,
  } = useCreditRequestListQuery({
    page: page,
    page_size: pageSize,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleView = (item) => {
    setSelectedRequest(item);
    setDetailsOpen(true);
  };

  const requests =
    requestData?.data?.map((request) => ({
      ...request,
      raw_request: request,
      requester: (
        <TableProfile
          name={request.user?.name || request.user?.username || "Unknown user"}
          email={request.user?.email || "No email"}
        />
      ),
      reason_preview: (
        <span className="block max-w-[360px] truncate text-slate-600">
          {truncateText(request.reason)}
        </span>
      ),
      status_display: <StatusBadge status={request.status || "pending"} />,
      approved_amount_display: formatAmount(request.approved_amount),
      created_at_display: formatDate(request.created_at),
      view: (
        <button
          onClick={() => handleView(request)}
          className="ml-auto mr-2 size-8 bg-gray-100 center rounded-full"
        >
          <Eye size={16} />
        </button>
      ),
    })) || [];
  const totalItem = requestData?.meta?.count || requestData?.meta?.total || 0;

  const tableOptions = [
    {
      label: "View",
      action: handleView,
    },
  ];

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Title variant="lg">Credit Requests</Title>
          <Text className="mt-2">
            Review user credit requests and approve or reject pending entries.
          </Text>
        </div>

        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger
            className="!h-11 rounded-xl border-slate-200 bg-white px-3 shadow-none"
            aria-label="Filter credit requests by status"
          >
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl border-slate-200">
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ReusableTable
        data={requests}
        columns={requestColumns}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalItems={totalItem}
        table_options={tableOptions}
        className="mt-4"
      />

      <CreditRequestDetailsDialog
        request={selectedRequest}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onReviewed={refetch}
      />
    </section>
  );
};

export default CreditRequestPage;
