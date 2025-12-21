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
import { useCreateActivityTypeMutation } from "@/features/destination/destinationApiSlice";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

const AddActivityTypeDialog = ({ open, setOpen }) => {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const [createActivityType, { isLoading }] = useCreateActivityTypeMutation();

  const onSubmit = async (data) => {
    const res = await createActivityType(data);

    if (res && res.data?.success) {
      toast.success("New Activity Type has been addedd!");
      setOpen(false);
      setValue({
        name: "",
        description: "",
      });
    } else {
      toast.error("Failed to create Activity type");
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[468px]">
        <DialogHeader>
          <DialogTitle>Activity Type</DialogTitle>
          <DialogDescription>
            Add new activity type for creating destination specific activities
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 mt-4">
          <div className="flex-1">
            <Label>Activity Type Name</Label>
            <Input
              placeholder="e.g., Surfing"
              {...register(`name`, {
                required: true,
              })}
              className="mt-1.5"
            />
          </div>

          <div>
            <Textarea
              placeholder="Additional notes about this activity type..."
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

export default AddActivityTypeDialog;
