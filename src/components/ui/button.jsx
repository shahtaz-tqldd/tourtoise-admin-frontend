import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";
import { Trash2 } from "lucide-react";

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

const DeleteButton = ({ onClick, disabled, className = "" }) => {
  return (
    <button
      className={cn(
        "center size-10 rounded-full bg-red-100 text-red-600 border border-red-500/20 hover:bg-red-200/75 hover:text-red-500 tr",
        className,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <Trash2 size={16} />
    </button>
  );
};

export { Button, DeleteButton };
