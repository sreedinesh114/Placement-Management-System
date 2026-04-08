import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Download } from "lucide-react";

export const ManageDrives = () => {
  const { token, API } = useAuth();
  const [drives, setDrives] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showApplicants, setShowApplicants] = useState(false);
  const [selectedDriveId, setSelectedDriveId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [newDrive, setNewDrive] = useState({
    company: '',
    role: '',
    package: '',
    drive_date: '',
    reporting_time: '',
    dept_eligibility: [],
    location: '',
    min_cgpa: 0,
    slots: 50,
    selection_process: '',
    status: 'upcoming',
    website: ''
  });

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const response = await axios.get(`${API}/drives`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrives(response.data);
    } catch (error) {
      toast.error('Failed to load drives');
    }
  };

  const handleAddDrive = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/drives`, newDrive, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Drive created successfully');
      setShowDialog(false);
      setNewDrive({ company: '', role: '', package: '', drive_date: '', location: 'Campus', min_cgpa: 0, slots: 50, status: 'upcoming', website: '' });
      fetchDrives();
    } catch (error) {
      toast.error('Failed to create drive');
    }
  };

  const handleDeleteDrive = async (driveId) => {
    if (!window.confirm('Are you sure you want to delete this drive?')) return;
    
    try {
      await axios.delete(`${API}/drives/${driveId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Drive deleted successfully');
      fetchDrives();
    } catch (error) {
      toast.error('Failed to delete drive');
    }
  };
  const fetchApplicants = async (driveId) => {
  try {
    const res = await axios.get(`${API}/drives/${driveId}/students`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setApplicants(res.data);
    setSelectedDriveId(driveId);
    setShowApplicants(true);

  } catch (err) {
    console.error(err);
    toast.error("Failed to load applicants");
  }
  };
  const downloadExcel = async () => {
  try {
    const res = await axios.get(
      `${API}/drives/${selectedDriveId}/students/export-excel`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "applicants.xlsx");
    document.body.appendChild(link);
    link.click();

  } catch (err) {
    toast.error("Excel download failed");
  }
};
  const filteredDrives = drives.filter(d => 
    d.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8" data-testid="manage-drives-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Drives</h1>
          <p className="text-gray-600 mt-1">Create and manage campus recruitment drives</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button data-testid="new-drive-button">
                <Plus className="mr-2" size={20} />
                New Drive
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Drive</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDrive} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name</Label>
                    <Input
                      value={newDrive.company}
                      onChange={(e) => setNewDrive({ ...newDrive, company: e.target.value })}
                      required
                      data-testid="drive-company-input"
                    />
                  </div>
                  <div>
                    <Label>Company Website</Label>
                    <Input
                      type="url"
                      placeholder="https://company.com"
                      value={newDrive.website}
                      onChange={(e) => setNewDrive({ ...newDrive, website: e.target.value })}
                      data-testid="drive-website-input"
                    />
                  </div>
                  <div>
                    <Label>Job Roles</Label>
                    <Input
                      value={newDrive.role}
                      onChange={(e) => setNewDrive({ ...newDrive, role: e.target.value })}
                      required
                      data-testid="drive-role-input"
                    />
                  </div>
                  <div>
                    <Label>Package (LPA)</Label>
                    <Input
                      value={newDrive.package}
                      onChange={(e) => setNewDrive({ ...newDrive, package: e.target.value })}
                      placeholder="e.g., 8-10 LPA"
                      required
                      data-testid="drive-package-input"
                    />
                  </div>
                  <div>
                    <Label>Drive Date</Label>
                    <Input
                      type="date"
                      value={newDrive.drive_date}
                      onChange={(e) => setNewDrive({ ...newDrive, drive_date: e.target.value })}
                      required
                      data-testid="drive-date-input"
                    />
                  </div>
                  <div>
  <Label>Reporting Time</Label>
  <Input
    type="time"
    value={newDrive.reporting_time}
    onChange={(e) =>
      setNewDrive({ ...newDrive, reporting_time: e.target.value })
    }
  />
</div>
<div>
  <Label>Venue</Label>
  <Input
    value={newDrive.venue}
    onChange={(e) =>
      setNewDrive({ ...newDrive, venue: e.target.value })
    }
    placeholder="e.g., Seminar Hall A"
  />
</div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={newDrive.location}
                      onChange={(e) => setNewDrive({ ...newDrive, location: e.target.value })}
                      data-testid="drive-location-input"
                    />
                  </div>
                  <div>
                    <Label>Minimum CGPA</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newDrive.min_cgpa}
                      onChange={(e) => setNewDrive({ ...newDrive, min_cgpa: parseFloat(e.target.value) })}
                      data-testid="drive-min-cgpa-input"
                    />
                  </div>
                  <div>
                    <Label>Total Slots</Label>
                    <Input
                      type="number"
                      value={newDrive.slots}
                      onChange={(e) => setNewDrive({ ...newDrive, slots: parseInt(e.target.value) })}
                      data-testid="drive-slots-input"
                    />
                  </div>
                  <div>
  <Label>Department Eligibility</Label>
  <Input
    value={newDrive.dept_eligibility}
    onChange={(e) =>
      setNewDrive({ ...newDrive, dept_eligibility: e.target.value })
    }
    placeholder="e.g., CSE, IT, ECE"
  />
</div>

<div>
  <Label>Selection Process</Label>
  <textarea
    className="w-full border rounded p-2"
    rows={3}
    value={newDrive.selection_process}
    onChange={(e) =>
      setNewDrive({ ...newDrive, selection_process: e.target.value })
    }
    placeholder="e.g., Aptitude → Technical → HR"
  />
</div>
                </div>
                <Button type="submit" className="w-full" data-testid="submit-drive-button">Create Drive</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search drives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-drives-input"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredDrives.map((drive) => (
          <Card key={drive.id} className="hover:shadow-lg transition-shadow" data-testid={`drive-card-${drive.id}`}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl">{drive.company}</h3>
                      <p className="text-gray-600">{drive.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        drive.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {drive.status}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDrive(drive.id)}
                        data-testid={`delete-drive-${drive.id}`}
                      >
                        <Trash2 className="text-red-500" size={18} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Package</p>
                      <p className="font-semibold">{drive.package}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Drive Date</p>
                      <p className="font-semibold">{drive.drive_date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold">{drive.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Registrations</p>
                      <p className="font-semibold">{drive.registrations}/{drive.slots}</p>
                    </div>
                  </div>
                  <Button
  onClick={() => fetchApplicants(drive.id)}
  className="mt-3"
>
  View Applicants
</Button>
                </div>
              </div>
    <Dialog open={showApplicants} onOpenChange={setShowApplicants}>
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Drive Applicants</DialogTitle>
      </DialogHeader>

      {/* Applicants List */}
      <div className="max-h-[400px] overflow-y-auto">
      <table className="w-full border rounded-lg overflow-hidden">

        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3 border">S.No</th>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Roll Number</th>
            <th className="p-3 border">Year</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Branch</th>
          </tr>
        </thead>

        <tbody>
          {applicants.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No applicants found
              </td>
            </tr>
          ) : (
            applicants.map((a, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-3 border">{i + 1}</td>
                <td className="p-3 border font-medium">{a.name}</td>
                <td className="p-3 border">{a.roll_number}</td>
                <td className="p-3 border">{a.year}</td>
                <td className="p-3 border">{a.email}</td>
                <td className="p-3 border">{a.branch}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* DOWNLOAD BUTTON */}
    <div className="mt-4 flex justify-end">
      <Button onClick={downloadExcel}>
        Download
      </Button>
    </div>
    </DialogContent>
  </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  
  );
};
