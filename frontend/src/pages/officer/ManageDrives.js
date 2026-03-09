import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Plus, Search, Trash2, Download } from 'lucide-react';

export const ManageDrives = () => {
  const { token, API } = useAuth();
  const [drives, setDrives] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newDrive, setNewDrive] = useState({
    company: '',
    role: '',
    package: '',
    drive_date: '',
    location: 'Campus',
    min_cgpa: 0,
    slots: 50,
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
  const handleViewApplicants = async (driveId) => {
  try {
    const res = await axios.get(`${API}/drives/${driveId}/students`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setSelectedStudents(res.data);
    setSelectedDriveId(driveId);
    setShowModal(true);

  } catch (error) {
    console.error(error);
    toast.error("Failed to load applicants");
  }
};
const downloadApplicants = async () => {
  try {
    const res = await axios.get(
      `${API}/drives/${selectedDriveId}/students/export`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: "blob"
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "drive_applicants.csv");
    document.body.appendChild(link);
    link.click();

  } catch (error) {
    toast.error("Failed to download CSV");
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
                    <Label>Job Role</Label>
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

  <Button
    className="mt-2"
    size="sm"
    onClick={() => handleViewApplicants(drive.id)}
  >
    View Applicants
  </Button>
</div>

                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {showModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-3/4 max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-bold">Drive Applicants</h2>

  <Button onClick={downloadApplicants}>
  <Download size={16} className="mr-2" />
  Download
</Button>
</div>

      {selectedStudents.length === 0 ? (
        <p>No students applied yet</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Branch</th>
              <th className="p-2 border">CGPA</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {selectedStudents.map((s, i) => (
              <tr key={i}>
                <td className="border p-2">{s.name}</td>
                <td className="border p-2">{s.email}</td>
                <td className="border p-2">{s.branch}</td>
                <td className="border p-2">{s.cgpa}</td>
                <td className="border p-2">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4 text-right">
        <Button onClick={() => setShowModal(false)}>Close</Button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};