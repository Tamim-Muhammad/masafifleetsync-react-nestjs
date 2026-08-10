import api from '../../api';

export const driverDashboardService = {
  async getAssignedOrders(driverId) {
    const response = await api.get(`/orders?driverId=${driverId}`);
    return response.data;
  },

  async updateOrderStatus(orderId, statusData) {
    const response = await api.patch(`/orders/${orderId}/status`, statusData);
    return response.data;
  },

  async reportIncident(incidentData) {
    const response = await api.post('/recovery-incidents', incidentData);
    return response.data;
  },

  async getDeliveriesHistory(driverId) {
    const response = await api.get(`/orders?driverId=${driverId}&status=Completed`);
    return response.data;
  },

  async getDriverCompliance(driverId) {
    const response = await api.get(`/fleet/compliance?driverId=${driverId}`);
    return response.data;
  }
};