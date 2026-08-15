import React, { useState } from "react";
import moment from "moment";
import { Check, Eye, Send, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingTextarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/ui/status";
import { TableProfile } from "@/components/ui/table";
import { Text } from "@/components/ui/typography";
import { useJournalReportReviewMutation } from "@/features/journals/journalApiSlice";

const getErrorMessage = (error) => {
  const apiError = error?.data?.error;
  if (Array.isArray(apiError)) return apiError[0];
  if (typeof apiError === "string") return apiError;
  return error?.data?.message || "Report could not be reviewed.";
};

const formatDate = (value) =>
  value ? moment(value).format("MMM D, YYYY [at] h:mm A") : "N/A";

const formatLabel = (value) => (value ? value.replaceAll("_", " ") : "N/A");

const getTargetText = (report) => {
  if (report?.target_type === "comment") return report.target?.text || "";
  return report?.target?.content || "";
};

const ReportDetailsDialog = ({ report, open, onOpenChange, onReviewed }) => {
  const [reviewMode, setReviewMode] = useState(null);
  const [adminComment, setAdminComment] = useState("");
  const [reviewReport, { isLoading }] = useJournalReportReviewMutation();

  const isPending = report?.status === "pending";
  const targetAuthor = report?.target?.author;

  const handleOpenChange = (nextOpen) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setReviewMode(null);
      setAdminComment("");
    }
  };

  const submitReview = async (action) => {
    if (!adminComment.trim()) {
      toast.error("Write an admin comment before submitting.");
      return;
    }

    try {
      await reviewReport({
        reportId: report.id,
        payload: {
          action,
          admin_comment: adminComment.trim(),
        },
      }).unwrap();
      toast.success(
        action === "accept" ? "Report accepted" : "Report rejected",
      );
      await onReviewed?.();
      handleOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-3xl border-slate-200 p-0 sm:max-w-[700px]">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <div className="mb-1 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Eye className="size-5" />
          </div>
          <DialogTitle>Report Details</DialogTitle>
          <DialogDescription>
            Review the reported content and moderation reason.
          </DialogDescription>
        </DialogHeader>

        {report ? (
          <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6">
            <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <TableProfile
                name={report.reporter?.name || "Unknown reporter"}
                email={report.reporter?.email || "No email"}
                profile_img_url={report?.reporter?.avatar_url}
              />
              <StatusBadge status={report.status || "pending"} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Reported At">
                {formatDate(report.created_at)}
              </DetailItem>
              <DetailItem label="Reviewed At">
                {formatDate(report.reviewed_at)}
              </DetailItem>
            </div>
            <TextBlock label="Report Reason">
              {report.reason || "No reason provided."}
            </TextBlock>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <Text variant="xs" className="font-semibold uppercase">
                Target Author
              </Text>
              <div className="mt-3 flbx">
                <TableProfile
                  name={targetAuthor?.name || "Unknown author"}
                  email={targetAuthor?.email || "No email"}
                  profile_img_url={targetAuthor?.avatar_url}
                />
                <StatusBadge status={formatLabel(report.target_type)} />
              </div>
            </div>

            <TextBlock
              label="Reported Content"
              isDeleted={report.target?.deleted_at}
            >
              {getTargetText(report) || "No content provided."}
            </TextBlock>

            {report.admin_comment ? (
              <TextBlock label="Admin Comment">
                {report.admin_comment}
              </TextBlock>
            ) : null}

            {reviewMode ? (
              <div className="">
                <FloatingTextarea
                  name="admin_comment"
                  label="Admin comment"
                  value={adminComment}
                  onChange={(event) => setAdminComment(event.target.value)}
                  placeholder="Write admin comment"
                  rows={2}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        <DialogFooter className="rounded-b-3xl border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          {reviewMode ? (
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => setReviewMode()}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isLoading}
                onClick={() => submitReview(reviewMode)}
              >
                <Send className="size-4" />
                {reviewMode === "accept" ? "Accept" : "Reject"}
              </Button>
            </div>
          ) : isPending ? (
            <>
              <Button
                type="button"
                variant="destructive"
                disabled={isLoading}
                onClick={() => setReviewMode("reject")}
              >
                <X className="size-4" />
                Reject
              </Button>
              <Button
                type="button"
                disabled={isLoading}
                onClick={() => setReviewMode("accept")}
              >
                <Check className="size-4" />
                Accept
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DetailItem = ({ label, children }) => (
  <div>
    <Text variant="xs" className="font-semibold uppercase">
      {label}
    </Text>
    <div className="mt-1 text-sm font-medium text-slate-800">{children}</div>
  </div>
);

const TextBlock = ({ label, children, isDeleted = false }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-4">
    <div className="flbx">
      <Text variant="xs" className="font-semibold uppercase">
        {label}
      </Text>
      {isDeleted ? <StatusBadge status="Deleted" /> : null}
    </div>
    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
      {children}
    </p>
  </div>
);

export default ReportDetailsDialog;
