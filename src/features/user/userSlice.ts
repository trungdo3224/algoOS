import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
}

const initialState: UserState = {
  id: "",
  name: "",
  email: "",
  profilePicture: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },
    clearUser: () => initialState,
  },
})

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;