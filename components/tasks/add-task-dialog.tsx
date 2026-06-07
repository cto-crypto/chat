"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TaskSchema, type TaskInput } from "@/lib/validations/schemas";

interface AddTaskDialogProps {
  relatedCaseId?: string;
  relatedPropertyId?: string;
  relatedContactId?: string;
  onCreated?: () => void;
}

export function AddTaskDialog({
  relatedCaseId,
  relatedPropertyId,
  relatedContactId,
  onCreated,
}: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      status: "PENDING",
      priority: "MEDIUM",
      reminderEnabled: false,
      relatedCaseId: relatedCaseId,
      relatedPropertyId: relatedPropertyId,
      relatedContactId: relatedContactId,
    },
  });

  const priority = watch("priority");
  const status = watch("status");
  const reminderEnabled = watch("reminderEnabled");

  async function onSubmit(data: TaskInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setDone(true);
        onCreated?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setDone(false);
      reset();
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button className="bg-[#1a2b1a] hover:bg-[#2d4a2d] text-white gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-7 w-7 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 text-lg">Task Created!</h3>
              <p className="text-sm text-gray-500 mt-1">The task has been added successfully.</p>
            </div>
            <Button onClick={handleClose} className="bg-[#1a2b1a] hover:bg-[#2d4a2d] text-white">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Call landlord about inspection"
                {...register("title")}
                className={errors.title ? "border-red-400" : ""}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                placeholder="Optional details…"
                {...register("description")}
              />
            </div>

            {/* Priority + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setValue("priority", v as TaskInput["priority"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setValue("status", v as TaskInput["status"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date + Assigned To */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" {...register("dueDate")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assignedToId">Assigned To (Staff ID)</Label>
                <Input
                  id="assignedToId"
                  placeholder="Staff ID (optional)"
                  {...register("assignedToId")}
                />
              </div>
            </div>

            {/* Related records */}
            {!relatedCaseId && (
              <div className="space-y-1.5">
                <Label htmlFor="relatedCaseId">Related Case ID</Label>
                <Input
                  id="relatedCaseId"
                  placeholder="Case ID (optional)"
                  {...register("relatedCaseId")}
                />
              </div>
            )}
            {!relatedPropertyId && (
              <div className="space-y-1.5">
                <Label htmlFor="relatedPropertyId">Related Property ID</Label>
                <Input
                  id="relatedPropertyId"
                  placeholder="Property ID (optional)"
                  {...register("relatedPropertyId")}
                />
              </div>
            )}
            {!relatedContactId && (
              <div className="space-y-1.5">
                <Label htmlFor="relatedContactId">Related Contact ID</Label>
                <Input
                  id="relatedContactId"
                  placeholder="Contact ID (optional)"
                  {...register("relatedContactId")}
                />
              </div>
            )}

            {/* Reminder toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
              <div>
                <p className="text-sm font-medium">Reminder</p>
                <p className="text-xs text-gray-500">Send a reminder notification when due</p>
              </div>
              <Switch
                checked={reminderEnabled}
                onCheckedChange={(v) => setValue("reminderEnabled", v)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#4caf50] hover:bg-[#43a047] text-white"
              >
                {submitting ? "Creating…" : "Create Task"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
