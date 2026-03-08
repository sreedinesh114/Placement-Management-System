import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { TrendingUp, Building, Users, Bot } from 'lucide-react';

const BRANCHES = [
  'Computer Science and Engineering',
  'Artificial Intelligence and Data Science',
  'Information Technology',
  'Civil',
  'Mechanical',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Automobile',
  'ICE'
];

const YEARS = ['I year', 'II year', 'III year', 'IV year'];

export const LandingPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'student',
    branch: '',
    year: '',
    roll_number: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await login(loginData.email, loginData.password);
      toast.success('Login successful!');
      navigate(user.role === 'officer' ? '/officer/dashboard' : '/student/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate required fields for students
    if (registerData.role === 'student') {
      if (!registerData.year || !registerData.branch || !registerData.roll_number) {
        toast.error('Please fill all required fields');
        return;
      }
    }
    
    try {
      const user = await register(registerData);
      toast.success('Registration successful!');
      navigate(user.role === 'officer' ? '/officer/dashboard' : '/student/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50" data-testid="landing-page">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-900">PlaceMe</h1>
          <Button onClick={() => setIsLogin(!isLogin)} variant="outline" data-testid="toggle-auth-button">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              AI-Powered Campus
              <span className="text-blue-600"> Placement Management</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Streamline your campus recruitment process with intelligent automation,
              real-time analytics, and personalized career guidance.
            </p>

            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">92%</div>
                <div className="text-sm text-gray-600 mt-1">Placement Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">150+</div>
                <div className="text-sm text-gray-600 mt-1">Partner Companies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">5000+</div>
                <div className="text-sm text-gray-600 mt-1">Students Placed</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Student Portal</h3>
                  <p className="text-gray-600">Track applications, discover opportunities, and get AI-powered career guidance.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Building className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Drive Management</h3>
                  <p className="text-gray-600">Efficiently organize campus drives with automated notifications and tracking.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">AI Assistance</h3>
                  <p className="text-gray-600">Get personalized recommendations and skill gap analysis powered by AI.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">{isLogin ? 'Sign In' : 'Create Account'}</CardTitle>
                <CardDescription>
                  {isLogin ? 'Enter your credentials to access your account' : 'Get started with PlaceMe today'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLogin ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        data-testid="login-email-input"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        data-testid="login-password-input"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" data-testid="login-submit-button">
                      Sign In
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <Tabs value={registerData.role} onValueChange={(val) => setRegisterData({ ...registerData, role: val })}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="student" data-testid="register-role-student">Student</TabsTrigger>
                        <TabsTrigger value="officer" data-testid="register-role-officer">Officer</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          data-testid="register-first-name-input"
                          value={registerData.first_name}
                          onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          data-testid="register-last-name-input"
                          value={registerData.last_name}
                          onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        data-testid="register-email-input"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        data-testid="register-password-input"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>

                    {registerData.role === 'student' && (
                      <>
                        <div>
                          <Label htmlFor="year">Year *</Label>
                          <Select value={registerData.year} onValueChange={(val) => setRegisterData({ ...registerData, year: val })}>
                            <SelectTrigger data-testid="register-year-select">
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {YEARS.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="branch">Branch *</Label>
                          <Select value={registerData.branch} onValueChange={(val) => setRegisterData({ ...registerData, branch: val })}>
                            <SelectTrigger data-testid="register-branch-select">
                              <SelectValue placeholder="Select Branch" />
                            </SelectTrigger>
                            <SelectContent>
                              {BRANCHES.map(branch => (
                                <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="roll_number">Roll Number *</Label>
                          <Input
                            id="roll_number"
                            data-testid="register-roll-number-input"
                            value={registerData.roll_number}
                            onChange={(e) => setRegisterData({ ...registerData, roll_number: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    <Button type="submit" className="w-full" data-testid="register-submit-button">
                      Create Account
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};