import apiClient from './api';

export const rfpService = {
  // Create RFP from natural language
  createRFP: async (userInput) => {
    const response = await apiClient.post('/rfps', { userInput });
    return response.data;
  },

  // Get all RFPs
  getAllRFPs: async () => {
    const response = await apiClient.get('/rfps');
    return response.data;
  },

  // Get single RFP
  getRFPById: async (id) => {
    const response = await apiClient.get(`/rfps/${id}`);
    return response.data;
  },

  // Update RFP
  updateRFP: async (id, data) => {
    const response = await apiClient.put(`/rfps/${id}`, data);
    return response.data;
  },

  // Delete RFP
  deleteRFP: async (id) => {
    const response = await apiClient.delete(`/rfps/${id}`);
    return response.data;
  },

  // Send RFP to vendors
  sendRFPToVendors: async (id, vendorIds) => {
    const response = await apiClient.post(`/rfps/${id}/send`, { vendorIds });
    return response.data;
  },
};

export default rfpService;
