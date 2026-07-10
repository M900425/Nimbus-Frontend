import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  selectedCity: string;
}

const initialState: UiState = {
  selectedCity: "Kyiv",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSelectedCity(state, action: PayloadAction<string>) {
      state.selectedCity = action.payload;
    },
  },
});

export const { setSelectedCity } = uiSlice.actions;
export default uiSlice.reducer;
