import axios from 'axios';

const API = axios.create({
  baseURL: 'https://api.freeapi.app/api/v1',
 
});

export default API;
