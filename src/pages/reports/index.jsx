import React, { useState } from "react";
import moment from "moment";
import { Eye } from "lucide-react";

import ReusableTable from "@/components/table";
import { TableProfile } from "@/components/ui/table";
import { Text, Title } from "@/components/ui/typography";
import StatusBadge from "@/components/ui/status";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJournalReportListQuery } from "@/features/journals/journalApiSlice";
import ReportDetailsDialog from "./report-dialog";

const TARGET_OPTIONS = [
  { label: "All Content", value: "all" },
  { label: "Journal", value: "journal" },
  { label: "Comment", value: "comment" },
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
];

const formatDate = (value) =>
  value ? moment(value).format("MMM D, YYYY [at] h:mm A") : "N/A";

const formatLabel = (value) => (value ? value.replaceAll("_", " ") : "N/A");

const truncateText = (value, limit = 84) => {
  if (!value) return "No content provided";
  return value.length > limit ? `${value.slice(0, limit)}...` : value;
};

const ReportPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [targetFilter, setTargetFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const reportColumns = [
    { header: "Reporter", accessorKey: "reporter_display" },
    { header: "Target", accessorKey: "target_display" },
    { header: "Reason", accessorKey: "reason_preview" },
    { header: "Status", accessorKey: "status_display" },
    { header: "Reported At", accessorKey: "created_at_display" },
    { header: "Action", accessorKey: "view" },
  ];

  const {
    data: reportData,
    isLoading,
    refetch,
  } = useJournalReportListQuery({
    page,
    page_size: pageSize,
    target: targetFilter === "all" ? undefined : targetFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const handleTargetChange = (value) => {
    setTargetFilter(value);
    setPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleView = (report) => {
    setSelectedReport(report);
    setDetailsOpen(true);
  };

  const reports =
    reportData?.data?.map((report) => {
      const targetAuthor = report.target?.author;

      return {
        ...report,
        raw_report: report,
        reporter_display: (
          <TableProfile
            name={
              report.reporter?.name ||
              report.reporter?.username ||
              "Unknown reporter"
            }
            email={report.reporter?.email || "No email"}
          />
        ),
        target_display: (
          <div className="min-w-[160px]">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                {formatLabel(report.target_type)}
              </span>
              {report.target?.deleted_at ? (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                  Deleted
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              By {targetAuthor?.name || targetAuthor?.username || "Unknown"}
            </p>
          </div>
        ),
        reason_preview: (
          <span className="block max-w-[320px] truncate text-slate-600">
            {truncateText(report.reason, 72)}
          </span>
        ),
        status_display: <StatusBadge status={report.status || "pending"} />,
        created_at_display: formatDate(report.created_at),
        view: (
          <button
            type="button"
            onClick={() => handleView(report)}
            className="center ml-auto mr-2 size-8 rounded-full bg-gray-100 transition hover:bg-primary/10 hover:text-primary"
            aria-label="View report details"
          >
            <Eye size={16} />
          </button>
        ),
      };
    }) || [];
  const totalItem = reportData?.meta?.count || reportData?.meta?.total || 0;

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Title variant="lg">Reported Content</Title>
          <Text className="mt-2">
            Review reported journals and comments, then accept or reject each
            report.
          </Text>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <Select value={targetFilter} onValueChange={handleTargetChange}>
            <SelectTrigger
              className="!h-11 rounded-xl border-slate-200 bg-white px-3 shadow-none"
              aria-label="Filter reports by target"
            >
              <SelectValue placeholder="All Content" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl border-slate-200">
              {TARGET_OPTIONS.map((target) => (
                <SelectItem key={target.value} value={target.value}>
                  {target.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger
              className="!h-11 rounded-xl border-slate-200 bg-white px-3 shadow-none"
              aria-label="Filter reports by status"
            >
              <SelectValue placeholder="All Status" />
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
      </div>

      <ReusableTable
        data={reports}
        columns={reportColumns}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalItems={totalItem}
        className="mt-4"
      />

      <ReportDetailsDialog
        report={selectedReport}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onReviewed={refetch}
      />
    </section>
  );
};

export default ReportPage;
