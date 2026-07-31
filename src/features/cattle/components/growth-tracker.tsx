import { useState } from "react";
import { Scale, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getMutationError } from "@/features/auth/hooks/use-auth";
import { useTranslation } from "@/lib/i18n";
import { apiClient } from "@/lib/api/client";

const growthSchema = Yup.object().shape({
  date: Yup.string().required("Date is required"),
  weight_kg: Yup.string(),
  bcs: Yup.string(),
  notes: Yup.string(),
}).test(
  'has-weight-or-bcs',
  'Either weight or BCS must be provided',
  function (value) {
    return !!value.weight_kg || !!value.bcs;
  }
);

export function GrowthTracker({ cattleId, latestBcs, latestWeight, logs }: { cattleId: number, latestBcs: number | null, latestWeight: number | null, logs: any[] }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  
  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await apiClient.post(`/cattle/${cattleId}/growth/`, values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cattle", cattleId] });
      setIsAdding(false);
      formik.resetForm();
    },
  });

  const formik = useFormik({
    initialValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      weight_kg: "",
      bcs: "",
      notes: "",
    },
    validationSchema: growthSchema,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Scale className="h-5 w-5 text-muted-foreground" />
          {t('cattle.growth.title')}
        </h2>
        <Button variant="secondary" size="sm" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? t('common.cancel') : t('cattle.growth.add_log')}
        </Button>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <form onSubmit={formik.handleSubmit} className="mb-6 p-4 border rounded-lg bg-muted/20 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Input 
                  label={t('common.date')}
                  type="date" 
                  name="date"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.date} 
                />
              </div>
              <div className="space-y-2">
                <Input 
                  label={t('cattle.growth.weight_kg')}
                  type="number" 
                  step="0.1" 
                  name="weight_kg"
                  placeholder="e.g. 450.5" 
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.weight_kg} 
                />
              </div>
              <div className="space-y-2">
                <Input 
                  label={t('cattle.growth.bcs')}
                  type="number" 
                  step="0.25" 
                  min="1.0" 
                  max="5.0" 
                  name="bcs"
                  placeholder="e.g. 3.25" 
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.bcs} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Textarea 
                label={t('common.notes')}
                name="notes"
                placeholder={t('cattle.growth.notes_placeholder')} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.notes} 
              />
            </div>
            
            {formik.errors.bcs && formik.touched.bcs && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> {String(formik.errors.bcs)}
              </p>
            )}
            {formik.errors.date && typeof formik.errors === 'string' && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> {formik.errors}
              </p>
            )}
            {mutation.isError && (
              <p className="text-sm text-destructive">{getMutationError(mutation.error).message}</p>
            )}
            
            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        )}

        <div className="flex gap-4 mb-6">
          <div className="flex-1 p-4 border rounded-lg bg-card flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('cattle.growth.latest_bcs')}</p>
              <p className="text-3xl font-bold">{latestBcs ? latestBcs.toFixed(2) : '--'}</p>
            </div>
            <TrendingUp className={`h-8 w-8 ${latestBcs && latestBcs < 2.25 ? 'text-destructive' : 'text-primary opacity-20'}`} />
          </div>
          <div className="flex-1 p-4 border rounded-lg bg-card flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('cattle.growth.latest_weight')}</p>
              <p className="text-3xl font-bold">{latestWeight ? `${latestWeight} kg` : '--'}</p>
            </div>
            <Scale className="h-8 w-8 text-primary opacity-20" />
          </div>
        </div>

        <div className="space-y-3">
          {logs && logs.length > 0 ? (
            logs.map(log => (
              <div key={log.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{log.date}</span>
                    {log.bcs && (
                      <Badge tone={Number(log.bcs) < 2.5 ? "danger" : "default"} className={Number(log.bcs) < 2.5 ? "" : "border-primary text-primary"}>
                        BCS: {log.bcs}
                      </Badge>
                    )}
                    {log.weight_kg && (
                      <Badge tone="default">
                        {log.weight_kg} kg
                      </Badge>
                    )}
                  </div>
                  {log.notes && <p className="text-sm text-muted-foreground mt-1">{log.notes}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">{t('cattle.growth.no_logs')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
