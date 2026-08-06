import { useEffect, useState } from "react";
import moment from "moment";
import { Search, X } from "lucide-react";

import ReusableTable from "@/components/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableProfile } from "@/components/ui/table";
import { Title } from "@/components/ui/typography";
import { useUserAccountListQuery } from "@/features/auth/authApiSlice";
import StatusBadge from "@/components/ui/status";

const userColumns = [
  { header: "User", accessorKey: "profile" },
  { header: "Account", accessorKey: "account" },
  { header: "Status", accessorKey: "status_display" },
  { header: "Travel content", accessorKey: "travel_content" },
  { header: "Messages", accessorKey: "messages" },
  { header: "Credit", accessorKey: "credit_display" },
  { header: "Last active", accessorKey: "last_active" },
];

const statusOptions = ["ACTIVE", "SUSPENDED", "DEACTIVATED", "PREMIUM"];

const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatDate = (value, format = "MMM D, YYYY") =>
  value && moment(value).isValid()
    ? moment(value).format(format)
    : "Not available";

const UserPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data: usersData, isLoading } = useUserAccountListQuery({
    page,
    page_size: pageSize,
    search: searchQuery,
    status: status === "all" ? "" : status,
  });

  const users =
    usersData?.data?.map((user) => {
      const normalizedStatus = String(user.status || "unknown").toLowerCase();
      const chatMessageCount = user.message_count?.chat_message ?? 0;
      const tripMessageCount = user.message_count?.trip_message ?? 0;

      const chatMessageLabel =
        chatMessageCount > 0 &&
        `${formatNumber(chatMessageCount)} chat ${
          chatMessageCount === 1 ? "message" : "messages"
        }`;
      const tripMessageLabel =
        tripMessageCount > 0 &&
        `${formatNumber(tripMessageCount)} trip ${
          tripMessageCount === 1 ? "message" : "messages"
        }`;

      return {
        ...user,
        profile: (
          <TableProfile
            className="min-w-[220px]"
            name={user.name || user.username || "Unnamed user"}
            email={user.email || "Email not set"}
            profile_img_url={user?.avatar_url}
          />
        ),
        account: (
          <div className="min-w-[150px]">
            {user?.location ? (
              <p className="font-medium text-slate-700">{user?.location}</p>
            ) : (
              <span className="text-xs text-slate-500">Location not set</span>
            )}
          </div>
        ),
        status_display: (
          <div className="min-w-[125px] space-x-2">
            <StatusBadge status={normalizedStatus} />
            <StatusBadge
              status={user.is_email_verified ? "verified" : "unverified"}
            />
          </div>
        ),
        travel_content: (
          <div className="min-w-[120px] space-y-1 text-sm">
            <p className="font-medium text-slate-700">
              {formatNumber(user.trip_plan_count)} trips
            </p>
            <p className="text-xs text-slate-500">
              {formatNumber(user.journal_count)} journals
            </p>
          </div>
        ),
        messages: (
          <div className="min-w-[120px] space-y-1 text-sm tabular-nums flex flex-col">
            {chatMessageCount ? (
              <p className="font-medium text-slate-700">{chatMessageLabel}</p>
            ) : (
              <span className="text-xs text-slate-500">No Chat Messages</span>
            )}
            {tripMessageCount ? (
              <p className="text-xs text-slate-500">{tripMessageLabel}</p>
            ) : (
              <span className="text-xs text-slate-500">No Trip Messages</span>
            )}
          </div>
        ),
        credit_display: (
          <span className="font-semibold tabular-nums text-slate-700">
            {formatNumber(user.credit)}
          </span>
        ),
        last_active: (
          <div className="min-w-[145px]">
            <p className="font-medium text-slate-700">
              {user.last_active_at
                ? moment(user.last_active_at).fromNow()
                : "Never"}
            </p>
            {user.last_active_at && (
              <p className="mt-1 text-xs text-slate-500">
                Joined at {formatDate(user.created_at)}
              </p>
            )}
          </div>
        ),
      };
    }) || [];

  const totalItems = usersData?.meta?.total || usersData?.meta?.count || 0;

  return (
    <section className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title variant="lg">Users</Title>
          <p className="mt-1 text-sm text-slate-500">
            Review account status, activity, and travel engagement.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
              placeholder="Search name, username, or email..."
              aria-label="Search users"
              className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-9 pr-9 shadow-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setPage(1);
                }}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger
              className="!h-11 w-full rounded-xl border-slate-200 bg-slate-50 px-3 shadow-none sm:w-[140px]"
              aria-label="Filter users by status"
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl border-slate-200">
              <SelectItem value="all">All statuses</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option} className="capitalize">
                  {option.toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ReusableTable
        data={users}
        columns={userColumns}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalItems={totalItems}
        className="mt-4"
      />
    </section>
  );
};

export default UserPage;
