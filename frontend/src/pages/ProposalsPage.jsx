import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import proposalService from '@/services/proposalService';
import { formatCurrency, formatRelativeTime } from '@/utils/helpers';

export default function ProposalsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: proposalService.getAllProposals,
  });

  const proposals = data?.proposals || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
        <p className="text-gray-500 mt-1">All received vendor proposals</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading proposals...</p>
        </div>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No proposals yet</h3>
              <p className="text-gray-500">Proposals will appear here when vendors respond to RFPs</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{proposal.rfp.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      From: <span className="font-semibold">{proposal.vendor.name}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    {proposal.totalPrice && (
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(proposal.totalPrice)}
                      </p>
                    )}
                    {proposal.score && (
                      <p className="text-sm text-gray-500">Score: {proposal.score}/100</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {proposal.aiSummary && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">{proposal.aiSummary}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {proposal.deliveryTime && (
                    <div>
                      <span className="text-gray-500">Delivery:</span>
                      <p className="font-semibold">{proposal.deliveryTime}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Received:</span>
                    <p className="font-semibold">{formatRelativeTime(proposal.receivedAt)}</p>
                  </div>
                </div>

                {proposal.terms && (
                  <div className="mt-4">
                    <span className="text-sm text-gray-500">Terms:</span>
                    <p className="text-sm mt-1">{proposal.terms}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
