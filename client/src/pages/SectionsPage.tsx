import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

export function SectionsPage() {
  const { toast } = useToast();
  const [sections, setSections] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [kpis, setKpis] = useState([{ name: '', unit: '' }]);

  const loadSections = async () => {
    try {
      setSections(await api.getSections());
    } catch {
      toast('Erreur lors du chargement', 'error');
    }
  };

  useEffect(() => { loadSections(); }, []);

  const addKpiField = () => setKpis(prev => [...prev, { name: '', unit: '' }]);

  const updateKpi = (idx: number, field: 'name' | 'unit', value: string) => {
    setKpis(prev => prev.map((k, i) => i === idx ? { ...k, [field]: value } : k));
  };

  const removeKpiField = (idx: number) => {
    if (kpis.length > 1) setKpis(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validKpis = kpis.filter(k => k.name && k.unit);
    if (!sectionName || validKpis.length === 0) {
      toast('Remplissez le nom et au moins un KPI', 'error');
      return;
    }
    try {
      await api.createSection({ name: sectionName, kpis: validKpis });
      toast('Section créée', 'success');
      setSectionName('');
      setKpis([{ name: '', unit: '' }]);
      setShowForm(false);
      loadSections();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.toggleSection(id);
      loadSections();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer la section "${name}" et tous ses KPIs ?`)) return;
    try {
      await api.deleteSection(id);
      toast('Section supprimée', 'success');
      loadSections();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <div>
      <Header title="Sections personnalisées" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-500">Créez vos propres sections d'indicateurs</p>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={16} className="mr-2" />
            Nouvelle section
          </Button>
        </div>

        {/* Formulaire de création */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nouvelle section</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  placeholder="Nom de la section"
                  value={sectionName}
                  onChange={e => setSectionName(e.target.value)}
                  required
                />

                <div className="space-y-3">
                  <label className="text-sm font-medium">Indicateurs</label>
                  {kpis.map((kpi, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder="Nom du KPI"
                        value={kpi.name}
                        onChange={e => updateKpi(idx, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Unité (ex: kg/jour)"
                        value={kpi.unit}
                        onChange={e => updateKpi(idx, 'unit', e.target.value)}
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeKpiField(idx)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addKpiField}>
                    <Plus size={14} className="mr-1" /> Ajouter un KPI
                  </Button>
                </div>

                <Button type="submit">Créer la section</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Liste des sections */}
        <div className="space-y-4">
          {sections.map(section => (
            <Card key={section.id} className={section.hidden ? 'opacity-50' : ''}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {section.name}
                    {section.hidden && <Badge variant="secondary">Masquée</Badge>}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">
                    Créée par {section.creator.firstName} {section.creator.lastName}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleToggle(section.id)} title={section.hidden ? 'Afficher' : 'Masquer'}>
                    {section.hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(section.id, section.name)}>
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {section.kpiDefinitions?.map((kpi: any) => (
                    <Badge key={kpi.id} variant="outline">
                      {kpi.name} ({kpi.unit})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {sections.length === 0 && (
            <p className="text-center text-gray-500 py-12">Aucune section personnalisée.</p>
          )}
        </div>
      </div>
    </div>
  );
}
