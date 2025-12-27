import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    MapPin,
    Briefcase,
    CheckCircle,
    XCircle,
    AlertCircle,
    Activity,
    UserCheck,
    ClipboardList,
    Users,
    Plus,
    Edit
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Badge } from '../../components/common';
import { organizationsApi, referralsApi, usersApi } from '../../api';
import { Organization, Referral, User } from '../../types';

export const OrganizationDashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'staff' | 'settings'>('overview');

    // Organization Details State (for editing)
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState<{
        sectors_provided: string;
        locations_covered: string;
        is_active: boolean;
    }>({
        sectors_provided: '',
        locations_covered: '',
        is_active: true
    });

    // Fetch Organization Data
    const { data: organization, isLoading: isLoadingOrg } = useQuery({
        queryKey: ['organization', user?.organization_id],
        queryFn: async () => {
            if (!user?.organization_id) throw new Error("No organization ID");
            // @ts-ignore: Assuming organization_id exists on user based on role check
            return organizationsApi.getOrganization(user.organization_id);
        },
        enabled: !!user?.organization_id,
    });

    useEffect(() => {
        if (organization) {
            setEditForm({
                sectors_provided: organization.sectors_provided?.join(', ') || '',
                locations_covered: organization.locations_covered?.join(', ') || '',
                is_active: organization.is_active ?? true
            });
        }
    }, [organization]);

    // Fetch Incoming Referrals
    const { data: referrals, isLoading: isLoadingReferrals } = useQuery({
        queryKey: ['referrals', 'organization', user?.organization_id],
        queryFn: () => referralsApi.getReferrals(),
        // @ts-ignore: Filter logic
        select: (data) => Array.isArray(data) ? data.filter((r: Referral) => r.assigned_organization_id === user?.organization_id) : []
    });

    // Fetch Organization Staff
    const { data: staff, isLoading: isLoadingStaff } = useQuery({
        queryKey: ['users', 'organization', user?.organization_id],
        queryFn: () => usersApi.getUsers({ limit: 100 }), // Fetch all users then filter
        select: (response) => {
            // Filter users belonging to this organization
            // Note: In a real app with backend filtering, we'd pass org_id to api
            return response.data.filter((u: User) =>
                u.organization_id === user?.organization_id ||
                (u.organization_name === user?.organization_name && !!user?.organization_name)
            );
        },
        enabled: !!user?.organization_id
    });

    const pendingReferrals = referrals?.filter(r => r.status === 'pending') || [];
    const activeReferrals = referrals?.filter(r => ['accepted', 'in_progress'].includes(r.status)) || [];

    // Mutations
    const updateProfileMutation = useMutation({
        mutationFn: (data: Partial<Organization>) =>
            organizationsApi.updateOrganization(user?.organization_id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organization'] });
            setIsEditingProfile(false);
        }
    });

    const acceptReferralMutation = useMutation({
        mutationFn: (id: string) => referralsApi.acceptReferral(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['referrals'] })
    });

    const declineReferralMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string, reason: string }) => referralsApi.declineReferral(id, reason),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['referrals'] })
    });


    // Handlers
    const handleProfileSave = () => {
        updateProfileMutation.mutate({
            sectors_provided: editForm.sectors_provided.split(',').map(s => s.trim()).filter(Boolean),
            locations_covered: editForm.locations_covered.split(',').map(s => s.trim()).filter(Boolean),
            is_active: editForm.is_active
        });
    };

    const handleAccept = (id: string) => {
        if (confirm('Are you sure you want to accept this referral?')) {
            acceptReferralMutation.mutate(id);
        }
    };

    const handleDecline = (id: string) => {
        const reason = prompt('Please provide a reason for declining:');
        if (reason) {
            declineReferralMutation.mutate({ id, reason });
        }
    };


    if (isLoadingOrg) return <div>Loading...</div>;
    if (!organization) return <div>Organization profile not found. Please contact admin.</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{organization.organization_name}</h1>
                    <p className="text-sm text-gray-500">Organization Dashboard</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${organization.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {organization.is_active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        {organization.is_active ? 'Active for Referrals' : 'Currently Inactive'}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['overview', 'referrals', 'staff', 'settings'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`${activeTab === tab
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <div className="flex items-center p-4">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <AlertCircle size={24} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                                <p className="text-2xl font-semibold text-gray-900">{pendingReferrals.length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center p-4">
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <Activity size={24} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Active Cases</p>
                                <p className="text-2xl font-semibold text-gray-900">{activeReferrals.length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center p-4">
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                <UserCheck size={24} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Referrals</p>
                                <p className="text-2xl font-semibold text-gray-900">{referrals?.length || 0}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Recent Pending Referrals List */}
                    <div className="md:col-span-3">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Urgent Attention Required</h3>
                        {pendingReferrals.length === 0 ? (
                            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center text-gray-500">
                                No pending referrals. Good job!
                            </div>
                        ) : (
                            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                <ul className="divide-y divide-gray-200">
                                    {pendingReferrals.map((referral) => (
                                        <li key={referral.id} className="p-4 hover:bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-indigo-600 truncate">
                                                        {referral.client_name || 'Anonymous Client'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{referral.category} - {referral.priority?.toUpperCase()}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{referral.reason}</p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        size="sm"
                                                        onClick={() => handleAccept(referral.id)}
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDecline(referral.id)}
                                                    >
                                                        Decline
                                                    </Button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'staff' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Staff Management</h3>
                        <Button onClick={() => navigate('/users/create')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Staff
                        </Button>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoadingStaff ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Loading staff...
                                        </td>
                                    </tr>
                                ) : staff?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No staff members found. Add your first staff member!
                                        </td>
                                    </tr>
                                ) : (
                                    staff?.map((staffMember: User) => (
                                        <tr key={staffMember.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                                        {staffMember.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{staffMember.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{staffMember.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                                    {staffMember.role?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${staffMember.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {staffMember.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => navigate(`/users/${staffMember.id}/edit`)}
                                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-full hover:bg-indigo-100 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-2xl">
                    <Card title="Organization Profile & Availability">
                        <div className="space-y-4 p-4">
                            {!isEditingProfile ? (
                                <>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Sectors / Services Provided</h4>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {organization.sectors_provided?.map(s => (
                                                <Badge key={s} variant="info">{s}</Badge>
                                            ))}
                                            {(!organization.sectors_provided || organization.sectors_provided.length === 0) && <span className="text-gray-400 italic">No sectors listed</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Locations Covered</h4>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {organization.locations_covered?.map(l => (
                                                <Badge key={l} variant="default">{l}</Badge>
                                            ))}
                                            {(!organization.locations_covered || organization.locations_covered.length === 0) && <span className="text-gray-400 italic">No locations listed</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                        <p className={`mt-1 font-medium ${organization.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                            {organization.is_active ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>
                                    <div className="pt-4">
                                        <Button onClick={() => setIsEditingProfile(true)}>
                                            Edit Profile
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Sectors (comma separated)</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            value={editForm.sectors_provided}
                                            onChange={(e) => setEditForm({ ...editForm, sectors_provided: e.target.value })}
                                            placeholder="e.g. Health, Shelter, WASH"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Locations (comma separated)</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            value={editForm.locations_covered}
                                            onChange={(e) => setEditForm({ ...editForm, locations_covered: e.target.value })}
                                            placeholder="e.g. Borno, Maiduguri"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            checked={editForm.is_active}
                                            onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                                        />
                                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                            Active (Available to receive referrals)
                                        </label>
                                    </div>
                                    <div className="flex space-x-3 pt-4">
                                        <Button onClick={handleProfileSave} isLoading={updateProfileMutation.isPending}>
                                            Save Changes
                                        </Button>
                                        <Button variant="secondary" onClick={() => setIsEditingProfile(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'referrals' && (
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">All Referrals</h3>
                    {/* Here we would reuse a referral list component or a simple table */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {referrals?.map((referral) => (
                                <li key={referral.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-indigo-600">
                                                {referral.client_name}
                                            </p>
                                            <p className="text-sm text-gray-500">Status: <Badge variant={referral.status === 'pending' ? 'warning' : referral.status === 'accepted' ? 'success' : 'default'}>{referral.status}</Badge></p>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(referral.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
