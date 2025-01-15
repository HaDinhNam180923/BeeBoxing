// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

export const getProductDetail = async (id) => {
    try {
        const response = await api.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default api;