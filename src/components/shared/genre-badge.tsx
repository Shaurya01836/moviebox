import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

interface GenreBadgeProps {
  name: string;
  className?: string;
}

export function GenreBadge({ name, className }: GenreBadgeProps) {
  return (
    <Badge variant="glass" className={cn('text-[11px] font-medium tracking-normal text-zinc-300', className)}>
      {name}
    </Badge>
  );
}
