import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { todayISO, formatDate } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DashboardPage() {
  const { canEdit } = useAuth();
  const { toast } = useToast();
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    try {
      const [defs, ents] = await Promise.all([
        api.getKpiDefinitions(),
        api.getKpiEntries(7),
      ]);
      setDefinitions(defs);
      setEntries(ents);
    } catch {
      toast('Erreur lors du chargement des données', 'error');
    }
  };

  useEffect(() => { loadData(); }, []);

  const getEntriesForKpi = (defId: string) => {
    return entries
      .filter(e => e.kpiDefinitionId === defId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getTrend = (defId: string) => {
    const kpiEntries = getEntriesForKpi(defId);
    if (kpiEntries.length < 2) return null;
    const last = kpiEntries[kpiEntries.length - 1].value;
    const prev = kpiEntries[kpiEntries.length - 2].value;
    if (last > prev) return 'up';
    if (last < prev) return 'down';
    return 'stable';
  };

  const getLatestValue = (defId: string) => {
    const kpiEntries = getEntriesForKpi(defId);
    return kpiEntries.length > 0 ? kpiEntries[kpiEntries.length - 1].value : null;
  };

  const getLatestEntry = (defId: string) => {
    const kpiEntries = getEntriesForKpi(defId);
    return kpiEntries.length > 0 ? kpiEntries[kpiEntries.length - 1] : null;
  };

  const handleSave = async (defId: string) => {
    const val = parseFloat(inputValues[defId]);
    if (isNaN(val)) {
      toast('Veuillez entrer une valeur numérique', 'error');
      return;
    }
    try {
      await api.saveKpiEntry({ value: val, date: todayISO(), kpiDefinitionId: defId });
      setInputValues(prev => ({ ...prev, [defId]: '' }));
      toast('KPI enregistré', 'success');
      loadData();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleComment = async (entryId: string, defId: string) => {
    const text = commentInputs[defId]?.trim();
    if (!text) return;
    try {
      await api.addComment(entryId, text);
      setCommentInputs(prev => ({ ...prev, [defId]: '' }));
      toast('Commentaire ajouté', 'success');
      loadData();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const TrendIcon = ({ defId }: { defId: string }) => {
    const trend = getTrend(defId);
    if (trend === 'up') return <TrendingUp className="text-green-500" size={20} />;
    if (trend === 'down') return <TrendingDown className="text-red-500" size={20} />;
    return <Minus className="text-gray-400" size={20} />;
  };

  // Séparer KPI par défaut et personnalisés
  const defaultDefs = definitions.filter(d => d.isDefault);
  const sectionDefs = definitions.filter(d => !d.isDefault && d.section && !d.section.hidden);

  // Grouper les sections
  const sectionMap = new Map<string, { name: string; defs: any[] }>();
  sectionDefs.forEach(d => {
    if (!sectionMap.has(d.sectionId)) {
      sectionMap.set(d.sectionId, { name: d.section.name, defs: [] });
    }
    sectionMap.get(d.sectionId)!.defs.push(d);
  });

  const renderKpiCard = (def: any) => {
    const chartData = getEntriesForKpi(def.id).map(e => ({
      date: formatDate(e.date),
      value: e.value,
    }));
    const latest = getLatestValue(def.id);
    const latestEntry = getLatestEntry(def.id);

    return (
      <Card key={def.id} className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">{def.name}</CardTitle>
            <TrendIcon defId={def.id} />
          </div>
          <div className="text-2xl font-bold">
            {latest !== null ? `${latest} ${def.unit}` : '—'}
          </div>
        </CardHeader>
        <CardContent>
          {/* Graphique 7 jours */}
          {chartData.length > 0 && (
            <div className="h-32 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#1e3a5f" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Saisie (admin/manager uniquement) */}
          {canEdit && (
            <div className="flex gap-2 mb-3">
              <Input
                type="number"
                step="any"
                placeholder={`Valeur (${def.unit})`}
                value={inputValues[def.id] || ''}
                onChange={e => setInputValues(prev => ({ ...prev, [def.id]: e.target.value }))}
                className="flex-1"
              />
              <Button size="sm" onClick={() => handleSave(def.id)}>
                Enregistrer
              </Button>
            </div>
          )}

          {/* Commentaires */}
          {latestEntry && (
            <div>
              <button
                onClick={() => setShowComments(prev => ({ ...prev, [def.id]: !prev[def.id] }))}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <MessageSquare size={14} />
                {latestEntry.comments?.length || 0} commentaire(s)
              </button>

              {showComments[def.id] && (
                <div className="mt-2 space-y-2">
                  {latestEntry.comments?.map((c: any) => (
                    <div key={c.id} className="bg-gray-50 rounded p-2 text-xs">
                      <span className="font-medium">{c.user.firstName} {c.user.lastName}</span>
                      <p className="mt-1 text-gray-600">{c.text}</p>
                    </div>
                  ))}

                  {canEdit && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ajouter un commentaire..."
                        value={commentInputs[def.id] || ''}
                        onChange={e => setCommentInputs(prev => ({ ...prev, [def.id]: e.target.value }))}
                        maxLength={500}
                        className="text-xs"
                      />
                      <Button size="sm" variant="outline" onClick={() => handleComment(latestEntry.id, def.id)}>
                        Envoyer
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <Header title="Dashboard KPI" />
      <div className="p-6">
        {/* KPIs prédéfinis */}
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Indicateurs principaux</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {defaultDefs.map(renderKpiCard)}
        </div>

        {/* Sections personnalisées */}
        {Array.from(sectionMap.entries()).map(([sectionId, section]) => (
          <div key={sectionId} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{section.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.defs.map(renderKpiCard)}
            </div>
          </div>
        ))}

        {definitions.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            Aucun indicateur KPI configuré.
          </div>
        )}
      </div>
    </div>
  );
}
