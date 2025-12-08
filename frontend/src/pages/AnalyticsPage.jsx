import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, DollarSign, Package, Users, FileText, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import analyticsService from '@/services/analyticsService';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function AnalyticsPage() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getAnalyticsDashboard,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { analytics } = analyticsData || {};
  const { overview, rfpsByStatus, proposalsByStatus, proposalStats, vendorPerformance, budgetComparisons, recentProposals } = analytics || {};

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive insights into your RFP management</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RFPs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalRFPs || 0}</div>
            <p className="text-xs text-muted-foreground">
              {overview?.avgProposalsPerRFP || 0} avg proposals/RFP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalVendors || 0}</div>
            <p className="text-xs text-muted-foreground">Registered vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalProposals || 0}</div>
            <p className="text-xs text-muted-foreground">Submitted proposals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Proposal Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(proposalStats?.average || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Min: {formatCurrency(proposalStats?.minimum || 0)} | Max: {formatCurrency(proposalStats?.maximum || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* RFP Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              RFPs by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rfpsByStatus?.map(item => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'draft' ? 'bg-gray-400' :
                      item.status === 'sent' ? 'bg-blue-500' :
                      item.status === 'closed' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="capitalize font-medium">{item.status}</span>
                  </div>
                  <span className="text-2xl font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Proposals by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proposalsByStatus?.map(item => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'submitted' ? 'bg-blue-500' :
                      item.status === 'under_review' ? 'bg-yellow-500' :
                      item.status === 'accepted' ? 'bg-green-500' :
                      item.status === 'rejected' ? 'bg-red-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="capitalize font-medium">{item.status.replace('_', ' ')}</span>
                  </div>
                  <span className="text-2xl font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Vendors by Proposal Count
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vendorPerformance?.slice(0, 5).map((vendor, index) => (
              <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{vendor.name}</div>
                    <div className="text-sm text-gray-600">{vendor.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{vendor.proposalCount}</div>
                  <div className="text-xs text-gray-500">proposals</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Comparisons with Best Proposal Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            RFP Analysis with AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {budgetComparisons?.map(item => {
              const savings = item.budget - item.minProposalPrice;
              const savingsPercent = item.budget > 0 ? ((savings / item.budget) * 100).toFixed(1) : 0;
              
              return (
                <div key={item.rfpId} className="border rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{item.rfpTitle}</h3>
                      <p className="text-sm text-gray-500 mt-1">Budget: {formatCurrency(item.budget)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{item.proposalCount} proposals</div>
                      {item.proposalCount > 0 && (
                        <div className={`text-lg font-bold ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {savings >= 0 ? 'Save ' : 'Over '}{formatCurrency(Math.abs(savings))}
                          <span className="text-xs ml-1">({savingsPercent}%)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {item.proposalCount > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Best Overall (by AI Score) */}
                      {item.bestProposal && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-900">🏆 Recommended</span>
                          </div>
                          <div className="space-y-1">
                            <div className="font-bold text-gray-900">{item.bestProposal.vendor}</div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(item.bestProposal.price)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Score: <span className="font-semibold">{item.bestProposal.score}/100</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Delivery: {item.bestProposal.deliveryTime}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Best Price */}
                      {item.bestByPrice && item.bestByPrice.id !== item.bestProposal?.id && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                            <span className="font-semibold text-blue-900">💰 Lowest Price</span>
                          </div>
                          <div className="space-y-1">
                            <div className="font-bold text-gray-900">{item.bestByPrice.vendor}</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(item.bestByPrice.price)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Delivery: {item.bestByPrice.deliveryTime}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Statistics */}
                      <div className="bg-gray-50 border rounded-lg p-4">
                        <div className="font-semibold text-gray-700 mb-2">Statistics</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Average Price:</span>
                            <span className="font-semibold">{formatCurrency(item.avgProposalPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lowest Price:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(item.minProposalPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Budget Used:</span>
                            <span className="font-semibold">{item.budgetUtilization.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No proposals received yet
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Proposals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Proposals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentProposals?.slice(0, 10).map(proposal => (
              <div key={proposal.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-semibold">{proposal.rfp.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Vendor: {proposal.vendor.name}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Delivery: {proposal.deliveryTime}</span>
                    <span>Warranty: {proposal.warranty}</span>
                    <span className={`px-2 py-1 rounded ${
                      proposal.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                      proposal.status === 'under_review' ? 'bg-yellow-100 text-yellow-700' :
                      proposal.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      proposal.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {proposal.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(proposal.totalPrice)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(proposal.receivedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
