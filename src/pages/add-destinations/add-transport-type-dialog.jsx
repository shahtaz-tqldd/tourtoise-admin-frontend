import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTransportTypeMutation } from "@/features/destination/destinationApiSlice";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

const AddTransportTypeDialog = ({ open, setOpen }) => {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const [createTransportType, { isLoading }] = useCreateTransportTypeMutation();

  const onSubmit = async (data) => {
    const res = await createTransportType(data);

    if (res && res.data?.success) {
      toast.success("New Transport Type has been addedd!");
      setOpen(false);
      setValue({
        name: "",
        description: "",
      });
    } else {
      toast.error("Failed to create Transport type");
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[468px]">
        <DialogHeader>
          <DialogTitle>Transport Type</DialogTitle>
          <DialogDescription>
            Add new transport type for creating destination specific transport
            suggestions
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 mt-4">
          <div className="flex-1">
            <Label>Transport Type Name</Label>
            <Input
              placeholder="e.g., Taxi"
              {...register(`name`, {
                required: true,
              })}
              className="mt-1.5"
            />
          </div>

          <div>
            <Textarea
              placeholder="Additional notes about this transport type..."
              {...register(`description`)}
              className="min-h-[60px]"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit(onSubmit)} className="w-32">
            {isLoading ? (
              <span className="spinner spinner-white"></span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransportTypeDialog;
