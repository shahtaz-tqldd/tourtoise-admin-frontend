import { useMemo, useState } from "react";
import moment from "moment";
import {
  Braces,
  Database,
  Eye,
  Filter,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import Pagination from "@/components/table/pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Title } from "@/components/ui/typography";
import {
  useDeleteBulkRecordMutation,
  useDeleteRecordMutation,
  useRecordListQuery,
  useSearchRecordQuery,
} from "@/features/vector-store/vectorStoreApiSlice";

const sourceTypes = ["destination", "attraction", "cuisine", "activity"];

const sourceStyles = {
  destination: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  attraction: "bg-violet-50 text-violet-700 ring-violet-600/20",
  cuisine: "bg-amber-50 text-amber-700 ring-amber-600/20",
  activity: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

const getItems = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data?.results)) return response.data.results;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const getTotal = (response, fallback) =>
  response?.meta?.total ??
  response?.meta?.count ??
  response?.count ??
  response?.data?.count ??
  response?.data?.meta?.total ??
  fallback;

const errorMessage = (error, fallback) =>
  error?.data?.message ||
  error?.data?.detail ||
  error?.data?.error?.[0] ||
  fallback;

const shortId = (value) => {
  if (!value) return "Not available";
  return value.length > 18 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value;
};

const formatDate = (value) =>
  value && moment(value).isValid()
    ? moment(value).format("MMM D, YYYY · h:mm A")
    : "Not available";

const formatMetadata = (metadata) => {
  if (metadata == null) return "{}";
  if (typeof metadata === "string") {
    try {
      return JSON.stringify(JSON.parse(metadata), null, 2);
    } catch {
      return metadata;
    }
  }
  return JSON.stringify(metadata, null, 2);
};

