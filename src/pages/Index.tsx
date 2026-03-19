import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FilterBar } from "@/components/FilterBar";
import { NotesGrid } from "@/components/NotesGrid";
import { useNotes, NoteFilters } from "@/hooks/useNotes";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const Index = () => {
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const debouncedSearch = useDebouncedValue(search, 300);

  const filters: NoteFilters = useMemo(() => ({
    semester: semester !== "all" ? parseInt(semester) : undefined,
    search: debouncedSearch || undefined,
    sortBy: sortBy as NoteFilters["sortBy"],
  }), [semester, debouncedSearch, sortBy]);

  const { data: notes, isLoading } = useNotes(filters);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            semester={semester}
            onSemesterChange={setSemester}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        <NotesGrid notes={notes} isLoading={isLoading} />
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>
          CampusNotes Hub — Open-source, community-driven notes sharing platform
        </p>
      </footer>
    </div>
  );
};

export default Index;
