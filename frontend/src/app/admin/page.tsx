'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useRouter } from 'next/navigation';
import OTPVerificationModal from '@/components/auth/OTPVerificationModal';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';
import { authManager } from '@/lib/auth';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  profilePictureUrl?: string;
  createdAt?: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    mobileNumber: '',
    role: 'USER',
    profilePictureUrl: ''
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toasts, success: showSuccess, error: showError, removeToast } = useToast();

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<User[]>("/admin/users");
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Check if user is admin
    if (!authManager.isAuthenticated() || !authManager.isAdmin()) {
      router.replace('/admin-login');
      return;
    }
    
    // Load users if authorized
    loadUsers();
    setIsAuthorized(true);
  }, []);

  const resetForm = () => {
    setForm({ firstName: '', lastName: '', email: '', password: '', mobileNumber: '', role: 'USER', profilePictureUrl: '' });
    setEditingUser(null);
    setProfilePicture(null);
    setProfilePicturePreview('');
    setError('');
    setSuccess('');
    setShowCreateModal(false);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', 'temp');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api'}/upload/profile-picture`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Profile picture upload error:', error);
      return null;
    }
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');
    
    try {
      let profilePictureUrl = form.profilePictureUrl;
      
      // Upload profile picture if selected
      if (profilePicture) {
        const uploadedUrl = await uploadProfilePicture(profilePicture);
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl;
        } else {
          setError('Failed to upload profile picture');
          setCreating(false);
          return;
        }
      }

      const userData = {
        ...form,
        profilePictureUrl
      };

      if (editingUser) {
        // Update existing user
        await apiFetch<User>(`/admin/users/${editingUser.id}`, { 
          method: 'PUT', 
          body: JSON.stringify(userData) 
        });
        showSuccess('User updated successfully!', `User ${form.firstName} ${form.lastName} has been updated.`);
        setShowCreateModal(false);
        resetForm();
      loadUsers();
      } else {
        // Create new user (this will send OTP)
        await apiFetch<User>("/admin/users", { 
          method: 'POST', 
          body: JSON.stringify(userData) 
        });
        
        // Store pending user data and show OTP modal
        setPendingUserData(userData);
        setShowOTPModal(true);
        showSuccess('OTP sent to user email!', 'Please verify the OTP to complete user creation.');
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setCreating(false);
    }
  };

  const editUser = (user: User) => {
    setEditingUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      mobileNumber: user.mobileNumber || '',
      role: user.role,
      profilePictureUrl: user.profilePictureUrl || ''
    });
    setProfilePicture(null);
    setProfilePicturePreview(user.profilePictureUrl || '');
    setError('');
    setSuccess('');
    setShowCreateModal(true);
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
      showSuccess('User deleted successfully!', 'The user has been removed from the system.');
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };


  const handleLogout = async () => {
    try {
      await authManager.logout();
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout request fails
      router.replace('/');
    }
  };

  const handleOTPVerification = async (otp: string) => {
    if (!pendingUserData) {
      throw new Error('No pending user data found');
    }

    console.log('Verifying OTP for user:', pendingUserData.email, 'with OTP:', otp);

    // Verify OTP with backend
    const response = await apiFetch("/auth/verify-otp", {
      method: 'POST',
      body: JSON.stringify({
        email: pendingUserData.email,
        otp: otp
      })
    });

    console.log('OTP verification response:', response);

    // If verification successful, complete user creation
    showSuccess('User created successfully!', 'OTP verified and user account is now active.');
    setShowOTPModal(false);
    setPendingUserData(null);
    setShowCreateModal(false);
    resetForm();
    loadUsers();
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Create and manage users</p>
          </div>
            <Button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </Button>
          </div>
          </div>

        {/* Create User Button */}
        <div className="mb-6">
          <Button 
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <span className="mr-2">+</span>
            Create New User
          </Button>
          </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Users Management
            </CardTitle>
            <CardDescription>
              Manage existing users in the system
            </CardDescription>
          </CardHeader>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
            </tr>
          </thead>
              <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.profilePictureUrl ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                                src={`http://localhost:5000${user.profilePictureUrl}`}
                                alt={`${user.firstName} ${user.lastName}`}
                                onError={(e) => {
                                  // Fallback to initials if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-200">
                                        <span class="text-sm font-bold text-white">
                                          ${user.firstName.charAt(0)}${user.lastName.charAt(0)}
                                        </span>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-200">
                                <span className="text-sm font-bold text-white">
                                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.mobileNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN' 
                            ? 'bg-red-100 text-red-800' 
                            : user.role === 'MANAGER'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'SUPERVISOR'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => editUser(user)}
                            className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                </td>
              </tr>
                  ))
                )}
          </tbody>
        </table>
          </div>
        </Card>
      </div>

      {/* OTP Verification Modal */}
      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={submitCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700">
                    Mobile Number
                  </Label>
                  <Input
                    id="mobileNumber"
                    placeholder="Enter mobile number"
                    value={form.mobileNumber}
                    onChange={e => setForm({ ...form, mobileNumber: e.target.value })}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                    Role *
                  </Label>
                  <select
                    id="role"
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-black font-medium shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none hover:border-gray-400"
                  >
                    <option value="USER" className="text-black font-medium">👤 USER</option>
                    <option value="ADMIN" className="text-black font-medium">👑 ADMIN</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={editingUser ? "Enter new password" : "Enter password"}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required={!editingUser}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profilePicture" className="text-sm font-medium text-gray-700">
                    Profile Picture
                  </Label>
                  <div className="flex items-center space-x-4">
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {profilePicturePreview && (
                    <div className="mt-2">
                      <img
                        src={profilePicturePreview}
                        alt="Profile preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {(error || success) && (
                <div className="mt-4">
                  {error && <Alert variant="error">{error}</Alert>}
                  {success && <Alert variant="success">{success}</Alert>}
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={creating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  {creating ? 'Processing...' : (editingUser ? 'Update User' : 'Create User')}
                </Button>
                
                <Button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false);
          setPendingUserData(null);
        }}
        onVerify={handleOTPVerification}
        userEmail={pendingUserData?.email || ''}
        loading={creating}
      />
      
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}