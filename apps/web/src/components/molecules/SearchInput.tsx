import { Search } from "lucide-react";
import { Input } from "@/components/atoms/input";
import { cn } from "@/lib/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string;
}

export function SearchInput({ wrapperClassName, className, ...props }: SearchInputProps) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        className={cn("pl-10 h-11 rounded-xl", className)}
        {...props}
      />
    </div>
  );
}
