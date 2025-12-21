import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ellipsis } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Select, SelectItem, SelectContent, SelectTrigger } from "../ui/select";

const ReusableTable = ({
  data,
  columns,
  isLoading,
  totalItems,
  page,
  setPage,
  pageSize,
  setPageSize,
  table_options,
  className,
}) => {
  return (
    <section className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, i) => (
              <TableHead
                key={column.accessorKey}
                className={i === columns.length - 1 ? "text-right" : ""}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-40">
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <span className="spinner"></span>
                  <span>Loading Data</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, i) => (
              <TableRow key={i}>
                {columns.map((column, j) => (
                  <TableCell
                    key={j}
                    className={j === columns.length - 1 ? "text-right " : ""}
                  >
                    {column.accessorKey === "action" ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-full">
                          <Ellipsis className="h-9 w-9 rounded-full hover:bg-gray-200 tr p-2.5 rounded-full" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {table_options?.map((option, idx) => (
                            <DropdownMenuItem
                              key={idx}
                              onClick={() => option?.action(item["id"])}
                            >
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      item[column.accessorKey]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flx gap-4 mt-6">
        <Select
          value={String(pageSize)}
          onValueChange={(value) => setPageSize(Number(value))}
        >
          <SelectTrigger>{pageSize}</SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm px-2 text-muted-foreground">
          Showing {(page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize + pageSize, totalItems)} of {totalItems}{" "}
          items
        </p>
      </div>
    </section>
  );
};

export default ReusableTable;
