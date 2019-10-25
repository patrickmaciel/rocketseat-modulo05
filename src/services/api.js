import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: 'token 620cd6dc28e6754c927f38c55fda93b15ce5d1b2',
  },
});

export default api;
