import api from '../api';

export const customerDashboardService = {
  async getMyOrders(customerId) {
    const response = await api.get(`/orders?customerId=${customerId}`);
    return response.data;
  },

  async createOrder(orderData) {
    const response = await api.post('/orders', {
      customerId: orderData.customerId,
      serviceType: orderData.serviceType,
      volumeGallons: orderData.volumeGallons,
      deliveryAddress: orderData.deliveryAddress,
      phoneNumber: orderData.phoneNumber || orderData.phone,
      scheduledTime: orderData.scheduledTime
    });
    return response.data;
  },

  async getRentals() {
    const response = await api.get('/rentals');
    return response.data;
  },

  async createRental(rentalData) {
    const response = await api.post('/rentals', {
      customerId: rentalData.customerId,
      vehicleId: rentalData.vehicleId,
      startDate: rentalData.startDate,
      endDate: rentalData.endDate,
      totalCost: rentalData.totalCost
    });
    return response.data;
  },

  async reportEmergency(incidentData) {
    const response = await api.post('/recovery-incidents', {
      vehicleId: incidentData.vehicleId,
      incidentType: incidentData.incidentType,
      location: incidentData.location,
      description: incidentData.description,
      severity: incidentData.severity
    });
    return response.data;
  },

  async getProfile(customerId) {
    const response = await api.get(`/auth/profile${customerId ? `/${customerId}` : ''}`);
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', {
      fullName: profileData.fullName,
      email: profileData.email,
      phoneNumber: profileData.phoneNumber || profileData.phone
    });
    return response.data;
  }
};