import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertTriangle, Activity, AlertCircle, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../services/api';
import { toast } from 'sonner';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      total_test_cases_generated: 0,
      number_of_defects: 0,
      high_risk_pr_count: 0,
      total_prs_analyzed: 0,
      risk_distribution: { Critical: 0, High: 0, Medium: 0, Low: 0 },
      insights: []
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/metrics');
        if (response && response.data) {
          setData({ stats: response.data.metrics });
        }
      } catch (err) {
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const riskData = [
    { name: 'Critical', count: data.stats.risk_distribution?.Critical || 0, color: '#ef4444' },
    { name: 'High', count: data.stats.risk_distribution?.High || 0, color: '#f97316' },
    { name: 'Medium', count: data.stats.risk_distribution?.Medium || 0, color: '#eab308' },
    { name: 'Low', count: data.stats.risk_distribution?.Low || 0, color: '#22c55e' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">AI Context Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Intelligent overview of risks, defects, and test coverage.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/prs" className="transition-transform hover:scale-105 active:scale-95">
          <Card className="h-full cursor-pointer hover:border-red-200 hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">High-Risk PRs</p>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {data.stats.high_risk_pr_count}
                </h2>
              </div>
              <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/prs" className="transition-transform hover:scale-105 active:scale-95">
          <Card className="h-full cursor-pointer hover:border-blue-200 hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total PRs Analyzed</p>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {data.stats.total_prs_analyzed}
                </h2>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                <Activity className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/metrics" className="transition-transform hover:scale-105 active:scale-95">
          <Card className="h-full cursor-pointer hover:border-orange-200 hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-row items-center justify-between space-y-0 h-full">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Known Defects</p>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {data.stats.number_of_defects}
                </h2>
              </div>
              <div className="p-3 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">
                <AlertCircle className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/tests" className="transition-transform hover:scale-105 active:scale-95">
          <Card className="h-full cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total AI Tests</p>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {data.stats.total_test_cases_generated}
                </h2>
              </div>
              <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full">
                <FileText className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Risk Distribution (Hybrid Intelligence)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="name" stroke="#64748b" className="text-xs" tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" className="text-xs" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#f8fafc' }}
                    cursor={{fill: 'transparent'}}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-indigo-500/20 shadow-indigo-500/5">
          <CardHeader className="bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/50">
            <CardTitle className="flex items-center text-indigo-900 dark:text-indigo-300">
              <Activity className="w-5 h-5 mr-2" /> AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {data.stats.insights && data.stats.insights.length > 0 ? (
                data.stats.insights.map((insight, i) => (
                  <div key={i} className="flex items-start pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0 animate-in slide-in-from-right-2 duration-300" style={{animationDelay: `${i * 100}ms`}}>
                    <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0 mr-4 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                    <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                      {insight}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 px-4">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No insights available. Ensure your LLM service is active.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
