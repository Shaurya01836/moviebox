import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
    </div>
  );
}
