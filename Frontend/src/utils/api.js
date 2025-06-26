import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000
});

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
    response => response,
    error => {
        // Handle 401 Unauthorized - redirect to login
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth services
export const authService = {
    register: data => api.post('/auth/register', data),
    login: data => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: data => api.put('/auth/profile', data),
    verifyToken: token => api.post('/auth/verify-token', { token }),
};

// Ticket services
export const ticketService = {
    createTicket: data => api.post('/tickets', data),
    getAllTickets: (page = 1, limit = 10) => api.get(`/tickets?page=${page}&limit=${limit}`),
    getTicketById: id => api.get(`/tickets/${id}`),
    updateTicket: (id, data) => api.put(`/tickets/${id}`, data),
    deleteTicket: id => api.delete(`/tickets/${id}`),
    findByVehicle: vehicleNo => api.get(`/tickets/vehicle/${vehicleNo}`),
    dispatchTicket: (id) => api.post(`/tickets/${id}/dispatch`),
};

// OTP services
export const otpService = {
    requestOtp: vehicleNo => api.post('/otp/request', { vehicleNo }),
    verifyOtp: (vehicleNo, otp) => api.post('/otp/verify', { vehicleNo, otp }),
    resendOtp: vehicleNo => api.post('/otp/resend', { vehicleNo }),
};

// Payment services
export const paymentService = {
    calculateFee: ticketId => api.get(`/payment/calculate/${ticketId}`),
    processPayment: data => api.post('/payment/process', data),
    getReceipt: ticketId => api.get(`/payment/receipt/${ticketId}`),
    checkStatus: ticketId => api.get(`/payment/status/${ticketId}`),
};

// Export all services
const services = {
    auth: authService,
    tickets: ticketService,
    otp: otpService,
    payment: paymentService,
};

export default services;
