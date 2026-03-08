import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import { FileText, Briefcase, TrendingUp, Calendar, ExternalLink, CheckCircle2, Building2, Lightbulb } from 'lucide-react';

export const StudentDashboard = () => {
  const { token, API, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [upcomingDrives, setUpcomingDrives] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [feedbackForms, setFeedbackForms] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appsRes, drivesRes, profileRes, feedbackRes, notificationsRes] = await Promise.all([
        axios.get(`${API}/applications`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/drives`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/feedback-forms`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/notifications`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
      ]);

      const applications = appsRes.data;
      const allDrives = drivesRes.data.filter(d => d.status === 'upcoming');
      const profile = profileRes.data;
      
      setProfileData(profile);
      setStats({
        totalApplications: applications.length,
        selected: applications.filter(a => a.status === 'selected').length,
        pending: applications.filter(a => a.status === 'pending').length,
        upcomingDrives: allDrives.length,
        profileCompletion: calculateProfileCompletion(profile)
      });

      setUpcomingDrives(allDrives.slice(0, 3));
      setRecentApplications(applications.slice(0, 3));
      setFeedbackForms(feedbackRes.data || []);
      setNotifications(notificationsRes.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    }
  };

  const calculateProfileCompletion = (profile) => {
    const fields = ['first_name', 'last_name', 'email', 'phone', 'branch', 'roll_number', 'cgpa', 'tenth_percentage', 'twelfth_percentage'];
    const completed = fields.filter(field => profile[field] && profile[field] !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const getProfileCompletionItems = () => {
    if (!profileData) return [];
    return [
      { label: 'Basic Information', completed: !!(profileData.first_name && profileData.last_name && profileData.email) },
      { label: 'Academic Details', completed: !!(profileData.cgpa && profileData.tenth_percentage && profileData.twelfth_percentage) },
      { label: 'Upload Resume', completed: !!profileData.resume_path },
      { label: 'Add Skills & Projects', completed: !!(profileData.skills && profileData.skills.length > 0) }
    ];
  };

  if (!stats) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="p-8" data-testid="student-dashboard">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.first_name}! 👋</h1>
        <p className="text-gray-600 mt-1">{user?.branch} • {user?.year || 'Year not set'}</p>
      </div>

      {notifications.length > 0 && (
        <Card className="mb-8 border-blue-200 bg-blue-50" data-testid="notifications-section">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Briefcase className="text-blue-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">📢 Placement Updates</h3>
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="bg-white p-3 rounded-lg border border-blue-200" data-testid={`notification-${notif.id}`}>
                      <p className="font-medium text-sm">{notif.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(notif.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {feedbackForms.length > 0 && (
        <Card className="mb-8 border-blue-200 bg-blue-50" data-testid="feedback-needed-section">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="text-blue-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Action Required: Feedback Needed</h3>
                <p className="text-sm text-blue-700 mb-4">Please fill out these forms before they expire</p>
                
                <div className="grid md:grid-cols-2 gap-3">
                  {feedbackForms.map((form) => (
                    <div key={form.id} className="bg-white p-4 rounded-lg border border-blue-200" data-testid={`feedback-form-${form.id}`}>
                      <p className="font-medium text-sm mb-1">{form.title}</p>
                      <p className="text-xs text-gray-600 mb-3">Expires: {form.expiry_date}</p>
                      <a href={form.form_link} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="w-full" data-testid={`fill-form-${form.id}`}>
                          Fill Form <ExternalLink className="ml-2" size={14} />
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Applications</p>
                <p className="text-3xl font-bold mt-2">{stats.totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected</p>
                <p className="text-3xl font-bold mt-2 text-green-600">{stats.selected}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold mt-2 text-orange-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Drives</p>
                <p className="text-3xl font-bold mt-2 text-purple-600">{stats.upcomingDrives}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
            <p className="text-sm text-gray-600">Complete your profile to increase visibility</p>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-bold text-blue-600">{stats.profileCompletion}%</span>
              </div>
              <Progress value={stats.profileCompletion} className="h-2" />
            </div>

            <div className="space-y-3">
              {getProfileCompletionItems().map((item, idx) => (
                <div key={idx} className="flex items-center gap-3" data-testid={`profile-item-${idx}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.completed ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 rounded-full bg-gray-400" />}
                  </div>
                  <span className={`text-sm ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-4" 
              data-testid="complete-profile-button"
              onClick={() => navigate('/student/profile')}
            >
              Complete Profile →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Upcoming Drives</CardTitle>
                <p className="text-sm text-gray-600">Campus recruitment opportunities</p>
              </div>
              <Button 
                variant="link" 
                size="sm" 
                data-testid="view-all-drives-button"
                onClick={() => navigate('/student/drives')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDrives.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No upcoming drives</p>
              ) : (
                upcomingDrives.map((drive) => (
                  <div key={drive.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg" data-testid={`upcoming-drive-${drive.id}`}>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="text-blue-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{drive.company}</p>
                      <p className="text-xs text-gray-600">{drive.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">{drive.package}</p>
                      <p className="text-xs text-gray-600">{drive.drive_date}</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                      Eligible
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <p className="text-sm text-gray-600">Track your application status</p>
              </div>
              <Button 
                variant="link" 
                size="sm" 
                data-testid="view-all-applications-button"
                onClick={() => navigate('/student/applications')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentApplications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No applications yet</p>
              ) : (
                recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg" data-testid={`recent-application-${app.id}`}>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="text-purple-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{app.company}</p>
                      <p className="text-xs text-gray-600">{app.role} • {app.current_stage}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      app.status === 'selected' ? 'bg-green-100 text-green-700' :
                      app.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.status === 'selected' ? 'Selected' : app.status === 'pending' ? 'Pending' : 'Rejected'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>AI Suggestions</CardTitle>
                <p className="text-sm text-gray-600">Personalized recommendations for you</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Lightbulb className="text-purple-600 flex-shrink-0" size={20} />
                <p className="text-sm text-gray-700">Add Python and Machine Learning to your skills</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Lightbulb className="text-blue-600 flex-shrink-0" size={20} />
                <p className="text-sm text-gray-700">Your CGPA qualifies you for 85% of drives</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Lightbulb className="text-green-600 flex-shrink-0" size={20} />
                <p className="text-sm text-gray-700">Consider applying for Data Science roles</p>
              </div>
            </div>
            
            <Button 
              className="w-full mt-4" 
              data-testid="open-ai-assistant-button"
              onClick={() => navigate('/student/ai-assistant')}
            >
              🤖 Open AI Assistant
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};