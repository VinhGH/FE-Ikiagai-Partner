import { SET_ROLE, LOGIN_SUCCESS, LOGOUT, REGISTER_SUCCESS, UPDATE_USER_STATUS } from '../actionTypes';

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
        role: action.payload.role,
        user: {
          ...action.payload.user,
          status: action.payload.user.status || 'approved', // Mặc định đăng nhập bình thường là đã duyệt
        },
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        token: action.payload.token,
        role: action.payload.role,
        user: {
          ...action.payload.user,
          status: 'pending', // Đăng ký mới luôn là chờ xét duyệt
        },
      };
    case UPDATE_USER_STATUS:
      return {
        ...state,
        user: state.user
          ? {
              ...state.user,
              status: action.payload,
            }
          : null,
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
