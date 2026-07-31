import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileDigit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getMutationError } from "@/features/auth/hooks/use-auth";
import { useTranslation } from "@/lib/i18n";
import { apiClient } from "@/lib/api/client";

const statusChangeSchema = Yup.object().shape({
  status: Yup.string().oneOf(["ACTIVE", "SOLD", "DEAD", "CULLED"]).required(),
  sale_price: Yup.string().when("status", {
    is: "SOLD",
    then: () => Yup.string().required("Sale price is required when status is SOLD."),
    otherwise: () => Yup.string(),
  }),
  sale_date: Yup.string(),
  cull_reason: Yup.string(),
});

interface StatusChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cattleId: number;
  currentStatus: string;
}

export function StatusChangeModal({ open, onOpenChange, cattleId, currentStatus }: StatusChangeModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.patch(`/cattle/${cattleId}/`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cattle", cattleId] });
      queryClient.invalidateQueries({ queryKey: ["cattle"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onOpenChange(false);
    },
  });

  const formik = useFormik({
    initialValues: {
      status: currentStatus,
      sale_price: "",
      sale_date: format(new Date(), "yyyy-MM-dd"),
      cull_reason: "",
    },
    validationSchema: statusChangeSchema,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    formik.setFieldValue("status", val);
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={t('cattle.status_change.title')}
    >
      <div className="mb-6 space-y-2">
        <p className="text-sm text-muted-foreground">
          {t('cattle.status_change.description')}
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Select 
            label={t('common.status')}
            value={selectedStatus} 
            onChange={(e) => handleStatusChange(e.target.value)}
            options={[
              { value: "ACTIVE", label: t('cattle.status.ACTIVE') },
              { value: "SOLD", label: t('cattle.status.SOLD') },
              { value: "CULLED", label: t('cattle.status.CULLED') },
              { value: "DEAD", label: t('cattle.status.DEAD') },
            ]}
          />
        </div>

        {selectedStatus === "SOLD" && (
          <>
            <div className="flex items-center gap-2 p-3 bg-primary/5 text-primary border border-primary/20 rounded-md text-sm">
              <FileDigit className="h-4 w-4 shrink-0" />
              <p>{t('cattle.status_change.sale_info')}</p>
            </div>
            <div className="space-y-2">
              <Input 
                label={t('cattle.status_change.sale_price')}
                type="number" 
                step="0.01" 
                name="sale_price"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.sale_price}
                placeholder="e.g. 85000.00" 
              />
              {formik.errors.sale_price && formik.touched.sale_price && (
                <p className="text-sm text-destructive">{String(formik.errors.sale_price)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Input 
                label={t('cattle.status_change.sale_date')}
                type="date" 
                name="sale_date"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.sale_date} 
              />
            </div>
          </>
        )}

        {(selectedStatus === "CULLED" || selectedStatus === "DEAD") && (
          <div className="space-y-2">
            <Input 
              label={t('cattle.status_change.reason')}
              name="cull_reason"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.cull_reason}
              placeholder={t('cattle.status_change.reason_placeholder')} 
            />
          </div>
        )}

        {mutation.isError && (
          <p className="text-sm text-destructive">{getMutationError(mutation.error).message}</p>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={mutation.isPending || selectedStatus === currentStatus}>
            {mutation.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
