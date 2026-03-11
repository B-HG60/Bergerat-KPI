import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { todayISO, formatDate } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import type { AttendanceStatus } from '@/types';

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: 'PRESENT', label: 'Présent', color: 'bg-green-100 text-green-800' },
  { value: 'ABSENT', label: 'Absent', color: 'bg-red-100 text-red-800' },
  { value: 'CONGE', label: 'Congé', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'FORMATION', label: 'Formation', color: 'bg-blue-100 text-blue-800' },
];

export function AttendancePage() {
  const { canEdit } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState(todayISO());
  const [data, setData] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCollab, setNewCollab] = useState({ firstName: '', lastName: '', email: '', position: '' });

  const loadData = async () => {
    try {
      const [attendance, users] = await Promise.all([
        api.getAttendance(date),
        api.getUsers(),
      ]);
      setData(attendance);
      setTeam(users);
    } catch {
      toast('Erreur lors du chargement', 'error');
    }
  };

  useEffect(() => { loadData(); }, [date]);

  const handleStatusChange = async (userId: string, status: AttendanceStatus) => {
    try {
      await api.saveAttendance({ userId, date, status });
      toast('Présence enregistrée', 'success');
      loadData();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleAddCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addCollaborator(newCollab);
      toast('Collaborateur ajouté', 'success');
      setNewCollab({ firstName: '', lastName: '', email: '', position: '' });
      setShowAddForm(false);
      loadData();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleDeleteCollab = async (id: string, name: string) => {
    if (!confirm(`Supprimer ${name} ? Cette action est irréversible.`)) return;
    try {
      await api.deleteUser(id);
      toast('Collaborateur supprimé', 'success');
      loadData();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const getStatusBadge = (status: string | null) => {
    const opt = STATUS_OPTIONS.find(s => s.value === status);
    if (!opt) return <Badge variant="outline">Non renseigné</Badge>;
    return <Badge className={opt.color}>{opt.label}</Badge>;
  };

  return (
    <div>
      <Header title="Gestion des présences" />
      <div className="p-6">
        {/* Statistiques */}
        {data?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="text-primary" size={24} />
                  <div>
                    <p className="text-sm text-muted-foreground">Total équipe</p>
                    <p className="text-2xl font-bold">{data.stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Présents</p>
                <p className="text-2xl font-bold text-green-600">{data.stats.present}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Taux de présence</p>
                <p className="text-2xl font-bold">{data.stats.rate}%</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sélecteur de date */}
        <div className="flex items-center gap-4 mb-6">
          <Input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-auto"
          />
          <span className="text-sm text-gray-500">{formatDate(date)}</span>
        </div>

        {/* Liste des présences */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Équipe — {formatDate(date)}</CardTitle>
            {canEdit && (
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
                <UserPlus size={16} className="mr-2" />
                Ajouter
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {/* Formulaire d'ajout */}
            {showAddForm && canEdit && (
              <form onSubmit={handleAddCollab} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                <Input
                  placeholder="Prénom"
                  value={newCollab.firstName}
                  onChange={e => setNewCollab(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Nom"
                  value={newCollab.lastName}
                  onChange={e => setNewCollab(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newCollab.email}
                  onChange={e => setNewCollab(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Poste"
                  value={newCollab.position}
                  onChange={e => setNewCollab(prev => ({ ...prev, position: e.target.value }))}
                />
                <Button type="submit">Ajouter</Button>
              </form>
            )}

            {/* Tableau */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Nom</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Poste</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Statut</th>
                    {canEdit && <th className="text-left py-3 px-2 font-medium text-gray-500">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {data?.attendances?.map((record: any) => (
                    <tr key={record.user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">
                        {record.user.firstName} {record.user.lastName}
                      </td>
                      <td className="py-3 px-2 text-gray-500">{record.user.position || '—'}</td>
                      <td className="py-3 px-2">
                        {canEdit ? (
                          <div className="flex gap-1 flex-wrap">
                            {STATUS_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => handleStatusChange(record.user.id, opt.value)}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                  record.status === opt.value
                                    ? opt.color + ' ring-2 ring-offset-1 ring-gray-300'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          getStatusBadge(record.status)
                        )}
                      </td>
                      {canEdit && (
                        <td className="py-3 px-2">
                          <button
                            onClick={() => handleDeleteCollab(record.user.id, `${record.user.firstName} ${record.user.lastName}`)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {(!data?.attendances || data.attendances.length === 0) && (
                <p className="text-center text-gray-500 py-8">Aucun collaborateur dans l'équipe.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
