import apiClient from './api';

export const vendorService = {
  // Create vendor
  createVendor: async (data) => {
    const response = await apiClient.post('/vendors', data);
    return response.data;
  },

  // Get all vendors
  getAllVendors: async () => {
    const response = await apiClient.get('/vendors');
    return response.data;
  },

  // Get single vendor
  getVendorById: async (id) => {
    const response = await apiClient.get(`/vendors/${id}`);
    return response.data;
  },

  // Update vendor
  updateVendor: async (id, data) => {
    const response = await apiClient.put(`/vendors/${id}`, data);
    return response.data;
  },

  // Delete vendor
  deleteVendor: async (id) => {
    const response = await apiClient.delete(`/vendors/${id}`);
    return response.data;
  },
};

export default vendorService;
