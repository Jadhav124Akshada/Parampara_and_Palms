import axios from 'axios';

// Automatically uses your Render URL in production, or localhost if you run it locally
const API_URL = process.env.REACT_APP_API_URL || 'https://parampara-and-palms.onrender.com';

const API = axios.create({
  baseURL: `${API_URL}/api`,
});

export default API;