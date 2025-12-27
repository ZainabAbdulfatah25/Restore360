import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    MapPin,
    Search,
    Filter,
    Phone,
    Mail,
    Globe,
    ExternalLink
} from 'lucide-react';
import { MainLayout } from '../../layouts';
import { Card, Button, Badge, Input, Select, Spinner } from '../../components/common';
import { organizationsApi } from '../../api';
import { Organization, OrganizationFilterParams } from '../../types';

const SECTORS = [
    'Protection',
    'Health',
    'Education',
    'WASH',
    'Shelter',
    'Food Security',
    'Nutrition',
    'Legal Assistance',
    'Psychosocial Support (PSS)',
    'Livelihood'
];

export const ServiceDirectoryPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');

    const { data: organizations, isLoading } = useQuery({
        queryKey: ['organizations', selectedSector, selectedLocation],
        queryFn: () => {
            const filters: OrganizationFilterParams = {};
            if (selectedSector) filters.sector = selectedSector;
            // Notes: location filter in API is basic array containment, 
            // for search query we might need client side filtering if API doesn't support text search
            return organizationsApi.getOrganizations(filters);
        }
    });

    const filteredOrganizations = organizations?.filter(org => {
        const matchesSearch =
            org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.organization_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesLocation = !selectedLocation ||
            org.locations_covered?.some(loc => loc.toLowerCase().includes(selectedLocation.toLowerCase()));

        return matchesSearch && matchesLocation;
    }) || [];

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Service Directory</h1>
                    <p className="text-gray-600 mt-1">
                        Find organizations, services, and support in your area.
                    </p>
                </div>

                <Card>
                    <div className="p-4 space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder="Search by name or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="w-full md:w-64">
                                <Select
                                    label=""
                                    value={selectedSector}
                                    onChange={(e) => setSelectedSector(e.target.value)}
                                    options={[
                                        { value: '', label: 'All Sectors' },
                                        ...SECTORS.map(s => ({ value: s, label: s }))
                                    ]}
                                />
                            </div>
                            <div className="w-full md:w-64">
                                <Input
                                    placeholder="Filter by Location (e.g. Lagos)"
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner size="lg" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOrganizations.length > 0 ? (
                            filteredOrganizations.map((org) => (
                                <Card key={org.id} className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                                    <div className="p-6 flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-xl">
                                                    {(org.organization_name || org.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={org.organization_name || org.name}>
                                                        {org.organization_name || org.name}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${org.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {org.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 flex-1">
                                            <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                                                {org.description || 'No description provided.'}
                                            </p>

                                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                                                <div className="flex flex-wrap gap-1">
                                                    {org.locations_covered && org.locations_covered.length > 0 ? (
                                                        org.locations_covered.slice(0, 3).map((loc, idx) => (
                                                            <span key={idx} className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                                                                {loc}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="italic text-gray-400">No locations listed</span>
                                                    )}
                                                    {org.locations_covered && org.locations_covered.length > 3 && (
                                                        <span className="text-xs text-gray-500">+{org.locations_covered.length - 3} more</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {org.sectors_provided?.slice(0, 4).map((sector, idx) => (
                                                    <Badge key={idx} variant="info" className="text-xs">
                                                        {sector}
                                                    </Badge>
                                                ))}
                                                {org.sectors_provided && org.sectors_provided.length > 4 && (
                                                    <Badge variant="default" className="text-xs">+{org.sectors_provided.length - 4}</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                                            <div className="flex gap-2">
                                                {org.contact_email && (
                                                    <a href={`mailto:${org.contact_email}`} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors" title="Email">
                                                        <Mail className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {org.contact_phone && (
                                                    <a href={`tel:${org.contact_phone}`} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors" title="Call">
                                                        <Phone className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                            {/* Could add a 'View Details' or 'Refer' button here later */}
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No organizations found</h3>
                                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};
