import api from '../../api';

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', {
      email: credentials.email || credentials.identifier,
      password: credentials.password
    });
    return response.data;
  },

  async sendOtp(phoneNumber) {
    const response = await api.post('/auth/send-otp', {
      phoneNumber
    });
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', {
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: userData.role || 'Customer',
      verificationCode: userData.verificationCode || userData.otp
    });
    return response.data;
  },
};
