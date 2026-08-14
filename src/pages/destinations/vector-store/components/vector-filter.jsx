import { Filter, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sourceTypes = ["destination", "attraction", "cuisine", "activity"];

const VectorFilter = ({
  sourceType,
  destinationId,
  sourceId,
  onSourceTypeChange,
  onDestinationIdChange,
  onSourceIdChange,
  onReset,
}) => {
  const hasFilters = sourceType !== "all" || destinationId || sourceId;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
            <Filter className="h-4 w-4" />
          </span>
          Filters
        </div>
        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw /> Reset filters
          </Button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Select value={sourceType} onValueChange={onSourceTypeChange}>
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
          onChange={(event) => onDestinationIdChange(event.target.value)}
          placeholder="Destination ID"
          aria-label="Filter by destination ID"
          className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-none"
        />
        <Input
          value={sourceId}
          onChange={(event) => onSourceIdChange(event.target.value)}
          placeholder="Source ID"
          aria-label="Filter by source ID"
          className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-none"
        />
      </div>
    </div>
  );
};

export default VectorFilter;
