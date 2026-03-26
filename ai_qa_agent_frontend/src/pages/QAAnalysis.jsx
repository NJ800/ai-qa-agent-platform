import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { CheckCircle2, ChevronRight, Play, Loader2, AlertCircle, Activity } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

export default function QAAnalysis() {
  const location = useLocation();
  const [targetId, setTargetId] = useState(location.state?.targetId || '');
  const [loading, setLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState('');
  const [results, setResults] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);

  const toggleDetails = (idx) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  const pollJobStatus = async (jobId) => {
    try {
      const resp = await api.get(`/qa/jobs/${jobId}`);
      const job = resp.data;
      
      if (job.status === 'completed') {
        setResults(job.result);
        setLoading(false);
        setJobStatus('');
        toast.success("Analysis completed successfully!");
      } else if (job.status === 'failed') {
        setLoading(false);
        setJobStatus('');
        toast.error(`Job failed: ${job.error || 'Unknown error'}`);
      } else {
        setJobStatus('Analysis running, AI is processing...');
        setTimeout(() => pollJobStatus(jobId), 2000);
      }
    } catch (err) {
      setLoading(false);
      setJobStatus('');
      toast.error('Error tracking analysis job.');
    }
  };

  const handleAnalysis = async () => {
    if (!targetId) return toast.error("Please enter a Target ID");
    
    setLoading(true);
    setResults(null);
    setJobStatus('Initiating job...');
    
    try {
      let response;
      if (targetId.toUpperCase().startsWith('PR-')) {
        response = await api.post(`/qa/generate-tests/pr/${targetId}`);
      } else {
        response = await api.post(`/qa/generate-tests/story/${targetId}`);
      }
      
      const { job_id } = response.data;
      if (job_id) {
        setJobStatus('Job dispatched to background...');
        pollJobStatus(job_id);
      } else {
        setLoading(false);
        toast.error('Failed to dispatch job');
      }
    } catch (err) {
      setLoading(false);
      setJobStatus('');
      toast.error(err.response?.data?.detail || "Failed to run analysis");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Intelligent QA Analysis</h1>
        <p className="text-slate-500 dark:text-slate-400">Deep AI analysis with background job tracking.</p>
      </div>

      <Card className="max-w-2xl border-indigo-500/10 shadow-indigo-500/5">
        <CardHeader>
          <CardTitle>Trigger Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target ID (Story or PR)</label>
              <Input
                placeholder="Ex: US-101 or PR-45"
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
              />
            </div>
            <Button onClick={handleAnalysis} disabled={loading} className="flex items-center bg-indigo-600 hover:bg-indigo-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" /> 
                  Run Analysis
                </>
              )}
            </Button>
          </div>
          
          {loading && (
            <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-md border border-indigo-100 dark:border-indigo-800/50 flex items-center text-indigo-700 dark:text-indigo-400 animate-pulse">
              <Activity className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{jobStatus || 'Processing...'}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {results && results.test_cases && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mt-8 mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Generated Strategy ({results.test_cases_generated} tests)</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.test_cases.map((tc, idx) => (
              <Card key={idx} className={`border-l-4 ${tc.priority === 'HIGH' ? 'border-l-red-500' : tc.priority === 'MEDIUM' ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
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
                  <span className="text-xs text-slate-400 font-medium">Auto-generated</span>
                  <div className="flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                    <span className="text-xs font-medium mr-1">{expandedIdx === idx ? 'Hide Details' : 'View Details'}</span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${expandedIdx === idx ? 'rotate-90' : ''}`} />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
