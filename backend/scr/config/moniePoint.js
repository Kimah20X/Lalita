import axios from "axios";

const moniepoint = axios.create({
  baseURL: process.env.MONIEPOINT_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.MONIEPOINT_API_KEY}`,
    "Content-Type": "application/json",
  },
});

export default moniepoint;
