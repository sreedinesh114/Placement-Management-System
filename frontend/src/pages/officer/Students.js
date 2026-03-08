import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Search, Download } from 'lucide-react';

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

export const Students = () => {
  const { token, API } = useAuth();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data || []);
    } catch (error) {
      toast.error('Failed to load students');
      setStudents([]);
    }
  };

  const handleExportList = async () => {
    try {
      const response = await axios.get(`${API}/students/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students_list_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Students list exported successfully');
    } catch (error) {
      toast.error('Failed to export students list');
    }
  };

  const filteredStudents = (students || []).filter(s => {
    const matchesSearch = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = branchFilter === 'all' || s.branch === branchFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'placed' && s.placed) ||
      (statusFilter === 'pending' && !s.placed);
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const studentsList = students || [];
  const stats = {
    total: studentsList.length,
    placed: studentsList.filter(s => s.placed).length,
    pending: studentsList.filter(s => !s.placed).length,
    avgCGPA: studentsList.length > 0 ? (studentsList.reduce((sum, s) => sum + (s.cgpa || 0), 0) / studentsList.length).toFixed(2) : '0.00'
  };

  return (
    <div className="p-8" data-testid="students-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">View and manage student records</p>
        </div>
        <Button onClick={handleExportList} data-testid="export-students-button">
          <Download className="mr-2" size={16} />
          Export List
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-3xl font-bold mt-2">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Placed</p>
            <p className="text-3xl font-bold mt-2 text-green-600">{stats.placed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-3xl font-bold mt-2 text-orange-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg CGPA</p>
            <p className="text-3xl font-bold mt-2 text-blue-600">{stats.avgCGPA}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-students-input"
          />
        </div>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-64" data-testid="filter-branch-select">
            <SelectValue placeholder="All Branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {BRANCHES.map(branch => (
              <SelectItem key={branch} value={branch}>{branch}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="filter-status-select">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="placed">Placed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="font-semibold text-lg">Student List</h3>
            <p className="text-sm text-gray-600">{filteredStudents.length} students found</p>
          </div>
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" data-testid={`student-row-${student.id}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    {student.first_name?.[0]}{student.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{student.first_name} {student.last_name}</p>
                    <p className="text-sm text-gray-600">{student.branch || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">CGPA</p>
                    <p className="font-semibold">{student.cgpa || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Offers</p>
                    <p className="font-semibold">{student.offers || 0}</p>
                  </div>
                  <div className="text-center min-w-[100px]">
                    <p className="text-xs text-gray-600">Company</p>
                    <p className="font-semibold text-sm">{student.placed ? 'Google' : '-'}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium min-w-[80px] text-center ${
                    student.placed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {student.placed ? 'Placed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};