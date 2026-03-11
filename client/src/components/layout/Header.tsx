import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export function Header({ title }: { title: string }) {
  const { isCollaborateur } = useAuth();

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {isCollaborateur && (
        <Badge variant="secondary" className="text-xs">
          Lecture seule
        </Badge>
      )}
    </header>
  );
}
