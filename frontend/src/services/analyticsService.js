import api from './api';

const analyticsService = {
  // Get analytics dashboard data
  getAnalyticsDashboard: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  // Get RFP-specific analytics
  getRFPAnalytics: async (rfpId) => {
    const response = await api.get(`/analytics/rfp/${rfpId}`);
    return response.data;
  },
};

export default analyticsService;
