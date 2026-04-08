import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { Users, Briefcase, TrendingUp, Building, ExternalLink, Trash2, Plus } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const OfficerDashboard = () => {
  const { token, API } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [recentDrives, setRecentDrives] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [feedbackForms, setFeedbackForms] = useState([]);
  const [students, setStudents] = useState([]);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    title: '',
    form_link: '',
    expiry_date: '',
    target_role: 'student'
  });
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    target_role: 'student'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, drivesRes, studentsRes, feedbackRes] = await Promise.all([
        axios.get(`${API}/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/drives`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/students`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/feedback-forms`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setAnalytics(analyticsRes.data);
      setRecentDrives((drivesRes.data || []).filter(d => d.status === 'upcoming').slice(0, 4));
      setStudents(studentsRes.data || []);
      
      const placed = (studentsRes.data || []).filter(s => s.placed).sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0)).slice(0, 3);
      setTopStudents(placed);
      
      setFeedbackForms(feedbackRes.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    }
  };

  const handleCreateFeedback = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/feedback-forms`, newFeedback, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Feedback form created successfully');
      setShowFeedbackDialog(false);
      setNewFeedback({ title: '', form_link: '', expiry_date: '', target_role: 'student' });
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to create feedback form');
    }
  };

const handlePostUpdate = async () => {
  const formData = new FormData();

  formData.append("title", postData.title);
  formData.append("message", postData.message);

  if (postData.image) {
    formData.append("image", postData.image);
  }

  await axios.post(`${API}/updates`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  });
};

  const handleDeleteFeedback = async (formId) => {
    try {
      await axios.delete(`${API}/feedback-forms/${formId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Feedback form deleted');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete feedback form');
    }
  };
    
  const [postData, setPostData] = useState({
  title: "",
  message: "",
  image: null
});

  if (!analytics || !students) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const branchData = (students || []).reduce((acc, student) => {
    const branch = student.branch || 'Other';
    if (!acc[branch]) acc[branch] = { total: 0, placed: 0 };
    acc[branch].total++;
    if (student.placed) acc[branch].placed++;
    return acc;
  }, {});

  const branchChartData = Object.entries(branchData).map(([name, data]) => ({
    name: name.substring(0, 10),
    value: data.placed
  }));

  const placementTrendData = [
    { month: 'Aug', placements: 40 },
    { month: 'Sep', placements: 85 },
    { month: 'Oct', placements: 120 },
    { month: 'Nov', placements: 180 },
    { month: 'Dec', placements: 250 }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

  return (
    <div className="p-8" data-testid="officer-dashboard">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Placement Dashboard</h1>
          <p className="text-gray-600 mt-1">Academic Year 2025-26 Overview</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="post-notification-button">
                📢 Post Update
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post Placement Update</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePostUpdate} className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={postData.title}
                    onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                    required
                    placeholder="e.g., New Placement Drive Announced"
                  />
                </div>
                <div>
                  <Label>Message</Label>
                  <Input
                    value={postData.message}
                    onChange={(e) => setPostData({ ...postData, message: e.target.value })}
                    required
                    placeholder="Details about the update..."
                  />
                </div>
                <div>
                  <Label>Upload Image</Label>
                  <Input type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setPostData({
                      ...postData,
                      image: e.target.files[0]
                    })
                  }
                  />
                  </div>
                <Button type="submit" className="w-full">Post Notification</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button onClick={() => navigate('/officer/drives')} data-testid="new-drive-button">
            <Plus className="mr-2" size={20} />
            New Drive
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Feedback Form</CardTitle>
            <p className="text-sm text-gray-600">Share Google Form links with students</p>
          </CardHeader>
          <CardContent>
            <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
              <DialogTrigger asChild>
                <Button className="w-full" data-testid="create-feedback-button">
                  + Create Feedback Form
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Feedback Form</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateFeedback} className="space-y-4">
                  <div>
                    <Label className="text-sm">Form Title</Label>
                    <Input
                      placeholder="e.g. Google Drive Feedback"
                      value={newFeedback.title}
                      onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                      required
                      data-testid="feedback-title-input"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Google Form Link</Label>
                    <Input
                      placeholder="https://forms.gle/..."
                      value={newFeedback.form_link}
                      onChange={(e) => setNewFeedback({ ...newFeedback, form_link: e.target.value })}
                      required
                      data-testid="feedback-link-input"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Timeline (Expiry Date)</Label>
                    <Input
                      type="date"
                      value={newFeedback.expiry_date}
                      onChange={(e) => setNewFeedback({ ...newFeedback, expiry_date: e.target.value })}
                      required
                      data-testid="feedback-expiry-input"
                    />
                  </div>
                  <Button type="submit" className="w-full" data-testid="post-feedback-button">Post Feedback Form</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base">Active Feedback Forms</CardTitle>
                <p className="text-sm text-gray-600">Forms automatically disappear after expiry</p>
              </div>
              <span className="text-sm font-medium">{feedbackForms.length} Active</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedbackForms.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No active feedback forms</p>
              ) : (
                feedbackForms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`feedback-form-${form.id}`}>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{form.title}</p>
                      <p className="text-xs text-gray-600">Expires: {form.expiry_date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={form.form_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        <ExternalLink size={16} />
                      </a>
                      <button onClick={() => handleDeleteFeedback(form.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold mt-2">{analytics.total_students}</p>
                <p className="text-xs text-green-600 mt-1">+4%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Placed Students</p>
                <p className="text-3xl font-bold mt-2">{analytics.placed_students}</p>
                <p className="text-xs text-green-600 mt-1">+2%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Drives</p>
                <p className="text-3xl font-bold mt-2">{analytics.active_drives}</p>
                <p className="text-xs text-red-600 mt-1">-5%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="text-purple-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Placement Rate</p>
                <p className="text-3xl font-bold mt-2">{analytics.placement_rate}%</p>
                <p className="text-xs text-green-600 mt-1">+6%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Building className="text-orange-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Placement Trend</CardTitle>
            <p className="text-sm text-gray-600">Monthly placement progress this year</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={placementTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Line type="monotone" dataKey="placements" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branch Distribution</CardTitle>
            <p className="text-sm text-gray-600">Placements by department</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={branchChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {branchChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {branchChartData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-xs text-gray-600">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Drives</CardTitle>
                <p className="text-sm text-gray-600">Campus recruitment activities</p>
              </div>
              <Button variant="link" size="sm" onClick={() => navigate('/officer/drives')} data-testid="view-all-drives">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDrives.map((drive) => (
                <div key={drive.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg" data-testid={`recent-drive-${drive.id}`}>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{drive.company}</p>
                    <p className="text-xs text-gray-600">{drive.drive_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{drive.registrations}</p>
                    <p className="text-xs text-gray-600">Registrations</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${drive.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {drive.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Top Performers</CardTitle>
                <p className="text-sm text-gray-600">Students with multiple offers</p>
              </div>
              <Button variant="link" size="sm" onClick={() => navigate('/officer/students')}>View All Students</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topStudents.map((student, idx) => (
                <div key={student.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg" data-testid={`top-student-${student.id}`}>
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{student.first_name} {student.last_name}</p>
                    <p className="text-xs text-gray-600">{student.branch} • CGPA: {student.cgpa}</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                    {student.offers} offers
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
