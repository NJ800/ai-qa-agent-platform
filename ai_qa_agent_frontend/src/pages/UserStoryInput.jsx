import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import api from '../services/api';

export default function UserStoryInput() {
  const [formData, setFormData] = useState({
    story_id: '',
    title: '',
    description: '',
    acceptance_criteria: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        acceptance_criteria: formData.acceptance_criteria.split('\n').filter(Boolean)
      };
      await api.post('/ingest/stories', payload);
      toast.success("User story submitted successfully!");
      setFormData({ story_id: '', title: '', description: '', acceptance_criteria: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit user story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">User Story Ingestion</h1>
        <p className="text-slate-500 dark:text-slate-400">Submit new requirements for AI analysis.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Story Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Story ID"
                placeholder="Ex: US-101"
                value={formData.story_id}
                onChange={e => setFormData({ ...formData, story_id: e.target.value })}
                required
              />
              <Input
                label="Title"
                placeholder="Brief summary of the requirement"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="As a user, I want to..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Acceptance Criteria (One per line)</label>
              <textarea
                className="w-full min-h-[120px] px-3 py-2 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Given... When... Then..."
                value={formData.acceptance_criteria}
                onChange={e => setFormData({ ...formData, acceptance_criteria: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Story'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
