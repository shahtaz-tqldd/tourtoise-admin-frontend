import React, { useState } from "react";
import moment from "moment";
import { toast } from "sonner";

import { TableProfile } from "@/components/ui/table";
import { Text } from "@/components/ui/typography";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingInput } from "@/components/ui/input";
import StatusBadge from "@/components/ui/status";
import { Button } from "@/components/ui/button";

import { Check, Eye, Send, X } from "lucide-react";
import { useReviewCreditRequestMutation } from "@/features/credits/creditApiSlice";

const getErrorMessage = (error) => {
  const apiError = error?.data?.error;
  if (Array.isArray(apiError)) return apiError[0];
  if (typeof apiError === "string") return apiError;
  return error?.data?.message || "Credit request could not be reviewed.";
};

const formatDate = (value) =>
  value ? moment(value).format("MMM D, YYYY [at] h:mm A") : "N/A";

const formatAmount = (value) =>
  value === null || value === undefined
    ? "N/A"
    : new Intl.NumberFormat("en-US").format(Number(value || 0));

const CreditRequestDetailsDialog = ({
  request,
  open,
  onOpenChange,
  onReviewed,
}) => {
  const [reviewMode, setReviewMode] = useState(null);
  const [amount, setAmount] = useState("");
  const [reviewCreditRequest, { isLoading }] = useReviewCreditRequestMutation();

  const isPending = request?.status === "pending";

  const handleOpenChange = (nextOpen) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setReviewMode(null);
      setAmount("");
    }
  };

  const submitReview = async (action) => {
    const numericAmount = action === "approve" ? Number(amount) : 0;

    if (
      action === "approve" &&
      (!Number.isInteger(numericAmount) || numericAmount <= 0)
    ) {
      toast.error("Enter a valid credit amount.");
      return;
    }

    try {
      await reviewCreditRequest({
        requestId: request.id,
        payload: {
          action,
          amount: numericAmount,
        },
      }).unwrap();
      toast.success(
        action === "approve"
          ? "Credit request approved"
          : "Credit request rejected",
      );
      await onReviewed?.();
      handleOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-3xl border-slate-200 p-0 sm:max-w-[640px]">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <div className="mb-1 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Eye className="size-5" />
          </div>
          <DialogTitle>Credit Request Details</DialogTitle>
          <DialogDescription>
            Review the request details before making a decision.
          </DialogDescription>
        </DialogHeader>

        {request ? (
          <div className="space-y-5 px-6">
            <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <TableProfile
                name={request.user?.name || "Unknown user"}
                email={request.user?.email || "No email"}
                profile_img_url={request?.user?.avatar_url}
              />
              <StatusBadge status={request.status || "pending"} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Requested At">
                {formatDate(request.created_at)}
              </DetailItem>
              <DetailItem label="Approved Amount">
                {formatAmount(request.approved_amount)}
              </DetailItem>
              <DetailItem label="Reviewed At">
                {formatDate(request.reviewed_at)}
              </DetailItem>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <Text variant="xs" className="font-semibold uppercase">
                Reason
              </Text>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {request.reason || "No reason provided."}
              </p>
            </div>
          </div>
        ) : null}

        <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 rounded-b-3xl">
          {reviewMode === "approve" ? (
            <div className="flx gap-2">
              <FloatingInput
                id="approved-credit-amount"
                type="number"
                label="Approve Amount"
                min="1"
                step="1"
                inputMode="numeric"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Enter amount"
              />

              <Button
                type="button"
                className="h-11"
                disabled={isLoading}
                onClick={() => submitReview("approve")}
              >
                <Send className="size-4" />
                Send
              </Button>
            </div>
          ) : isPending ? (
            <>
              <Button
                type="button"
                variant="destructive"
                disabled={isLoading}
                onClick={() => submitReview("reject")}
              >
                <X className="size-4" />
                Reject
              </Button>
              <Button
                type="button"
                disabled={isLoading}
                onClick={() => setReviewMode("approve")}
              >
                <Check className="size-4" />
                Approve
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

export default CreditRequestDetailsDialog;
