import ReusableTable from "@/components/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/ui/status";
import { TableProfile } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Title } from "@/components/ui/typography";
import {
  useBulkUploadMutation,
  useDeleteDestinationMutation,
  useDestinationListQuery,
  useDownloadTemplateQuery,
  useScrapDestinationMutation,
} from "@/features/destination/destinationApiSlice";
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  Loader2,
  Plus,
  Upload,
  WandSparkles,
} from "lucide-react";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DestinationsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloadRequested, setDownloadRequested] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [scrapDialogOpen, setScrapDialogOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [scrapForm, setScrapForm] = useState({
    name: "",
    country: "",
    longitude: "",
    latitude: "",
    address: "",
    urls: "",
  });

  const destinationColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Country", accessorKey: "country" },
    { header: "Type", accessorKey: "destination_type" },
    { header: "Budget", accessorKey: "budget_tier" },
    { header: "Tags", accessorKey: "tags" },
    { header: "Best Time", accessorKey: "best_time" },
    { header: "Status", accessorKey: "status" },
    { header: "Updated", accessorKey: "updated_at" },
    { header: "Action", accessorKey: "action" },
  ];

  const { data: destinationData, isLoading } = useDestinationListQuery({
    page: page,
    page_size: pageSize,
  });

  const {
    data: templateData,
    isFetching: templateDownloading,
    error: templateError,
    refetch: refetchTemplate,
  } = useDownloadTemplateQuery(undefined, {
    skip: !downloadRequested,
  });

  const [deleteDestination, { isLoading: deleteLoading }] =
    useDeleteDestinationMutation();
  const [bulkUpload, { isLoading: bulkUploading }] = useBulkUploadMutation();
  const [scrapDestination, { isLoading: scrapLoading }] =
    useScrapDestinationMutation();

  const saveBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const getTemplatePayload = (responseData = templateData) =>
    responseData?.data || responseData;

  const buildCsvTemplate = (template) => {
    const columns = template?.csv_columns || [];
    const examples = template?.examples || {};
    const rows = [
      {
        record_type: "destination",
        ...(examples.destinations || {}),
      },
      {
        record_type: "attraction",
        ...(examples.attractions || {}),
      },
      {
        record_type: "activity",
        ...(examples.activities || {}),
      },
      {
        record_type: "cuisine",
        ...(examples.cuisines || {}),
      },
    ];

    const escapeCell = (value) => {
      const stringValue = value == null ? "" : String(value);

      if (/[",\n\r]/.test(stringValue)) {
        return `"${stringValue.replaceAll('"', '""')}"`;
      }

      return stringValue;
    };

    return [
      columns.map(escapeCell).join(","),
      ...rows.map((row) =>
        columns.map((column) => escapeCell(row[column])).join(","),
      ),
    ].join("\n");
  };

  const buildXlsxTemplate = (template) => {
    const workbook = XLSX.utils.book_new();
    const sheets = template?.xlsx_sheets || {};
    const examples = template?.examples || {};

    Object.entries(sheets).forEach(([sheetName, headers]) => {
      const example = examples[sheetName] || {};
      const rows = [headers, headers.map((header) => example[header] || "")];
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    if (template?.allowed_values) {
      const allowedRows = [["field", "allowed_values"]];
      Object.entries(template.allowed_values).forEach(([field, values]) => {
        allowedRows.push([
          field,
          Array.isArray(values) ? values.join(";") : values,
        ]);
      });
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.aoa_to_sheet(allowedRows),
        "allowed_values",
      );
    }

    if (template?.notes?.length) {
      const noteRows = [["notes"], ...template.notes.map((note) => [note])];
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.aoa_to_sheet(noteRows),
        "notes",
      );
    }

    return workbook;
  };

  useEffect(() => {
    if (templateError) {
      toast.error("Template could not be downloaded");
    }
  }, [templateError]);

  const handleDeleteDestination = async (dest_id) => {
    try {
      await deleteDestination(dest_id).unwrap();
      toast.success("Destination deleted successfully");
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error?.[0] ||
        "Destination could not be deleted";
      toast.error(message);
    }
  };

  const handleView = (dest_id) => {
    navigate(`/destinations/${dest_id}`);
  };

  const handleUpdate = (dest_id) => {
    navigate(`/destinations/update/${dest_id}`);
  };

  const handleOpenTemplateDialog = () => {
    setTemplateDialogOpen(true);
    setDownloadRequested(true);
  };

  const handleTemplateDownload = async (format) => {
    try {
      let template = getTemplatePayload();

      if (!template) {
        const response = await refetchTemplate();
        if (response?.error) {
          toast.error("Template could not be downloaded");
          return;
        }
        template = getTemplatePayload(response?.data);
      }

      if (!template) {
        toast.error("Template data is not available");
        return;
      }

      if (format === "csv") {
        const csv = buildCsvTemplate(template);
        saveBlob(
          new Blob([csv], { type: "text/csv;charset=utf-8;" }),
          "destination-bulk-template.csv",
        );
      } else {
        XLSX.writeFile(
          buildXlsxTemplate(template),
          "destination-bulk-template.xlsx",
        );
      }

      toast.success("Template downloaded");
      setTemplateDialogOpen(false);
    } catch {
      toast.error("Template could not be downloaded");
    }
  };

  const handleBulkUpload = async (event) => {
    event.preventDefault();

    if (!bulkFile) {
      toast.error("Select a CSV or XLSX file first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", bulkFile);

      await bulkUpload(formData).unwrap();
      toast.success("Bulk upload submitted");
      setBulkFile(null);
      setBulkDialogOpen(false);
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error?.[0] ||
        "Bulk upload could not be submitted";
      toast.error(message);
    }
  };

  const handleScrapChange = (event) => {
    const { name, value } = event.target;
    setScrapForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleScrapDestination = async (event) => {
    event.preventDefault();

    const urls = scrapForm.urls
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter(Boolean);

    if (!urls.length) {
      toast.error("Add at least one URL to scrape");
      return;
    }

    try {
      await scrapDestination({
        name: scrapForm.name,
        country: scrapForm.country,
        longitude: scrapForm.longitude,
        latitude: scrapForm.latitude,
        address: scrapForm.address,
        urls,
      }).unwrap();

      toast.success("Destination scrape submitted");
      setScrapForm({
        name: "",
        country: "",
        longitude: "",
        latitude: "",
        address: "",
        urls: "",
      });
      setScrapDialogOpen(false);
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error?.[0] ||
        "Destination scrape could not be submitted";
      toast.error(message);
    }
  };

  const table_options = [
    {
      label: "View",
      action: handleView,
    },
    {
      label: "Update",
      action: handleUpdate,
    },
    {
      label: "Delete",
      type: "delete",
    },
  ];

  const destinations =
    destinationData?.data?.map((item) => ({
      ...item,
      name: (
        <TableProfile
          name={item.name}
          email={item.slug || item.tagline || "No slug"}
          profile_img_url={item.cover_image}
          thumbnail_img_url={
            item.cover_image_thumbnail ||
            item.thumbnail_image ||
            item.thumbnail ||
            item.image_thumbnail
          }
          non_rounded
        />
      ),
      destination_type: (
        <span className="capitalize">
          {item.destination_type?.replaceAll("_", " ") || "N/A"}
        </span>
      ),
      budget_tier: (
        <span className="capitalize">
          {item.budget_tier?.replaceAll("_", " ") || "N/A"}
        </span>
      ),
      best_time: item.best_travel_months?.length
        ? item.best_travel_months
            .map((month) => monthLabels[Number(month) - 1])
            .filter(Boolean)
            .join(", ")
        : "N/A",
      status: <StatusBadge status={item.status || "draft"} />,
      updated_at: item.updated_at
        ? moment(item.updated_at).format("MMM D, YYYY")
        : "N/A",
      tags: (
        <div className="flex max-w-[220px] flex-wrap gap-1">
          {item.tags?.length ? (
            item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id || tag.slug || tag.name}
                className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-xs capitalize text-primary"
              >
                {tag.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">No tags</span>
          )}
          {item.tags?.length > 3 && (
            <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              +{item.tags.length - 3}
            </span>
          )}
        </div>
      ),
    })) || [];
  const total_item =
    destinationData?.meta?.count || destinationData?.meta?.total || 0;

  return (
    <section className="space-y-8">
      <div className="flbx">
        <Title variant="lg">Destinations</Title>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={templateDownloading} className="rounded-full !pl-4">
              {templateDownloading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Plus size={16} />
              )}
              Add Destination
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-1">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/destinations/new-destination")}
            >
              <Plus size={16} />
              Add new destination
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleOpenTemplateDialog}
            >
              {templateDownloading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Download size={16} />
              )}
              Download template
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setBulkDialogOpen(true)}
            >
              <Upload size={16} />
              Bulk upload
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setScrapDialogOpen(true)}
            >
              <WandSparkles size={16} />
              Scrap destination
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
        onDeleteConfirm={handleDeleteDestination}
        deleteLoading={deleteLoading}
        className="mt-4"
      />

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Download template</DialogTitle>
            <DialogDescription>
              Choose the template format for destination bulk upload.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={templateDownloading}
              onClick={() => handleTemplateDownload("xlsx")}
              className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-5 text-center transition hover:border-primary hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-50"
            >
              <FileSpreadsheet className="text-primary" size={32} />
              <span className="text-sm font-semibold text-slate-900">
                XLSX workbook
              </span>
              <span className="text-xs text-slate-500">
                Four sheets plus notes
              </span>
            </button>
            <button
              type="button"
              disabled={templateDownloading}
              onClick={() => handleTemplateDownload("csv")}
              className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-5 text-center transition hover:border-primary hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-50"
            >
              <Download className="text-primary" size={32} />
              <span className="text-sm font-semibold text-slate-900">
                CSV file
              </span>
              <span className="text-xs text-slate-500">
                Combined upload columns
              </span>
            </button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTemplateDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <form onSubmit={handleBulkUpload} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Bulk upload destinations</DialogTitle>
              <DialogDescription>
                Upload a CSV or XLSX file using the destination template.
              </DialogDescription>
            </DialogHeader>

            <Label
              htmlFor="bulk-upload-file"
              className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-primary hover:bg-primary/5"
            >
              <FileSpreadsheet className="text-primary" size={36} />
              <span className="text-sm font-semibold text-slate-900">
                {bulkFile ? bulkFile.name : "Choose CSV or XLSX file"}
              </span>
              <span className="text-xs font-normal text-slate-500">
                Supported formats: .csv, .xls, .xlsx
              </span>
              <Input
                id="bulk-upload-file"
                type="file"
                accept=".csv,.xls,.xlsx"
                className="sr-only"
                onChange={(event) =>
                  setBulkFile(event.target.files?.[0] || null)
                }
              />
            </Label>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBulkDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={bulkUploading}>
                {bulkUploading && <Loader2 className="animate-spin" />}
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={scrapDialogOpen} onOpenChange={setScrapDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <form onSubmit={handleScrapDestination} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Scrap destination</DialogTitle>
              <DialogDescription>
                Add destination details and one or more source URLs.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="scrap-name">Destination name</Label>
                <Input
                  id="scrap-name"
                  name="name"
                  value={scrapForm.name}
                  onChange={handleScrapChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scrap-country">Country</Label>
                <Input
                  id="scrap-country"
                  name="country"
                  value={scrapForm.country}
                  onChange={handleScrapChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scrap-longitude">Longitude</Label>
                <Input
                  id="scrap-longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={scrapForm.longitude}
                  onChange={handleScrapChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scrap-latitude">Latitude</Label>
                <Input
                  id="scrap-latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={scrapForm.latitude}
                  onChange={handleScrapChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scrap-address">Address</Label>
              <Input
                id="scrap-address"
                name="address"
                value={scrapForm.address}
                onChange={handleScrapChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scrap-urls">URLs to scrape</Label>
              <Textarea
                id="scrap-urls"
                name="urls"
                value={scrapForm.urls}
                onChange={handleScrapChange}
                placeholder="https://example.com/destination&#10;https://example.com/guide"
                className="min-h-28"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setScrapDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={scrapLoading}>
                {scrapLoading && <Loader2 className="animate-spin" />}
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default DestinationsPage;
