import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
export type PeriodType = 'current-month' | 'last-3-months' | 'last-6-months' | 'current-year' | 'custom';
interface PeriodFilterProps {
  value: PeriodType;
  onChange: (value: PeriodType) => void;
}
export const PeriodFilter = ({
  value,
  onChange
}: PeriodFilterProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <CalendarIcon className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Selecionar período" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="current-month">Mês Atual</SelectItem>
        <SelectItem value="last-3-months">Últimos 3 Meses</SelectItem>
        <SelectItem value="last-6-months">Últimos 6 Meses</SelectItem>
        <SelectItem value="current-year">Ano Atual</SelectItem>
        <SelectItem value="custom">Personalizado</SelectItem>
      </SelectContent>
    </Select>
  );
};