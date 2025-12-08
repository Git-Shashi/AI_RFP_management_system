import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import rfpService from '@/services/rfpService';
import vendorService from '@/services/vendorService';
import proposalService from '@/services/proposalService';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function RFPDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  const { data: rfpData, isLoading: rfpLoading } = useQuery({
    queryKey: ['rfp', id],
    queryFn: () => rfpService.getRFPById(id),
  });

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendorService.getAllVendors,
  });

  const { data: proposalsData } = useQuery({
    queryKey: ['proposals', id],
    queryFn: () => proposalService.getProposalsByRFP(id),
  });

  const { data: comparisonData, refetch: refetchComparison } = useQuery({
    queryKey: ['comparison', id],
    queryFn: () => proposalService.compareProposals(id),
    enabled: false,
  });

  const sendMutation = useMutation({
    mutationFn: ({ rfpId, vendorIds }) => rfpService.sendRFPToVendors(rfpId, vendorIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['rfp', id]);
      setIsSendOpen(false);
      setSelectedVendors([]);
      alert('RFP sent successfully!');
    },
  });

  const handleSendRFP = () => {
    if (selectedVendors.length === 0) {
      alert('Please select at least one vendor');
      return;
    }
    sendMutation.mutate({ rfpId: id, vendorIds: selectedVendors });
  };

  const handleCompare = async () => {
    setShowComparison(true);
    await refetchComparison();
  };

  const rfp = rfpData?.rfp;
  const vendors = vendorsData?.vendors || [];
  const proposals = proposalsData?.proposals || [];
  const comparison = comparisonData?.comparison;

  if (rfpLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!rfp) {
    return <div className="text-center py-12">RFP not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/rfps')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{rfp.title}</h1>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
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
        <Button onClick={() => setIsSendOpen(true)} className="gap-2">
          <Send className="w-4 h-4" />
          Send to Vendors
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RFP Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{rfp.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(rfp.requirements, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Proposals */}
          {proposals.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Proposals ({proposals.length})</CardTitle>
                  {proposals.length >= 2 && (
                    <Button onClick={handleCompare} variant="outline" className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      Compare with AI
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{proposal.vendor.name}</h4>
                          <p className="text-sm text-gray-500">{proposal.vendor.email}</p>
                        </div>
                        {proposal.totalPrice && (
                          <p className="text-lg font-bold text-primary">
                            {formatCurrency(proposal.totalPrice)}
                          </p>
                        )}
                      </div>
                      {proposal.aiSummary && (
                        <div className="mt-2 p-3 bg-blue-50 rounded text-sm">
                          {proposal.aiSummary}
                        </div>
                      )}
                      {proposal.score && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500">AI Score: </span>
                          <span className="font-semibold">{proposal.score}/100</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Comparison */}
          {showComparison && comparison && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Comparison & Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-gray-700">{comparison.summary}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Vendor Scores</h4>
                  <div className="space-y-3">
                    {comparison.comparison.map((item, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{item.vendorName}</span>
                          <span className="text-lg font-bold text-primary">{item.score}/100</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-green-600 font-medium">Pros:</span>{' '}
                            {item.pros.join(', ')}
                          </div>
                          <div>
                            <span className="text-red-600 font-medium">Cons:</span>{' '}
                            {item.cons.join(', ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">
                    ✅ Recommended: {comparison.recommendation.recommendedVendor}
                  </h4>
                  <p className="text-sm text-green-800 mb-2">
                    {comparison.recommendation.reasoning}
                  </p>
                  <p className="text-xs text-green-700">
                    <strong>Considerations:</strong> {comparison.recommendation.considerations}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Budget</span>
                <p className="font-semibold text-lg">{formatCurrency(rfp.budget)}</p>
              </div>
              <div>
                <span className="text-gray-500">Deadline</span>
                <p className="font-semibold">{formatDate(rfp.deadline)}</p>
              </div>
              {rfp.paymentTerms && (
                <div>
                  <span className="text-gray-500">Payment Terms</span>
                  <p className="font-semibold">{rfp.paymentTerms}</p>
                </div>
              )}
              {rfp.warrantyPeriod && (
                <div>
                  <span className="text-gray-500">Warranty</span>
                  <p className="font-semibold">{rfp.warrantyPeriod}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {rfp.rfpVendors && rfp.rfpVendors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sent To</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rfp.rfpVendors.map((rv) => (
                    <div key={rv.id} className="text-sm">
                      <p className="font-semibold">{rv.vendor.name}</p>
                      <p className="text-gray-500">{rv.vendor.email}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Send RFP Dialog */}
      <Dialog open={isSendOpen} onOpenChange={setIsSendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send RFP to Vendors</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">Select vendors to send this RFP to:</p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {vendors.map((vendor) => (
                <label
                  key={vendor.id}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedVendors.includes(vendor.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVendors([...selectedVendors, vendor.id]);
                      } else {
                        setSelectedVendors(selectedVendors.filter((id) => id !== vendor.id));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{vendor.name}</p>
                    <p className="text-sm text-gray-500">{vendor.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendRFP} disabled={sendMutation.isPending}>
              {sendMutation.isPending ? 'Sending...' : 'Send RFP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
