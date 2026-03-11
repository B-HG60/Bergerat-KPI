import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { formatDate, todayISO } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Users } from 'lucide-react';

export function AdminOverviewPage() {
  const { toast } = useToast();
  const [overview, setOverview] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(todayISO());

  useEffect(() => {
    api.getAdminOverview(30)
      .then(setOverview)
      .catch(() => toast('Erreur lors du chargement', 'error'));
  }, []);

  const handleExport = () => {
    const token = api.getToken();
    const url = api.getExportUrl(startDate, endDate);
    // Téléchargement avec token
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error('Export échoué');
        return res.blob();
      })
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `kpi-export-${startDate}-${endDate}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast('Export téléchargé', 'success');
      })
      .catch(() => toast('Erreur lors de l\'export', 'error'));
  };

  return (
    <div>
      <Header title="Vue globale" />
      <div className="p-6">
        {/* Export CSV */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download size={20} />
              Export CSV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div>
                <label className="text-sm font-medium">Du</label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Au</label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <Button onClick={handleExport}>
                <Download size={16} className="mr-2" />
                Télécharger
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vue par manager */}
        <h3 className="text-lg font-semibold mb-4">KPIs par manager</h3>
        <div className="space-y-4">
          {overview.map((item: any) => (
            <Card key={item.manager.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{item.manager.name}</span>
                  <span className="flex items-center gap-1 text-sm text-gray-500 font-normal">
                    <Users size={14} />
                    {item.manager.teamSize} collaborateur(s)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {item.entries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 text-gray-500">Date</th>
                          <th className="text-left py-2 px-2 text-gray-500">KPI</th>
                          <th className="text-right py-2 px-2 text-gray-500">Valeur</th>
                          <th className="text-left py-2 px-2 text-gray-500">Unité</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.entries.slice(0, 20).map((entry: any) => (
                          <tr key={entry.id} className="border-b">
                            <td className="py-2 px-2">{formatDate(entry.date)}</td>
                            <td className="py-2 px-2">{entry.kpiDefinition.name}</td>
                            <td className="py-2 px-2 text-right font-medium">{entry.value}</td>
                            <td className="py-2 px-2 text-gray-500">{entry.kpiDefinition.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucune saisie récente.</p>
                )}
              </CardContent>
            </Card>
          ))}

          {overview.length === 0 && (
            <p className="text-center text-gray-500 py-12">Aucun manager enregistré.</p>
          )}
        </div>
      </div>
    </div>
  );
}
