import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Kirim pesan dari form kontak ke backend.
 * @param {{ name: string, email: string, topic: string, subject: string, message: string }} payload
 */
export async function sendContactMessage(payload) {
  const response = await axios.post(`${API_BASE}/api/auth/contact/`, payload);
  return response.data;
}
