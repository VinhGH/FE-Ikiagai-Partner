import { SET_ROLE, LOGIN_SUCCESS, LOGOUT, REGISTER_SUCCESS, UPDATE_USER_STATUS } from '../actionTypes';

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

export const registerSuccess = (token: string, user: any, role: 'driver' | 'merchant') => ({
  type: REGISTER_SUCCESS,
  payload: { token, user, role },
});

export const updateUserStatus = (status: 'pending' | 'approved' | 'rejected') => ({
  type: UPDATE_USER_STATUS,
  payload: status,
});
