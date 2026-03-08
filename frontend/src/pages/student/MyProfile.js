import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

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

export const MyProfile = () => {
  const { token, API, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put(`${API}/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills?.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...(profile.skills || []), newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    
    const formData = new FormData();
    formData.append('file', resumeFile);

    try {
      await axios.post(`${API}/profile/upload-resume`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Resume uploaded successfully');
      setResumeFile(null);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to upload resume');
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    
    try {
      await axios.delete(`${API}/profile/delete-resume`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Resume deleted successfully');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const calculateCompletion = () => {
    if (!profile) return 0;
    const fields = ['first_name', 'last_name', 'email', 'phone', 'branch', 'roll_number', 'cgpa', 'tenth_percentage', 'twelfth_percentage'];
    const completed = fields.filter(field => profile[field] && profile[field] !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  if (!profile) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const completion = calculateCompletion();

  return (
    <div className="p-8" data-testid="my-profile-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">{profile.first_name} {profile.last_name} • {profile.branch}</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} data-testid="edit-profile-button">Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} data-testid="save-profile-button">Save Changes</Button>
          </div>
        )}
      </div>

      <div className="mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold">Profile Completion</p>
              <span className="text-sm font-medium text-blue-600">{completion}%</span>
            </div>
            <Progress value={completion} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={profile.first_name || ''}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  disabled={!isEditing}
                  data-testid="first-name-input"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={profile.last_name || ''}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  disabled={!isEditing}
                  data-testid="last-name-input"
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile.email || ''} disabled />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
                data-testid="phone-input"
              />
            </div>
            <div>
              <Label>Year</Label>
              <Select 
                value={profile.year || ''} 
                onValueChange={(val) => setProfile({ ...profile, year: val })}
                disabled={!isEditing}
              >
                <SelectTrigger data-testid="year-select">
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
              <Label>Branch</Label>
              <Select 
                value={profile.branch || ''} 
                onValueChange={(val) => setProfile({ ...profile, branch: val })}
                disabled={!isEditing}
              >
                <SelectTrigger data-testid="branch-select">
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
              <Label>Roll Number</Label>
              <Input
                value={profile.roll_number || ''}
                onChange={(e) => setProfile({ ...profile, roll_number: e.target.value })}
                disabled={!isEditing}
                data-testid="roll-number-input"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>CGPA</Label>
              <Input
                type="number"
                step="0.01"
                value={profile.cgpa || ''}
                onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) })}
                disabled={!isEditing}
                data-testid="cgpa-input"
              />
            </div>
            <div>
              <Label>10th Percentage</Label>
              <Input
                type="number"
                step="0.01"
                value={profile.tenth_percentage || ''}
                onChange={(e) => setProfile({ ...profile, tenth_percentage: parseFloat(e.target.value) })}
                disabled={!isEditing}
                data-testid="tenth-percentage-input"
              />
            </div>
            <div>
              <Label>12th Percentage</Label>
              <Input
                type="number"
                step="0.01"
                value={profile.twelfth_percentage || ''}
                onChange={(e) => setProfile({ ...profile, twelfth_percentage: parseFloat(e.target.value) })}
                disabled={!isEditing}
                data-testid="twelfth-percentage-input"
              />
            </div>
            <div>
              <Label>Backlogs</Label>
              <Input
                type="number"
                value={profile.backlogs || 0}
                onChange={(e) => setProfile({ ...profile, backlogs: parseInt(e.target.value) })}
                disabled={!isEditing}
                data-testid="backlogs-input"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.resume_path ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">Resume uploaded</p>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleDeleteResume}
                      data-testid="delete-resume-button"
                    >
                      Delete
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Upload a new resume to replace the current one</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No resume uploaded</p>
              )}
              
              <div>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  data-testid="resume-file-input"
                />
                {resumeFile && (
                  <Button onClick={handleResumeUpload} className="mt-2 w-full" data-testid="upload-resume-button">
                    <Upload className="mr-2" size={16} />
                    Upload Resume
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill) => (
                  <div key={skill} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full" data-testid={`skill-tag-${skill}`}>
                    <span className="text-sm">{skill}</span>
                    {isEditing && (
                      <button onClick={() => handleRemoveSkill(skill)} data-testid={`remove-skill-${skill}`}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    data-testid="new-skill-input"
                  />
                  <Button onClick={handleAddSkill} data-testid="add-skill-button">Add</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};