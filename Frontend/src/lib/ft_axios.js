import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adding a request interceptor to set the Authorization header dynamically
axiosInstance.interceptors.request.use(
  config => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

async function refreshAuthToken() {
  try {
    const response = await axios.get('http://localhost:8000/api/auth/refresh', {
      withCredentials: true,
    });
    if (response.status !== 200)
      throw Error
    axiosInstance.defaults.headers['Authorization'] = `Bearer ${Cookies.get('access_token')}`;
  } catch (error) {
    toast.error("You are not authorized.")
    window.location.href = '/logout';
  }
}

async function ft_axios(method, url, data = null, headers = null) {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
      headers: (headers === null) ? axiosInstance.defaults.headers : {
        ...axiosInstance.defaults.headers,
        ...headers,
      },
    });
    console.log(response);
    
    return response?.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        console.log("Caught unauthorized error, refreshing token...");
        await refreshAuthToken();
        return ft_axios(method, url, data, headers);
      } else {
        console.log("API Error:", error.response.data);
        throw error.response.data;
      }
    } else {
      console.log("Internal Error:", error.message);
      throw error.response.data;
    }
  }
}

export const get = (url, headers) => ft_axios('get', url, null, headers);
export const post = (url, data, headers) => ft_axios('post', url, data, headers);