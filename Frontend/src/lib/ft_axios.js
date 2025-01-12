import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

export const axiosInstance = axios.create({
  baseURL: 'http://167.99.138.209:80/api/',
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

export async function refreshAuthToken() {
  try {
    const response = await axios.get('http://167.99.138.209:80/api/auth/refresh', {
      withCredentials: true,
    });
    if (response.status !== 200)
      throw Error
    axiosInstance.defaults.headers['Authorization'] = `Bearer ${Cookies.get('access_token')}`;
  } catch (error) {
    // toast.error(error?.response?.data?.error ?? "You are not authorized.");
    throw Error(401);
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
    
    return response?.data; // successful status code 2xx
  } catch (error) {
    if (error.response) { // server responded with an error status code
      if (error.response.status === 401) { // handling unauthorized error
        console.log("Caught unauthorized error, refreshing token...");
        await refreshAuthToken();
        return ft_axios(method, url, data, headers);
      } else { // throwing other errors to be handled by case 
        // console.log("API Error:", error?.message);
        throw error;
      }
    } else { // either request was made but got no response, or setting up the request has failed
      // console.log("Internal Error:", error?.message);
      throw Error("Internal Error");
    }
  }
}

export const get = (url, headers) => ft_axios('get', url, null, headers);
export const post = (url, data, headers) => ft_axios('post', url, data, headers);