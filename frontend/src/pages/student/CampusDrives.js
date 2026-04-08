import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

export const CampusDrives = () => {
  const { token, API, user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [drivesRes, appsRes, profileRes] = await Promise.all([
        axios.get(`${API}/drives`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/applications`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/profile`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setDrives(drivesRes.data.filter(d => d.status === 'upcoming'));
      setApplications(appsRes.data);
    } catch (error) {
      toast.error('Failed to load drives');
    }
  };

  const handleApply = async (drive) => {
    try {
      const profileRes = await axios.get(`${API}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const profile = profileRes.data;
      
      if (!profile.cgpa || profile.cgpa < drive.min_cgpa) {
        toast.error(`Minimum CGPA required: ${drive.min_cgpa}. Your CGPA: ${profile.cgpa || 'Not set'}`);
        return;
      }
      
      await axios.post(`${API}/applications`, {
        drive_id: drive.id,
        company: drive.company,
        role: drive.role,
        package: drive.package,
        applied_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        current_stage: 'Applied'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Successfully applied to ${drive.company}!`);
      fetchData();
    } catch (error) {
      console.error('Application error:', error);
      
      // Handle different error response formats
      let errorMessage = 'Failed to apply. Please try again.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check if it's a simple string detail
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } 
        // Check if it's a validation error array
        else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map(err => err.msg).join(', ');
        }
        // Check if it's a validation error object
        else if (errorData.detail && typeof errorData.detail === 'object') {
          errorMessage = JSON.stringify(errorData.detail);
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const hasApplied = (driveId) => {
    return applications.some(app => app.drive_id === driveId);
  };

  const isEligible = (drive) => {
    return user?.cgpa >= drive.min_cgpa && user?.backlogs === 0;
  };

  const filteredDrives = drives.filter(d => 
    d.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: drives.length,
    eligible: drives.filter(d => isEligible(d)).length,
    applied: applications.length
  };

  return (
    <div className="p-8" data-testid="campus-drives-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Campus Drives</h1>
        <p className="text-gray-600 mt-1">Browse and apply for upcoming placement opportunities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Drives</p>
            <p className="text-3xl font-bold mt-2">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Eligible</p>
            <p className="text-3xl font-bold mt-2 text-green-600">{stats.eligible}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Applied</p>
            <p className="text-3xl font-bold mt-2 text-blue-600">{stats.applied}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search companies or roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-drives-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrives.map((drive) => {
          const applied = hasApplied(drive.id);
          const eligible = isEligible(drive);
          
          return (
            <Card key={drive.id} className="hover:shadow-lg transition-shadow" data-testid={`drive-card-${drive.id}`}>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <h3 className="font-bold text-xl mb-1">{drive.company}</h3>
                  <p className="text-gray-600">{drive.role}</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-green-600 text-lg">{drive.package}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>{drive.drive_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>{drive.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>{drive.registrations}/{drive.slots} registered</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Min CGPA:</span> {drive.min_cgpa}
                  </div>
                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    <p><b>Venue:</b> {drive.venue || "N/A"}</p>
                    <p><b>Reporting Time:</b> {drive.reporting_time || "N/A"}</p>
                    <p><b>Eligible Dept:</b> {drive.dept_eligibility || "All"}</p>
                    </div>
                </div>

                {applied ? (
                  <Button className="w-full" disabled data-testid={`applied-button-${drive.id}`}>
                    Applied
                  </Button>
                ) : eligible ? (
                  <Button 
                    className="w-full" 
                    onClick={() => handleApply(drive)}
                    data-testid={`apply-button-${drive.id}`}
                  >
                    Apply Now
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled data-testid={`not-eligible-button-${drive.id}`}>
                    Not Eligible
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
