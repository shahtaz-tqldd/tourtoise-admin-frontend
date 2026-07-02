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
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  Loader2,
  Plus,
  Upload,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const getTemplatePayload = (responseData) => responseData?.data || responseData;

const getTemplateColumns = (template, templateKey) =>
  template?.csv_columns ||
  template?.columns ||
  template?.headers ||
  template?.xlsx_sheets?.[templateKey] ||
  [];

const getTemplateExample = (template, templateKey) =>
  template?.examples?.[templateKey] ||
  template?.example ||
  template?.sample ||
  {};

const escapeCsvCell = (value) => {
  const stringValue = value == null ? "" : String(value);

  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
};

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

const buildCsvTemplate = (template, templateKey) => {
  const columns = getTemplateColumns(template, templateKey);
  const example = getTemplateExample(template, templateKey);

  return [
    columns.map(escapeCsvCell).join(","),
    columns.map((column) => escapeCsvCell(example[column])).join(","),
  ].join("\n");
};

const buildXlsxTemplate = (template, templateKey, sheetName) => {
  const workbook = XLSX.utils.book_new();
  const columns = getTemplateColumns(template, templateKey);
  const example = getTemplateExample(template, templateKey);
  const rows = [columns, columns.map((column) => example[column] || "")];

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet(rows),
    sheetName,
  );

  if (template?.allowed_values) {
    const allowedRows = [["field", "allowed_values"]];
    Object.entries(template.allowed_values).forEach(([field, values]) => {
      allowedRows.push([field, Array.isArray(values) ? values.join(";") : values]);
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

const DestinationContentActions = ({
  label,
  addPath,
  templateKey,
  templateData,
  templateError,
  templateDownloading,
  refetchTemplate,
  setDownloadRequested,
  uploadBulk,
  bulkUploading,
}) => {
  const navigate = useNavigate();
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const normalizedLabel = label.toLowerCase();

  useEffect(() => {
    if (templateError) {
      toast.error("Template could not be downloaded");
    }
  }, [templateError]);

  const handleOpenTemplateDialog = () => {
    setTemplateDialogOpen(true);
    setDownloadRequested(true);
  };

  const handleTemplateDownload = async (format) => {
    try {
      let template = getTemplatePayload(templateData);

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
        const csv = buildCsvTemplate(template, templateKey);
        saveBlob(
          new Blob([csv], { type: "text/csv;charset=utf-8;" }),
          `${templateKey}-bulk-template.csv`,
        );
      } else {
        XLSX.writeFile(
          buildXlsxTemplate(template, templateKey, label),
          `${templateKey}-bulk-template.xlsx`,
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

      await uploadBulk(formData).unwrap();
      toast.success("Bulk upload submitted");
      setBulkFile(null);
      setBulkDialogOpen(false);
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error?.[0] ||
        error?.data?.detail ||
        "Bulk upload could not be submitted";
      toast.error(message);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={templateDownloading} className="rounded-full !pl-4">
            {templateDownloading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Plus size={16} />
            )}
            Add {label}
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl p-1">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigate(addPath)}
          >
            <Plus size={16} />
            Add new {normalizedLabel}
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
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Download template</DialogTitle>
            <DialogDescription>
              Choose the template format for {normalizedLabel} bulk upload.
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
                Includes allowed values
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
                Upload columns only
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
              <DialogTitle>Bulk upload {normalizedLabel}</DialogTitle>
              <DialogDescription>
                Upload a CSV or XLSX file using the {normalizedLabel} template.
              </DialogDescription>
            </DialogHeader>

            <Label
              htmlFor={`${templateKey}-bulk-upload-file`}
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
                id={`${templateKey}-bulk-upload-file`}
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
    </>
  );
};

export default DestinationContentActions;
