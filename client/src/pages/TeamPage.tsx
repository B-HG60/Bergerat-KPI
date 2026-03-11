import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

export function TeamPage() {
  const { toast } = useToast();
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    api.getUsers()
      .then(setTeam)
      .catch(() => toast('Erreur lors du chargement', 'error'));
  }, []);

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrateur',
    MANAGER: 'Manager',
    COLLABORATEUR: 'Collaborateur',
  };

  return (
    <div>
      <Header title="Mon équipe" />
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Membres de l'équipe ({team.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Nom</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Email</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Poste</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Rôle</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map(member => (
                    <tr key={member.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{member.firstName} {member.lastName}</td>
                      <td className="py-3 px-2 text-gray-500">{member.email}</td>
                      <td className="py-3 px-2 text-gray-500">{member.position || '—'}</td>
                      <td className="py-3 px-2">
                        <Badge variant="secondary">{roleLabels[member.role] || member.role}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {team.length === 0 && (
                <p className="text-center text-gray-500 py-8">Aucun membre dans l'équipe.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
