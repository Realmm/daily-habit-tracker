import { createSlice } from "@reduxjs/toolkit";

export const signedInAddressSlice = createSlice({
    name: 'signedInAddress',
    initialState: {
        value: undefined
    },
    reducers: {
        setSignedInAddress: (state, action) => {
            state.value = action.payload
        }
    }
})

export const { setSignedInAddress } = signedInAddressSlice.actions

export default signedInAddressSlice.reducer