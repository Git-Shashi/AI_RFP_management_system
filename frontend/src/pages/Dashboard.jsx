import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Users, CheckSquare, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import rfpService from '@/services/rfpService';
import vendorService from '@/services/vendorService';
import proposalService from '@/services/proposalService';
import { formatCurrency, formatRelativeTime } from '@/utils/helpers';

export default function Dashboard() {
  const { data: rfpsData } = useQuery({
    queryKey: ['rfps'],
    queryFn: rfpService.getAllRFPs,
  });

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendorService.getAllVendors,
  });

  const { data: proposalsData } = useQuery({
    queryKey: ['proposals'],
    queryFn: proposalService.getAllProposals,
  });

  const rfps = rfpsData?.rfps || [];
  const vendors = vendorsData?.vendors || [];
  const proposals = proposalsData?.proposals || [];

  const stats = [
    {
      title: 'Total RFPs',
      value: rfps.length,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Vendors',
      value: vendors.length,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Proposals Received',
      value: proposals.length,
      icon: CheckSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Open RFPs',
      value: rfps.filter(r => r.status === 'sent').length,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const recentRFPs = rfps.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to your RFP management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent RFPs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent RFPs</CardTitle>
        </CardHeader>
        <CardContent>
          {recentRFPs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No RFPs yet. Create your first RFP!</p>
          ) : (
            <div className="space-y-4">
              {recentRFPs.map((rfp) => (
                <Link
                  key={rfp.id}
                  to={`/rfps/${rfp.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{rfp.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {rfp.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Budget: {formatCurrency(rfp.budget)}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(rfp.createdAt)}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        rfp.status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : rfp.status === 'closed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {rfp.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
