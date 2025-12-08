import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import rfpService from '@/services/rfpService';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function RFPsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['rfps'],
    queryFn: rfpService.getAllRFPs,
  });

  const createMutation = useMutation({
    mutationFn: rfpService.createRFP,
    onSuccess: () => {
      queryClient.invalidateQueries(['rfps']);
      setIsCreateOpen(false);
      setUserInput('');
      setIsCreating(false);
    },
    onError: (error) => {
      console.error('Error creating RFP:', error);
      alert('Failed to create RFP. Please try again.');
      setIsCreating(false);
    },
  });

  const handleCreateRFP = async () => {
    if (!userInput.trim()) {
      alert('Please describe your RFP requirements');
      return;
    }

    setIsCreating(true);
    createMutation.mutate(userInput);
  };

  const rfps = data?.rfps || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RFPs</h1>
          <p className="text-gray-500 mt-1">Manage your Requests for Proposal</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create RFP
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading RFPs...</p>
        </div>
      ) : rfps.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No RFPs yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first RFP</p>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First RFP
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rfps.map((rfp) => (
            <Link key={rfp.id} to={`/rfps/${rfp.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{rfp.title}</CardTitle>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
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
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {rfp.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Budget:</span>
                      <span className="font-semibold">{formatCurrency(rfp.budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deadline:</span>
                      <span className="font-semibold">{formatDate(rfp.deadline)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Proposals:</span>
                      <span className="font-semibold">{rfp.proposals?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create RFP Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Create RFP with AI
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Describe your procurement needs</Label>
              <Textarea
                placeholder="Example: I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="min-h-[150px]"
                disabled={isCreating}
              />
              <p className="text-xs text-gray-500">
                Our AI will automatically structure your RFP based on this description
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRFP} disabled={isCreating} className="gap-2">
              {isCreating ? (
                <>Creating...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create with AI
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
