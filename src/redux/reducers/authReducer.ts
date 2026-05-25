import { SET_ROLE, LOGIN_SUCCESS, LOGOUT } from '../actionTypes';

export interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  role: 'driver' | 'merchant' | null;
  user: any | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  token: null,
  role: null,
  user: null,
};

export const authReducer = (state = initialState, action: any): AuthState => {
  switch (action.type) {
    case SET_ROLE:
      return {
        ...state,
        role: action.payload,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        token: action.payload.token,
        user: action.payload.user,
        role: action.payload.role,
      };
    case LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
        token: null,
        user: null,
        role: null, // Reset role về null để quay lại màn hình chọn vai trò
      };
    default:
      return state;
  }
};
