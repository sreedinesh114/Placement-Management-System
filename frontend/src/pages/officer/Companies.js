import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Plus, Search, Building2, Calendar, Pencil, Trash2 } from 'lucide-react';

export const Companies = () => {
  const { token, API } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    students_hired: 0,
    avg_package: 0,
    status: 'active',
    website: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API}/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(response.data);
    } catch (error) {
      toast.error('Failed to load companies');
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/companies`, newCompany, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Company added successfully');
      setShowDialog(false);
      setNewCompany({ name: '', industry: '', students_hired: 0, avg_package: 0, status: 'active', website: '' });
      fetchCompanies();
    } catch (error) {
      toast.error('Failed to add company');
    }
  };
  const handleEditCompany = (company) => {
  setSelectedCompany(company);
  setShowEditDialog(true);
  setCompanyName(company.name);
setIndustry(company.industry);
};

  const handleDeleteCompany = async (companyId) => {
  if (!window.confirm("Are you sure you want to delete this company?")) return;

  try {
    await axios.delete(`${API}/companies/${companyId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    toast.success("Company deleted successfully");
    fetchCompanies();

  } catch (error) {
    console.log(error);
    toast.error(error.response?.data?.detail || "Delete failed");
  }
};

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: companies.length,
    active: companies.filter(c => c.status === 'active').length,
    totalHired: companies.reduce((sum, c) => sum + c.students_hired, 0),
    upcoming: 2
  };

  return (
    <div className="p-8" data-testid="companies-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-1">Manage partner companies and recruiters</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button data-testid="add-company-button">
              <Plus className="mr-2" size={20} />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  required
                  data-testid="company-name-input"
                />
              </div>
              <div>
                <Label>Industry</Label>
                <Input
                  value={newCompany.industry}
                  onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                  required
                  data-testid="company-industry-input"
                />
              </div>
              <div>
                <Label>Company Website</Label>
                <Input
                  type="url"
                  placeholder="https://company.com"
                  value={newCompany.website}
                  onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                  required
                  data-testid="company-website-input"
                />
              </div>
              <div>
                <Label>Average Package (LPA)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newCompany.avg_package}
                  onChange={(e) => setNewCompany({ ...newCompany, avg_package: parseFloat(e.target.value) })}
                  data-testid="company-package-input"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="submit-company-button">Add Company</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Companies</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Partners</p>
                <p className="text-3xl font-bold mt-2 text-green-600">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hired</p>
                <p className="text-3xl font-bold mt-2 text-purple-600">{stats.totalHired}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="text-purple-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-3xl font-bold mt-2 text-orange-600">{stats.upcoming}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-orange-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-companies-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow" data-testid={`company-card-${company.id}`}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{company.name}</h3>
                    <p className="text-sm text-gray-600">{company.industry}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  company.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {company.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Students Hired</span>
                  <span className="font-semibold">{company.students_hired}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Package</span>
                  <span className="font-semibold">{company.avg_package} LPA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Visit</span>
                  <span className="font-semibold">{company.last_visit || 'N/A'}</span>
                </div>
              </div>
    <div className="flex gap-2 mt-3">
      <a
        href={company.website || "#"}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="outline"
          disabled={!company.website}
        >
          View Details
        </Button>
      </a>

      <Button
        variant="outline"
        onClick={() => handleEditCompany(company)}
      >
        <Pencil size={16} className="mr-1" />
        Edit
      </Button>

      <Button
        variant="destructive"
        onClick={() => handleDeleteCompany(company.id)}
      >
        <Trash2 size={16} className="mr-1" />
        Delete
      </Button>
    </div>
  </CardContent>
</Card>
        ))}
      </div>
    </div>
  );
};