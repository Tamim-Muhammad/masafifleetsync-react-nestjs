import api from '../../api';

export const adminDashboardService = {
  async getOrders() {
    const response = await api.get('/orders');
    return response.data;
  },

  async assignOrder(orderId, assignmentData) {
    const response = await api.patch(`/orders/${orderId}/assign`, assignmentData);
    return response.data;
  },

  async updateOrderStatus(orderId, statusData) {
    const response = await api.patch(`/orders/${orderId}/status`, statusData);
    return response.data;
  },

  async getVehicles() {
    const response = await api.get('/fleet');
    return response.data;
  },

  async registerVehicle(vehicleData) {
    const response = await api.post('/fleet', vehicleData);
    return response.data;
  },

  async updateVehicleStatus(vehicleId, statusData) {
    const response = await api.patch(`/fleet/${vehicleId}/status`, statusData);
    return response.data;
  },

  async getRentals() {
    const response = await api.get('/rentals');
    return response.data;
  },

  async createRental(rentalData) {
    const response = await api.post('/rentals', rentalData);
    return response.data;
  },

  async updateRental(rentalId, rentalData) {
    const response = await api.patch(`/rentals/${rentalId}`, rentalData);
    return response.data;
  },

  async getRecoveryIncidents() {
    const response = await api.get('/recovery-incidents');
    return response.data;
  },

  async createRecoveryIncident(incidentData) {
    const response = await api.post('/recovery-incidents', incidentData);
    return response.data;
  },

  async updateRecoveryIncidentStatus(incidentId, statusData) {
    const response = await api.patch(`/recovery-incidents/${incidentId}/status`, statusData);
    return response.data;
  },

  async getPendingUsers() {
    const response = await api.get('/compliance/pending');
    return response.data;
  },

  async updateAccountStatus(userId, statusData) {
    const response = await api.patch(`/compliance/users/${userId}/status`, statusData);
    return response.data;
  }
};
