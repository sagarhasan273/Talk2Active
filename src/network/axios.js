import axios from 'axios';
import { getCookie } from '../helpers/cookies';
import { API_URL } from './Api';

const AXIOS = axios.create({
  baseURL: API_URL,
});

AXIOS.interceptors.request.use(
  (config) => {
    // console.log('=============AXIOS REQUEST============');
    // Do something before request is sent
    const accesstoken = getCookie('accesstoken');
    config.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accesstoken}`,
    };

    return config;
  },
  (error) =>
    // Do something with request error
    Promise.reject(error)
);

AXIOS.interceptors.response.use(
  (response) =>
    // console.log('==============AXIOS RESPONSE============');
    response.data,
  (error) => Promise.reject(error)
);

export default AXIOS;
