import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Download } from 'lucide-react';

export const Analytics = () => {
  const { token, API } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [analyticsRes, studentsRes, drivesRes, companiesRes] = await Promise.all([
        axios.get(`${API}/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/students`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/drives`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/companies`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setAnalytics(analyticsRes.data);
      setStudents(studentsRes.data || []);
      setDrives(drivesRes.data || []);
      setCompanies(companiesRes.data || []);
    } catch (error) {
      toast.error('Failed to load analytics data');
    }
  };

  const handleDownloadReport = () => {
    toast.success('Generating analytics report...');
    setTimeout(() => {
      const reportContent = `
===========================================
PLACEMENT ANALYTICS REPORT
Generated on: ${new Date().toLocaleDateString()}
===========================================

OVERVIEW STATISTICS
-------------------
Total Students: ${analytics.total_students}
Placed Students: ${analytics.placed_students}
Placement Rate: ${analytics.placement_rate}%
Total Companies: ${analytics.total_companies}
Active Drives: ${analytics.active_drives}
Total Offers: ${analytics.total_offers}
Average CGPA: ${analytics.avg_cgpa}

YEAR-WISE PLACEMENT TREND
--------------------------
2020-21: 180 placements
2021-22: 220 placements
2022-23: 280 placements
2023-24: 320 placements
2024-25: 380 placements

BRANCH-WISE ANALYSIS
--------------------
${Object.entries((students || []).reduce((acc, s) => {
  const branch = s.branch || 'Other';
  if (!acc[branch]) acc[branch] = { total: 0, placed: 0 };
  acc[branch].total++;
  if (s.placed) acc[branch].placed++;
  return acc;
}, {})).map(([branch, data]) => `${branch}: ${data.placed}/${data.total} (${((data.placed/data.total)*100).toFixed(1)}%)`).join('\n')}

SALARY DISTRIBUTION
-------------------
3-5 LPA: 45 students
5-7 LPA: 68 students
7-10 LPA: 52 students
10-15 LPA: 28 students
15+ LPA: 12 students

TOP RECRUITERS
--------------
${(companies || []).slice(0, 5).map((c, i) => `${i+1}. ${c.name} - ${c.students_hired} hires (Avg: ${c.avg_package} LPA)`).join('\n')}

===========================================
End of Report
===========================================
      `;
      
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `placement_analytics_${new Date().toISOString().split('T')[0]}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report downloaded successfully');
    }, 1000);
  };

  if (!analytics) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  // Year-wise Placement Trend Data
  const yearWiseTrendData = [
    { year: '2020-21', placements: 180 },
    { year: '2021-22', placements: 220 },
    { year: '2022-23', placements: 280 },
    { year: '2023-24', placements: 320 },
    { year: '2024-25', placements: 380 }
  ];

  // Branch-wise data
  const branchData = (students || []).reduce((acc, student) => {
    const branch = student.branch || 'Other';
    if (!acc[branch]) acc[branch] = { total: 0, placed: 0 };
    acc[branch].total++;
    if (student.placed) acc[branch].placed++;
    return acc;
  }, {});

  const branchChartData = Object.entries(branchData).map(([branch, data]) => ({
    branch: branch.length > 20 ? branch.substring(0, 17) + '...' : branch,
    Total: data.total,
    Placed: data.placed
  }));

  // CGPA vs Placement Rate
  const cgpaPlacementData = [
    { cgpa: '6.0-6.5', rate: 45 },
    { cgpa: '6.5-7.0', rate: 58 },
    { cgpa: '7.0-7.5', rate: 72 },
    { cgpa: '7.5-8.0', rate: 85 },
    { cgpa: '8.0-8.5', rate: 92 },
    { cgpa: '8.5-9.0', rate: 96 },
    { cgpa: '9.0+', rate: 98 }
  ];

  // Salary Distribution
  const salaryDistributionData = [
    { range: '3-5 LPA', students: 45 },
    { range: '5-7 LPA', students: 68 },
    { range: '7-10 LPA', students: 52 },
    { range: '10-15 LPA', students: 28 },
    { range: '15+ LPA', students: 12 }
  ];

  // Monthly Placement Activity
  const monthlyActivityData = [
    { month: 'Aug', applications: 120, placements: 40 },
    { month: 'Sep', applications: 180, placements: 65 },
    { month: 'Oct', applications: 220, placements: 85 },
    { month: 'Nov', applications: 250, placements: 95 },
    { month: 'Dec', applications: 180, placements: 70 },
    { month: 'Jan', applications: 150, placements: 55 }
  ];

  // Company Hiring Data
  const companyHiringData = (companies || []).slice(0, 5).map(c => ({
    name: c.name,
    hired: c.students_hired
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="p-8" data-testid="analytics-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive placement statistics and insights</p>
        </div>
        <Button onClick={handleDownloadReport} data-testid="download-report-button">
          <Download className="mr-2" size={16} />
          Download Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Placement Rate</p>
            <p className="text-3xl font-bold mt-2 text-green-600">{analytics.placement_rate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg CGPA</p>
            <p className="text-3xl font-bold mt-2 text-blue-600">{analytics.avg_cgpa}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Companies</p>
            <p className="text-3xl font-bold mt-2">{analytics.total_companies}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Offers</p>
            <p className="text-3xl font-bold mt-2 text-purple-600">{analytics.total_offers}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Year-wise Placement Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={yearWiseTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="placements" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company-wise Hiring</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={companyHiringData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="hired"
                >
                  {companyHiringData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Branch-wise Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branch" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Total" fill="#3B82F6" />
                <Bar dataKey="Placed" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CGPA vs Placement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cgpaPlacementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cgpa" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2} name="Placement Rate (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Salary Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salaryDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Placement Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="placements" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};