import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import { Send, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function PRInput() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pr_number: '',
    repository: '',
    title: '',
    description: '',
    author: '',
    changed_files: [''],
    diff_hunks: '',
    lines_added: 0,
    lines_deleted: 0
  });

  const handleFileChange = (index, value) => {
    const newFiles = [...formData.changed_files];
    newFiles[index] = value;
    setFormData({ ...formData, changed_files: newFiles });
  };

  const addFileField = () => {
    setFormData({ ...formData, changed_files: [...formData.changed_files, ''] });
  };

  const removeFileField = (index) => {
    const newFiles = formData.changed_files.filter((_, i) => i !== index);
    setFormData({ ...formData, changed_files: newFiles });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pr_number || !formData.repository || !formData.title || !formData.author) {
      return toast.error("Please fill in all mandatory fields.");
    }
    
    // Clean empty files
    const cleanedFiles = formData.changed_files.filter(f => f.trim() !== '');
    if (cleanedFiles.length === 0) {
      return toast.error("Please provide at least one changed file path.");
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        pr_number: parseInt(formData.pr_number, 10),
        lines_added: parseInt(formData.lines_added, 10) || 0,
        lines_deleted: parseInt(formData.lines_deleted, 10) || 0,
        changed_files: cleanedFiles
      };
      
      const response = await api.post('/ingest/prs', payload);
      toast.success(response.data.message || "Pull Request ingested successfully");
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || "Failed to ingest PR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Ingest Pull Request</h1>
        <p className="text-slate-500 dark:text-slate-400">Add a new pull request for AI analysis.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PR Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">PR Number *</label>
                <Input 
                  type="number" 
                  placeholder="e.g., 42" 
                  value={formData.pr_number}
                  onChange={e => setFormData({...formData, pr_number: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Repository *</label>
                <Input 
                  placeholder="e.g., ai-qa-platform" 
                  value={formData.repository}
                  onChange={e => setFormData({...formData, repository: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title *</label>
                <Input 
                  placeholder="e.g., Fix login authentication overflow" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Author *</label>
                <Input 
                  placeholder="e.g., octocat" 
                  value={formData.author}
                  onChange={e => setFormData({...formData, author: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea 
                className="flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:placeholder:text-slate-500 dark:focus-visible:ring-blue-500 text-slate-900 dark:text-white"
                rows="3"
                placeholder="Briefly describe the intent of this PR."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Lines Added</label>
                <Input 
                  type="number" 
                  min="0"
                  placeholder="e.g., 120" 
                  value={formData.lines_added}
                  onChange={e => setFormData({...formData, lines_added: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Lines Deleted</label>
                <Input 
                  type="number" 
                  min="0"
                  placeholder="e.g., 30" 
                  value={formData.lines_deleted}
                  onChange={e => setFormData({...formData, lines_deleted: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Changed Files *</label>
                <Button type="button" variant="outline" size="sm" onClick={addFileField} className="h-8">
                  <Plus className="w-4 h-4 mr-1" /> Add File
                </Button>
              </div>
              
              {formData.changed_files.map((file, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    value={file}
                    onChange={(e) => handleFileChange(index, e.target.value)}
                    placeholder="e.g., frontend/src/auth.js"
                    className="flex-1"
                  />
                  {formData.changed_files.length > 1 && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      className="px-3"
                      onClick={() => removeFileField(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Diff Hunks (Optional)</label>
              <textarea 
                className="flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm font-mono placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:placeholder:text-slate-500 dark:focus-visible:ring-blue-500 text-slate-900 dark:text-white"
                rows="5"
                placeholder="+ added lines&#10;- removed lines"
                value={formData.diff_hunks}
                onChange={e => setFormData({...formData, diff_hunks: e.target.value})}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Ingesting...' : <><Send className="w-4 h-4 mr-2" /> Submit PR for Analysis</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
