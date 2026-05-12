import { Button } from "@/components/atoms/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  pageNumber: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function Pagination({
  pageNumber,
  hasNextPage,
  hasPreviousPage,
  onNext,
  onBack,
  isLoading
}: PaginationProps) {
  if (!hasNextPage && !hasPreviousPage) return null;

  return (
    <div className="flex justify-center items-center gap-4 py-8">
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPreviousPage || isLoading}
        onClick={onBack}
        className="rounded-xl border-border/40 hover:bg-slate-50 dark:hover:bg-white/5 transition-all gap-2"
      >
        <ChevronLeft className="w-4 h-4" /> Anterior
      </Button>
      <div className="text-sm font-medium text-muted-foreground">
        Página {pageNumber}
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={!hasNextPage || isLoading}
        onClick={onNext}
        className="rounded-xl border-border/40 hover:bg-slate-50 dark:hover:bg-white/5 transition-all gap-2"
      >
        Próxima <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
