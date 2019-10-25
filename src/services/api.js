import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: 'token cb46df8513c3108fc9cac2a5558a8250af1f0821',
  },
});

export default api;
