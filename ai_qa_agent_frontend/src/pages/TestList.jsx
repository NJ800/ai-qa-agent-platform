import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { FileText, AlertCircle, ChevronRight, Loader2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';

export default function TestList() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await api.get('/qa/tests');
        setTests(response.data);
      } catch (error) {
        toast.error('Failed to load Test Cases');
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const toggleDetails = (idx) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center dark:text-white">
            <FileText className="mr-2 h-6 w-6 text-indigo-500" /> Generated AI Tests
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Review, prioritize, and manage all dynamically generated test cases across your PRs and Stories.</p>
        </div>
        <Link to="/qa-analysis" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2 hover:shadow-lg hover:-translate-y-0.5 shadow-indigo-500/30">
          <Play className="mr-2 h-4 w-4" /> Run New Analysis
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200">No Tests Generated Yet</h3>
          <p className="text-slate-500 mt-2 mb-4 dark:text-slate-400">Run a QA Analysis on a Story or PR to dynamically generate test cases.</p>
          <Link to="/qa-analysis" className="text-indigo-600 hover:text-indigo-700 hover:underline">
            Go to QA Analysis
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((tc, idx) => (
            <Card key={tc._id || idx} className={`border-l-4 ${tc.priority === 'HIGH' ? 'border-l-red-500' : tc.priority === 'MEDIUM' ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-sm ${
                    tc.type === 'Positive' || tc.test_type === 'Functional' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : tc.type === 'Negative' || tc.test_type === 'Security' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {tc.type || tc.test_type || 'General'}
                  </span>
                  
                  {tc.priority && (
                    <span className={`flex items-center text-xs font-bold ${
                      tc.priority === 'HIGH' ? 'text-red-600 dark:text-red-400' : 
                      tc.priority === 'MEDIUM' ? 'text-orange-500 dark:text-orange-400' : 
                      'text-blue-500 dark:text-blue-400'
                    }`}>
                      {tc.priority === 'HIGH' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {tc.priority} PRIORITY
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mt-1 mb-2 leading-tight">{tc.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">{tc.description}</p>
                
                {expandedIdx === idx && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-2">
                    {tc.preconditions && tc.preconditions.length > 0 && (
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Preconditions</h5>
                        <ul className="list-disc pl-4 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                          {tc.preconditions.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                    )}
                    {tc.steps && tc.steps.length > 0 && (
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 mt-3">Steps</h5>
                        <ol className="list-decimal pl-4 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                          {tc.steps.map((s, i) => <li key={i}>{s}</li>)}
                        </ol>
                      </div>
                    )}
                    {tc.expected_result && (
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 mt-3">Expected Result</h5>
                        <p className="text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-900/50 mt-1">{tc.expected_result}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter 
                className={`py-2.5 px-5 flex justify-between items-center cursor-pointer border-t border-slate-100 dark:border-slate-800 transition-colors ${
                  tc.priority === 'HIGH' ? 'hover:bg-red-50 dark:hover:bg-red-900/10' : 
                  tc.priority === 'MEDIUM' ? 'hover:bg-orange-50 dark:hover:bg-orange-900/10' : 
                  'hover:bg-blue-50 dark:hover:bg-blue-900/10'
                }`}
                onClick={() => toggleDetails(idx)}
              >
                <span className="text-xs text-slate-400 font-medium truncate w-[100px]">{tc.related_pr_id ? `PR: ${tc.related_pr_id.substring(0,6)}...` : 'Auto-generated'}</span>
                <div className="flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  <span className="text-xs font-medium mr-1">{expandedIdx === idx ? 'Hide Details' : 'View Details'}</span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${expandedIdx === idx ? 'rotate-90' : ''}`} />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
