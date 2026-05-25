import { SET_ROLE, LOGIN_SUCCESS, LOGOUT } from '../actionTypes';

export const setRole = (role: 'driver' | 'merchant' | null) => ({
  type: SET_ROLE,
  payload: role,
});

export const loginSuccess = (token: string, user: any, role: 'driver' | 'merchant') => ({
  type: LOGIN_SUCCESS,
  payload: { token, user, role },
});

export const logout = () => ({
  type: LOGOUT,
});
