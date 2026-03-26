import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import useAuthStore from '../store/authStore';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore(state => state.register);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(username, email, password);
      await login(username, password);
      toast.success("Account created successfully.");
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <p className="text-sm text-slate-500 mt-2">Get started with QA Agent platform</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4 pt-4">
            <Input 
              label="Username" 
              type="text" 
              placeholder="Ex: jdoe" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input 
              label="Email" 
              type="email" 
              placeholder="Ex: me@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Sign up'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
