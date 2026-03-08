import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';

export const MyApplications = () => {
  const { token, API } = useAuth();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to load applications');
    }
  };

  const stats = {
    total: applications.length,
    selected: applications.filter(a => a.status === 'selected').length,
    pending: applications.filter(a => a.status === 'pending').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  return (
    <div className="p-8" data-testid="my-applications-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-1">Track the status of your placement applications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Applications</p>
            <p className="text-3xl font-bold mt-2">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Selected</p>
            <p className="text-3xl font-bold mt-2 text-green-600">{stats.selected}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-3xl font-bold mt-2 text-orange-600">{stats.pending}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application History</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No applications yet. Start applying to campus drives!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div 
                  key={app.id} 
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  data-testid={`application-${app.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-lg">{app.company}</h3>
                        <p className="text-sm text-gray-600">{app.role}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <span>Package: <span className="font-medium text-gray-900">{app.package}</span></span>
                      <span>Applied: {app.applied_date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Current Stage</p>
                      <p className="font-medium">{app.current_stage}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      app.status === 'selected' ? 'bg-green-100 text-green-700' :
                      app.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                    <ArrowRight className="text-gray-400" size={20} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};