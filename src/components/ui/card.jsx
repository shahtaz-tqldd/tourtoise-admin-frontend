import { cn } from "@/lib/utils";
import React from "react";

const Card = ({ children, className }) => {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl bg-white p-6 shadow-sm shadow-slate-200/70 border border-slate-200/80",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Card;
