import { createSlice } from "@reduxjs/toolkit";

export const connectAddressSlice = createSlice({
    name: 'connectAddress',
    initialState: {
        value: undefined
    },
    reducers: {
        setConnectAddress: (state, action) => {
            state.value = action.payload
        }
    }
})

export const { setConnectAddress } = connectAddressSlice.actions

export default connectAddressSlice.reducer