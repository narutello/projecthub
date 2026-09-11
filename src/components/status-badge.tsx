import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/locale-provider";
import type { ProjectStatus } from "@/lib/utils";

const variant: Record<ProjectStatus, "live" | "progress" | "archived"> = {
  live: "live",
  in_progress: "progress",
  archived: "archived",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { t } = useLocale();
  return <Badge variant={variant[status]}>{t.status[status]}</Badge>;
}
