import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEMESTERS, SORT_OPTIONS } from "@/lib/constants";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  semester: string;
  onSemesterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function FilterBar({
  search,
  onSearchChange,
  semester,
  onSemesterChange,
  sortBy,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card rounded-xl border border-border shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes by title or subject..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={semester} onValueChange={onSemesterChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="All Semesters" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Semesters</SelectItem>
          {SEMESTERS.map((sem) => (
            <SelectItem key={sem} value={sem.toString()}>
              Semester {sem}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
