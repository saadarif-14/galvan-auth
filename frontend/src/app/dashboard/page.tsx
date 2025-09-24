'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';
import { authManager } from '@/lib/auth';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber?: string;
  profilePictureUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toasts, success, error: showError, removeToast } = useToast();

  const loadUserProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Get user profile from backend
      const userData = await apiFetch<User>("/auth/profile");
      setUser(userData);
      success('Profile loaded successfully!', 'Welcome to your dashboard.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      showError('Profile loading failed', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [success, showError]);

  useEffect(() => {
    // Check if user is logged in
    if (!authManager.isAuthenticated() || !authManager.isUser()) {
      router.replace('/user-login');
      return;
    }
    
    // Load user profile
    loadUserProfile();
  }, [router, loadUserProfile]);

  const handleLogout = async () => {
    try {
      await authManager.logout();
      success('Logged out successfully!', 'You have been logged out of your account.');
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout request fails
      router.replace('/');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <div className="p-6">
            <Alert variant="error">{error}</Alert>
            <Button onClick={() => router.replace('/user-login')} className="w-full mt-4">
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Galvan AI</h1>
            </div>
            <Button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  {user?.profilePictureUrl ? (
                    <Image
                      className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                      src={`http://localhost:5000${user.profilePictureUrl}`}
                      alt={`${user.firstName} ${user.lastName}`}
                      width={96}
                      height={96}
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                              <span class="text-3xl font-bold text-white">
                                ${user.firstName.charAt(0)}${user.lastName.charAt(0)}
                              </span>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-3xl font-bold text-white">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.firstName} {user?.lastName}!
                  </h2>
                  <p className="text-lg text-gray-600 mb-4">
                    {user?.email}
                  </p>
                  
                  {/* Status Badges */}
                  <div className="flex space-x-3">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      user?.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      user?.isVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user?.isVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Personal Information
              </CardTitle>
              <CardDescription>
                Your account details and contact information
              </CardDescription>
            </CardHeader>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-500">Full Name</span>
                <span className="text-sm text-gray-900">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-500">Email</span>
                <span className="text-sm text-gray-900">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-500">Mobile</span>
                <span className="text-sm text-gray-900">
                  {user?.mobileNumber || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-500">Account Status</span>
                <span className={`text-sm font-medium ${
                  user?.isActive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500">Verification</span>
                <span className={`text-sm font-medium ${
                  user?.isVerified ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {user?.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          
        </div>

        {/* Welcome Message */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                🎉 Welcome to Galvan AI!
              </CardTitle>
              <CardDescription className="text-lg text-gray-700">
                You&apos;re all set up and ready to go. Your account has been created and you can now access all the features of our platform.
              </CardDescription>
            </CardHeader>
            <div className="p-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-gray-700">
                  Thank you for joining Galvan AI! We&apos;re excited to have you on board. 
                  If you have any questions or need assistance, please don&apos;t hesitate to reach out to our support team.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
