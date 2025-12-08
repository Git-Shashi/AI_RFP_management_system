import apiClient from './api';

export const proposalService = {
  // Get all proposals
  getAllProposals: async () => {
    const response = await apiClient.get('/proposals');
    return response.data;
  },

  // Get proposals for an RFP
  getProposalsByRFP: async (rfpId) => {
    const response = await apiClient.get(`/proposals/rfp/${rfpId}`);
    return response.data;
  },

  // Get single proposal
  getProposalById: async (id) => {
    const response = await apiClient.get(`/proposals/${id}`);
    return response.data;
  },

  // Compare proposals for an RFP
  compareProposals: async (rfpId) => {
    const response = await apiClient.get(`/proposals/rfp/${rfpId}/compare`);
    return response.data;
  },

  // Update proposal
  updateProposal: async (id, data) => {
    const response = await apiClient.put(`/proposals/${id}`, data);
    return response.data;
  },

  // Delete proposal
  deleteProposal: async (id) => {
    const response = await apiClient.delete(`/proposals/${id}`);
    return response.data;
  },
};

export default proposalService;
