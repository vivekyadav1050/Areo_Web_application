import api from './axiosClient';

export async function loginRequest(username, password) {
  const { data } = await api.post('/auth/login', { username, password }, { skipAuth: true });
  const token = data?.token || data?.data?.token;
  const user = data?.user || data?.data?.user;
  if (!token || !user) throw new Error('The login response did not contain the expected token and user. Check the backend response contract.');
  return { token, user };
}
