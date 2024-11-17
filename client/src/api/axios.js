import axios from 'axios';
const ISLOCAL = true;
const BASE_URL = ISLOCAL ? 'http://localhost:8080/api' : '/api';

export default axios.create({
    baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type'   : 'application/json' },
    withCredentials: true
});