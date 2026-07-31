import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitCommitHorizontal } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export interface AncestorNode {
  id: number;
  tag_id: string;
  name: string;
  breed: string;
  sex: string;
}

export interface PedigreeTreeData {
  self: AncestorNode;
  mother: AncestorNode | null;
  father: AncestorNode | null;
  maternal_granddam: AncestorNode | null;
  maternal_grandsire: AncestorNode | null;
  paternal_granddam: AncestorNode | null;
  paternal_grandsire: AncestorNode | null;
  offspring: AncestorNode[];
}

function PedigreeNode({ node, label, gender }: { node: AncestorNode | null; label: string; gender?: 'MALE' | 'FEMALE' }) {
  const { t } = useTranslation();
  if (!node) {
    return (
      <div className="flex flex-col p-3 border border-dashed rounded-lg bg-muted/50 items-center justify-center h-20 opacity-50">
        <span className="text-xs text-muted-foreground">{t(`cattle.pedigree.unknown_${label.toLowerCase()}`)}</span>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col p-3 border rounded-lg ${gender === 'FEMALE' ? 'bg-pink-500/5 border-pink-500/20' : gender === 'MALE' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-card'}`}>
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t(`cattle.pedigree.${label.toLowerCase()}`)}</span>
      <div className="flex items-center gap-2">
        <span className="font-bold">{node.tag_id}</span>
        {node.name && <span className="text-sm text-muted-foreground truncate max-w-[80px]">{node.name}</span>}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <Badge tone="default" className="text-[10px] px-1.5 py-0 h-4">{node.breed || "Unknown"}</Badge>
      </div>
    </div>
  );
}

export function PedigreeTree({ data }: { data: PedigreeTreeData }) {
  const { t } = useTranslation();
  if (!data) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <GitCommitHorizontal className="h-5 w-5 text-muted-foreground" />
          {t('cattle.pedigree.title')}
        </h2>
      </CardHeader>
      <CardContent>
        <div className="relative flex flex-col gap-6">
          
          {/* Grandparents Row */}
          <div className="grid grid-cols-4 gap-2">
            <PedigreeNode node={data.paternal_grandsire} label="Grandsire" gender="MALE" />
            <PedigreeNode node={data.paternal_granddam} label="Granddam" gender="FEMALE" />
            <PedigreeNode node={data.maternal_grandsire} label="Grandsire" gender="MALE" />
            <PedigreeNode node={data.maternal_granddam} label="Granddam" gender="FEMALE" />
          </div>

          <div className="flex items-center justify-center -my-3 z-0">
            <div className="h-4 w-full flex items-end">
              <div className="w-1/4 border-r border-t border-muted-foreground/30 h-full rounded-tr" />
              <div className="w-1/4 border-l border-t border-muted-foreground/30 h-full rounded-tl" />
              <div className="w-1/4 border-r border-t border-muted-foreground/30 h-full rounded-tr" />
              <div className="w-1/4 border-l border-t border-muted-foreground/30 h-full rounded-tl" />
            </div>
          </div>

          {/* Parents Row */}
          <div className="grid grid-cols-2 gap-8 px-8 relative z-10">
            <PedigreeNode node={data.father} label="Sire" gender="MALE" />
            <PedigreeNode node={data.mother} label="Dam" gender="FEMALE" />
          </div>

          <div className="flex items-center justify-center -my-3 z-0">
            <div className="h-6 w-full flex items-end px-16">
              <div className="w-1/2 border-r border-t border-muted-foreground/30 h-full rounded-tr" />
              <div className="w-1/2 border-l border-t border-muted-foreground/30 h-full rounded-tl" />
            </div>
          </div>

          {/* Self Row */}
          <div className="flex justify-center relative z-10">
            <div className="w-1/2">
              <PedigreeNode node={data.self} label="Subject" gender={data.self?.sex === 'MALE' ? 'MALE' : 'FEMALE'} />
            </div>
          </div>

          {/* Offspring List (if any) */}
          {data.offspring && data.offspring.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                {t('cattle.pedigree.offspring')} ({data.offspring.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {data.offspring.map(child => (
                  <Badge key={child.id} tone="default" className="font-mono">
                    {child.tag_id} {child.sex === 'MALE' ? '♂' : '♀'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