function SourceBadge({ value }) {
  const sourceAliases = {
    destinations: "destination",
    attractions: "attraction",
    cuisines: "cuisine",
    activities: "activity",
  };
  const sourceValue = String(value || "unknown").toLowerCase();
  const normalized = sourceAliases[sourceValue] || sourceValue;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
        sourceStyles[normalized] ||
        "bg-slate-100 text-slate-600 ring-slate-500/20"
      }`}
    >
      {normalized}
    </span>
  );
}

function TableSkeleton({ rows }) {
  return Array.from({ length: Math.min(rows, 6) }).map((_, index) => (
    <TableRow key={index} className="border-slate-100 hover:bg-transparent">
      <TableCell className="px-5 py-5" colSpan={7}>
        <div className="flex items-center gap-5">
          <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 max-w-lg flex-1 animate-pulse rounded-full bg-slate-200" />
        </div>
      </TableCell>
    </TableRow>
  ));
}

const VectorStorePage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [queryInput, setQueryInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceType, setSourceType] = useState("all");
  const [destinationId, setDestinationId] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [recordToView, setRecordToView] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const normalizedSourceType = sourceType === "all" ? "" : sourceType;
  const listArgs = {
    page,
    page_size: pageSize,
    source_type: normalizedSourceType,
    destination_id: destinationId.trim(),
    source_id: sourceId.trim(),
  };

  const {
    data: listData,
    isLoading: listLoading,
    isFetching: listFetching,
    error: listError,
  } = useRecordListQuery(listArgs, { skip: Boolean(searchQuery) });

  const {
    data: searchData,
    isLoading: searchLoading,
    isFetching: searchFetching,
    error: searchError,
  } = useSearchRecordQuery(
    {
      query: searchQuery,
      source_type: normalizedSourceType,
      destination_id: destinationId.trim(),
      limit: pageSize,
    },
    { skip: !searchQuery },
  );

  const [deleteRecord, { isLoading: deletingOne }] = useDeleteRecordMutation();
  const [deleteBulkRecord, { isLoading: deletingBulk }] =
    useDeleteBulkRecordMutation();

  const activeData = searchQuery ? searchData : listData;
  const records = useMemo(() => {
    const items = getItems(activeData);
    if (!searchQuery || !sourceId.trim()) return items;
    return items.filter(
      (record) => String(record.source_id) === sourceId.trim(),
    );
  }, [activeData, searchQuery, sourceId]);
  const totalItems = searchQuery
    ? records.length
    : getTotal(listData, records.length);
  const isLoading = searchQuery
    ? searchLoading || searchFetching
    : listLoading || listFetching;
  const error = searchQuery ? searchError : listError;
  const allOnPageSelected =
    records.length > 0 &&
    records.every((record) => selectedIds.includes(record.id));

  const updateFilters = (setter, value) => {
    setter(value);
    setPage(1);
    setSelectedIds([]);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const value = queryInput.trim();
    setSearchQuery(value);
    setPage(1);
    setSelectedIds([]);
  };

  const clearSearch = () => {
    setQueryInput("");
    setSearchQuery("");
    setPage(1);
    setSelectedIds([]);
  };

  const resetFilters = () => {
    setSourceType("all");
    setDestinationId("");
    setSourceId("");
    setPage(1);
    setSelectedIds([]);
  };

  const toggleAll = (checked) => {
    const pageIds = records.map((record) => record.id);
    setSelectedIds((current) =>
      checked
        ? [...new Set([...current, ...pageIds])]
        : current.filter((id) => !pageIds.includes(id)),
    );
  };

  const toggleOne = (id, checked) => {
    setSelectedIds((current) =>
      checked
        ? [...new Set([...current, id])]
        : current.filter((item) => item !== id),
    );
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget === "bulk") {
        const response = await deleteBulkRecord({ ids: selectedIds }).unwrap();
        const deletedCount = response?.deleted?.length || selectedIds.length;
        const missingCount = response?.missing?.length || 0;
        toast.success(
          `${deletedCount} record${deletedCount === 1 ? "" : "s"} deleted${
            missingCount ? ` · ${missingCount} missing` : ""
          }`,
        );
        setSelectedIds([]);
      } else {
        await deleteRecord({ recordId: deleteTarget.id }).unwrap();
        toast.success("Vector record deleted successfully");
        setSelectedIds((current) =>
          current.filter((id) => id !== deleteTarget.id),
        );
      }
      setDeleteTarget(null);
    } catch (deleteError) {
      toast.error(
        errorMessage(deleteError, "The vector record could not be deleted"),
      );
    }
  };

  const hasFilters = sourceType !== "all" || destinationId || sourceId;
  const deleting = deletingOne || deletingBulk;

  return (
    <section className="space-y-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Database className="h-5 w-5" />
          </div>
          <Title variant="lg">Vector store</Title>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Browse embedded content, inspect metadata, and run semantic
            similarity searches.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full gap-2 lg:max-w-xl">
          <div className="relative min-w-0 flex-1">
            <Sparkles
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
              aria-hidden="true"
            />
            <Input
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              placeholder="Search by meaning, topic, or phrase…"
              aria-label="Semantic search query"
              className="h-12 rounded-2xl border-slate-200 bg-white pl-10 pr-10 shadow-sm"
            />
            {queryInput && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear semantic search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            className="h-12 rounded-2xl px-5"
            disabled={!queryInput.trim()}
          >
            <Search />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
              <Filter className="h-4 w-4" />
            </span>
            Filters
          </div>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
            >
              <RotateCcw /> Reset filters
            </Button>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Select
            value={sourceType}
            onValueChange={(value) => updateFilters(setSourceType, value)}
          >
            <SelectTrigger className="!h-11 w-full rounded-xl border-slate-200 bg-slate-50 px-3 shadow-none">
              <SelectValue placeholder="All source types" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All source types</SelectItem>
              {sourceTypes.map((type) => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={destinationId}
            onChange={(event) =>
              updateFilters(setDestinationId, event.target.value)
            }
            placeholder="Destination ID"
            aria-label="Filter by destination ID"
            className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-none"
          />
          <Input
            value={sourceId}
            onChange={(event) => updateFilters(setSourceId, event.target.value)}
            placeholder="Source ID"
            aria-label="Filter by source ID"
            className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-none"
          />
        </div>
      </div>

      {searchQuery && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Semantic results for{" "}
              <strong className="font-semibold">“{searchQuery}”</strong>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearSearch}>
            Back to all records
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <div>
            <p className="font-semibold text-slate-800">
              {searchQuery ? "Search results" : "Vector records"}
            </p>
            <p className="text-xs text-slate-500">
              {isLoading
                ? "Loading records…"
                : `${totalItems.toLocaleString()} record${totalItems === 1 ? "" : "s"}`}
            </p>
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600">
                {selectedIds.length} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-xl"
                onClick={() => setDeleteTarget("bulk")}
              >
                <Trash2 /> Delete selected
              </Button>
            </div>
          )}
        </div>

        <Table>
          <TableHeader className="bg-slate-50/90">
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="h-14 w-12 px-5">
                <Checkbox
                  checked={allOnPageSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all records on this page"
                />
              </TableHead>
              <TableHead className="h-14 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Source
              </TableHead>
              <TableHead className="h-14 min-w-80 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Content
              </TableHead>
              {searchQuery ? (
                <TableHead className="h-14 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Distance
                </TableHead>
              ) : (
                <TableHead className="h-14 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Updated
                </TableHead>
              )}
              <TableHead className="h-14 w-24 px-5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={pageSize} />
            ) : error ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-52 text-center">
                  <p className="font-semibold text-slate-700">
                    Could not load vector records
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {errorMessage(error, "Please try again in a moment.")}
                  </p>
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-56 p-5">
                  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 text-center">
                    <Database className="mb-3 h-7 w-7 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">
                      No vector records found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try changing your search or filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow
                  key={record.id}
                  className="border-slate-100 hover:bg-primary/[0.035]"
                >
                  <TableCell className="px-5 py-4">
                    <Checkbox
                      checked={selectedIds.includes(record.id)}
                      onCheckedChange={(checked) =>
                        toggleOne(record.id, checked)
                      }
                      aria-label={`Select record ${record.id}`}
                    />
                  </TableCell>
                  <TableCell className="px-3 py-4">
                    <div className="space-y-2">
                      <SourceBadge value={record.source_type} />
                      <p
                        className="max-w-40 truncate font-mono text-[11px] text-slate-500"
                        title={record.source_id}
                      >
                        {shortId(record.source_id)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xl whitespace-normal px-3 py-4">
                    <p className="line-clamp-3 text-sm leading-6 text-slate-700">
                      {record.content || "No content"}
                    </p>
                  </TableCell>
                  {searchQuery ? (
                    <TableCell className="px-3 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {record?.distance}
                      </p>
                    </TableCell>
                  ) : (
                    <TableCell className="px-3 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {formatDate(record.updated_at)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Created {formatDate(record.created_at)}
                      </p>
                    </TableCell>
                  )}
                  <TableCell className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="View record"
                        onClick={() => setRecordToView(record)}
                      >
                        <Eye />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Delete record"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setDeleteTarget(record)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!searchQuery && totalItems > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                  setSelectedIds([]);
                }}
              >
                <SelectTrigger className="h-9 w-20 rounded-xl border-slate-200 bg-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, totalItems)} of {totalItems}
              </p>
            </div>
            <Pagination
              page={page}
              setPage={(value) => {
                setPage(value);
                setSelectedIds([]);
              }}
              total={totalItems}
              pageSize={pageSize}
            />
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(recordToView)}
        onOpenChange={(open) => !open && setRecordToView(null)}
      >
        <DialogContent className="max-h-[88vh] overflow-y-auto rounded-3xl sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vector record</DialogTitle>
            <DialogDescription>
              Complete stored content and metadata.
            </DialogDescription>
          </DialogHeader>
          {recordToView && (
            <div className="space-y-5 pt-2">
              <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Record ID
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-700">
                    {recordToView.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Source ID
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-700">
                    {recordToView.source_id || "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Source type
                  </p>
                  <div className="mt-1">
                    <SourceBadge value={recordToView.source_type} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Destination ID
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-700">
                    {recordToView.destination_id ||
                      recordToView.metadata?.destination_id ||
                      "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Created
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {formatDate(recordToView.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Updated
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {formatDate(recordToView.updated_at)}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Content
                </p>
                <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                  {recordToView.content || "No content"}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Metadata
                </p>
                <pre className="max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-emerald-300">
                  {formatMetadata(recordToView.metadata)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle>
              {deleteTarget === "bulk"
                ? `Delete ${selectedIds.length} records?`
                : "Delete vector record?"}
            </DialogTitle>
            <DialogDescription className="pt-2">
              This permanently removes the selected vector{" "}
              {deleteTarget === "bulk" && selectedIds.length !== 1
                ? "records"
                : "record"}
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-3">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <span className="spinner spinner-white" />
              ) : (
                <>
                  <Trash2 /> Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default VectorStorePage;
