import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import decodeJwt from "jwt-decode";

import { handleError } from "./utils";
// import { DELETE_ME } from "../actionTypes";
// import { logIn, register } from "../../apis/auth";
const logIn = (username, password) => { return null; }
const register = (username, password) => { return null; }

export const isAuthenticated = () => {
  const permissions = localStorage.getItem("permissions");
  return !!permissions;
};

export const login = createAsyncThunk("auth/login", async ({ email, password }, thunkAPI) => {
  try {
    const response = await logIn({ username: email, password: password })
    if ("access_token" in response.data) {
      const decodedToken = decodeJwt(response.data["access_token"]);
      localStorage.setItem("token", response.data["access_token"]);
      localStorage.setItem("permissions", decodedToken.permissions);
      return {
        token: response.data["access_token"],
        permission: decodedToken.permissions
      }
    }
    thunkAPI.rejectWithValue(null)
  } catch (error) {
    handleError(thunkAPI.dispatch, error)
    thunkAPI.rejectWithValue(error);
  }
});

export const signUp = createAsyncThunk("auth/signUp", async ({ email, password }, thunkAPI) => {
  try {
    const response = await register({ username: email, password: password })
    if ("access_token" in response.data) {
      const decodedToken = decodeJwt(response.data["access_token"]);
      localStorage.setItem("token", response.data["access_token"]);
      localStorage.setItem("permissions", decodedToken.permissions);
      return {
        token: response.data["access_token"],
        permission: decodedToken.permissions
      }
    }
    thunkAPI.rejectWithValue(null)
  } catch (error) {
    handleError(thunkAPI.dispatch, error)
    thunkAPI.rejectWithValue(error);
  }
});

export const logout = () => {
  return (dispatch) => {
    localStorage.removeItem("token");
    localStorage.removeItem("permissions");
    dispatch(authSlice.actions.logout());
    // TODO: here
    // dispatch({
    //   type: DELETE_ME
    // })
  };
};

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: '',
    permission: '',
    error: ''
  },
  reducers: {
    logout: state => {
      state.token = ''
      state.permission = ''
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      const { token, permission } = action.payload
      state.token = token
      state.permission = permission
    })
    builder.addCase(login.rejected, (state) => {
      state.token = ''
      state.permission = ''
    })
    builder.addCase(signUp.fulfilled, (state, action) => {
      const { token, permission } = action.payload
      state.token = token
      state.permission = permission
    })
    builder.addCase(signUp.rejected, (state) => {
      state.token = ''
      state.permission = ''
    })
  }
})

export default authSlice.reducer