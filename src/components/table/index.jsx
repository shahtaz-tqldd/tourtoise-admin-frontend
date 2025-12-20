import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ellipsis } from "lucide-react";

const ReusableTable = ({
  data,
  columns,
  isLoading,
  totalItems,
  page,
  page_size,
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
            <div className="h-40 w-full flex flex-col text-center gap-4 center">
              <span className="spinner"></span>
              <span>Loading Data</span>
            </div>
          ) : (
            data.map((item, i) => (
              <TableRow key={i}>
                {columns.map((column, j) => (
                  <TableCell
                    key={j}
                    className={j === columns.length - 1 ? "text-right " : ""}
                  >
                    {column.accessorKey === "action" ? (
                      <button className="">
                        <Ellipsis className="h-9 w-9 rounded-full hover:bg-primary/10 p-2.5 tr" />
                      </button>
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
      <p className="text-sm px-2 mt-6 text-muted-foreground">
        Showing {(page - 1) * page_size + 1} to{" "}
        {Math.min(page * page_size + page_size, totalItems)} of {totalItems}{" "}
        items
      </p>
    </section>
  );
};

export default ReusableTable;
