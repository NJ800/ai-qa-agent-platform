import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { FileUp, GitPullRequest, Search } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function PRList() {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPRs = async () => {
      try {
        const response = await api.get('/ingest/prs');
        setPrs(response.data);
      } catch (error) {
        toast.error('Failed to load PRs');
      } finally {
        setLoading(false);
      }
    };
    fetchPRs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center dark:text-white">
            <GitPullRequest className="mr-2 h-6 w-6 text-indigo-500" /> Pull Requests
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">View and manage all ingested Pull Requests across the system.</p>
        </div>
        <Link to="/pr-input" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2 hover:shadow-lg hover:-translate-y-0.5 shadow-indigo-500/30">
          <FileUp className="mr-2 h-4 w-4" /> Ingest PR
        </Link>
      </div>

      <Card className="border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">PR Number</th>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Repository</th>
                <th className="px-6 py-4 font-semibold">Author</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prs.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    <div>No Pull Requests found.</div>
                    <Link to="/pr-input" className="text-indigo-600 hover:text-indigo-700 hover:underline mt-2 inline-block">Ingest your first PR</Link>
                  </td>
                </tr>
              )}
              {prs.map(pr => (
                <tr key={pr._id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                    <div className="flex items-center space-x-2">
                       <GitPullRequest className="w-4 h-4 text-slate-400"/>
                       <span>#{pr.pr_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-300">
                    {pr.title}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {pr.repository}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {pr.author}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {pr.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to="/qa-analysis" className="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center justify-end dark:text-indigo-400 dark:hover:text-indigo-300">
                      <Search className="w-4 h-4 mr-1" /> Analyze
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
