import axios from 'axios';
import { useAppStore } from '@/stores/appStore.js'

const http = axios.create();
// add a request interceptor that adds the token to the header

http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['X-Sharp-Key'] = `${token}`;
        } else {
            config.headers['X-Sharp-Key'] = ``;
        } 
        return config;
    },
    (error) => {
        // send user to login with router
        return Promise.reject(error);
    }
);

// add a response interceptor that checks for 401 and redirects to login

http.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.log(error)
        if (error.response.status === 401) {
            const store = useAppStore()
            // send user to login with router
            store.logout()
        }
        return Promise.reject(error);
    }
);


export default http;

