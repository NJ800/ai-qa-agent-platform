import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { FileText, Plus, ChevronRight, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import { toast } from 'sonner';

export default function UserStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const navigate = useNavigate();

  const toggleDetails = (idx) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await api.get('/ingest/stories');
        setStories(response.data);
      } catch (err) {
        toast.error("Failed to fetch stories");
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Active Stories</h1>
          <p className="text-slate-500 dark:text-slate-400">View all ingested user stories</p>
        </div>
        <Link 
          to="/story-input" 
          className="flex items-center bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Story
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400 animate-pulse">Loading active stories...</p>
      ) : stories.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-slate-500 dark:text-slate-400">
            No stories ingested yet. Click 'New Story' to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story, idx) => (
            <Card key={story.id} className="flex flex-col border-t-4 border-t-blue-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 px-2 py-1 rounded">
                    {story.story_id}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {story.status}
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-1" title={story.title}>{story.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                  {story.description}
                </p>
              </CardContent>
              {expandedIdx === idx && (
                <div className="px-6 pb-4 pt-0 animate-in fade-in slide-in-from-top-2">
                  <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2 mb-1">Acceptance Criteria</h5>
                  <ul className="list-disc pl-4 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    {story.acceptance_criteria?.map((ac, i) => <li key={i}>{ac}</li>)}
                  </ul>
                  <Button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      navigate('/qa-analysis', { state: { targetId: story.story_id } }); 
                    }} 
                    className="mt-4 w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run QA Analysis
                  </Button>
                </div>
              )}
              <CardFooter 
                className="py-2.5 px-5 flex justify-end text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer border-t border-slate-100 dark:border-slate-800"
                onClick={() => toggleDetails(idx)}
              >
                <span className="text-xs font-medium mr-1">{expandedIdx === idx ? 'Hide Details' : 'View Details'}</span>
                <ChevronRight className={`w-3 h-3 mt-0.5 transition-transform ${expandedIdx === idx ? 'rotate-90' : ''}`} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
