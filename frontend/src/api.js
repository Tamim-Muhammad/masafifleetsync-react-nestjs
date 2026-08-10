import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Points directly to your NestJS backend
});

export default api;