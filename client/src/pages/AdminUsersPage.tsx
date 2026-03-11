import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Shield } from 'lucide-react';
import type { Role } from '@/types';

export function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'MANAGER' as Role, position: '',
  });

  const loadUsers = async () => {
    try {
      setUsers(await api.getUsers());
    } catch {
      toast('Erreur lors du chargement', 'error');
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser(form);
      toast('Utilisateur créé', 'success');
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'MANAGER', position: '' });
      setShowForm(false);
      loadUsers();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer l'utilisateur "${name}" ?`)) return;
    try {
      await api.deleteUser(id);
      toast('Utilisateur supprimé', 'success');
      loadUsers();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-800',
    MANAGER: 'bg-blue-100 text-blue-800',
    COLLABORATEUR: 'bg-gray-100 text-gray-800',
  };

  return (
    <div>
      <Header title="Gestion des utilisateurs" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-500">{users.length} utilisateur(s) enregistré(s)</p>
          <Button onClick={() => setShowForm(!showForm)}>
            <UserPlus size={16} className="mr-2" />
            Nouvel utilisateur
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nouvel utilisateur</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Prénom"
                  value={form.firstName}
                  onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Nom"
                  value={form.lastName}
                  onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  minLength={6}
                />
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value as Role }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="ADMIN">Administrateur</option>
                  <option value="MANAGER">Manager</option>
                  <option value="COLLABORATEUR">Collaborateur</option>
                </select>
                <Input
                  placeholder="Poste (optionnel)"
                  value={form.position}
                  onChange={e => setForm(p => ({ ...p, position: e.target.value }))}
                />
                <div className="md:col-span-2">
                  <Button type="submit">Créer</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Nom</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Email</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Rôle</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{user.firstName} {user.lastName}</td>
                      <td className="py-3 px-2 text-gray-500">{user.email}</td>
                      <td className="py-3 px-2">
                        <Badge className={roleColors[user.role]}>
                          {user.role === 'ADMIN' && <Shield size={12} className="mr-1" />}
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
