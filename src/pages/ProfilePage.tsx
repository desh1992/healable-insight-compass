import React, { useState, useEffect } from 'react';
import { getUserInfo, setUserInfo, StoredUserInfo } from '@/utils/storage';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/components/layout/AppLayout';

const ProfilePage: React.FC = () => {
  const [userInfo, setUserInfoState] = useState<StoredUserInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<Partial<StoredUserInfo>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const info = getUserInfo();
    if (!info) {
      // Redirect to login if no user info found
      navigate('/login');
      return;
    }
    setUserInfoState(info);
    setEditedInfo(info);
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset edited info to current user info
    if (userInfo) {
      setEditedInfo(userInfo);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (!userInfo || !editedInfo) return;

    // Merge existing userInfo with edited fields
    const updatedInfo = {
      ...userInfo,
      name: editedInfo.name || userInfo.name,
      email: editedInfo.email || userInfo.email,
      department: editedInfo.department || userInfo.department
    } as StoredUserInfo;

    // Save to localStorage
    setUserInfo(updatedInfo);
    setUserInfoState(updatedInfo);
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  if (!userInfo) {
    return <AppLayout title="User Profile"><div>Loading...</div></AppLayout>;
  }

  return (
    <AppLayout title="User Profile">
      <Card className="p-6 max-w-3xl mx-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-healable-primary text-white flex items-center justify-center text-2xl font-medium mb-4">
            {userInfo.name.split(' ').map(name => name[0]).join('').toUpperCase()}
          </div>
        </div>
        {isEditing ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={editedInfo.name || ''}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={editedInfo.email || ''}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={editedInfo.department || ''}
                onChange={handleChange}
                placeholder="e.g., Cardiology, Internal Medicine, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                value={userInfo.role}
                disabled
              />
              <p className="text-sm text-muted-foreground">
                Role cannot be changed
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Name</h3>
              <p className="text-gray-700">{userInfo.name}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Email</h3>
              <p className="text-gray-700">{userInfo.email}</p>
            </div>

            {userInfo.department && (
              <div>
                <h3 className="text-lg font-medium">Department</h3>
                <p className="text-gray-700">{userInfo.department}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium">Role</h3>
              <p className="text-gray-700">{userInfo.role}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">User ID</h3>
              <p className="text-gray-500">{userInfo.userId}</p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleEdit}>
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </Card>
    </AppLayout>
  );
};

export default ProfilePage; 