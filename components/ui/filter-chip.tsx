import {
  buttonBase,
  buttonVariants,
  buttonSizes,
} from "@/components/ui/button";
import { cn } from "@/lib/cn";

type FilterChipProps = {
  active?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function FilterChip({ active, className, ...rest }: FilterChipProps) {
  return (
    <button
      className={cn(
        buttonBase,
        buttonSizes.sm,
        active ? buttonVariants.primary : buttonVariants.ghost,
        className
      )}
      {...rest}
    />
  );
}
