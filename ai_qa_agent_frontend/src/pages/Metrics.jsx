import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../services/api';
import { toast } from 'sonner';

export default function Metrics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    riskDistribution: [
      { name: 'Low Risk', value: 45 },
      { name: 'Medium Risk', value: 30 },
      { name: 'High Risk', value: 15 },
      { name: 'Critical Risk', value: 10 },
    ],
    coverage: [
      { name: 'Auth', coverage: 85 },
      { name: 'Ingestion', coverage: 90 },
      { name: 'Analysis', coverage: 65 },
      { name: 'Reporting', coverage: 75 },
    ],
    systemInsights: "System performance is optimal. Latest analysis runs are completing within 2-3 seconds on average."
  });

  const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444'];

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/dashboard/metrics').catch(() => null);
        if (response && response.data) {
          // Merge API response with default/mock data map if needed
          setData(prev => ({ ...prev, ...response.data }));
        }
      } catch (err) {
        toast.error("Failed to fetch metrics.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">System Metrics</h1>
        <p className="text-slate-500 dark:text-slate-400">Deep dive into test coverage and risk distribution.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Coverage by Component</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.coverage} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis type="number" stroke="#64748b" className="text-xs" tickLine={false} axisLine={false} domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" className="text-xs" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: 'transparent'}}/>
                  <Bar dataKey="coverage" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {data.systemInsights}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
