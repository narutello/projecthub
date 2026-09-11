import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/components/locale-provider";
import { CATEGORIES, STATUSES } from "@/lib/utils";

export type FilterState = {
  q: string;
  category: string;
  status: string;
};

export function ProjectFilters({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const { t } = useLocale();

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_12rem_12rem]">
      <label className="relative block">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.q}
          onChange={(event) => onChange({ ...value, q: event.target.value })}
          placeholder={t.home.searchPlaceholder}
          className="ps-10"
          aria-label={t.home.searchPlaceholder}
        />
      </label>
      <Select
        value={value.category}
        onValueChange={(category) => onChange({ ...value, category })}
      >
        <SelectTrigger aria-label={t.form.category}>
          <SelectValue placeholder={t.home.allCategories} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.home.allCategories}</SelectItem>
          {CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {t.category[category]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={value.status}
        onValueChange={(status) => onChange({ ...value, status })}
      >
        <SelectTrigger aria-label={t.form.status}>
          <SelectValue placeholder={t.home.allStatuses} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.home.allStatuses}</SelectItem>
          {STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {t.status[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
