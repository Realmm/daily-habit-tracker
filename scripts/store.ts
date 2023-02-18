import { configureStore } from "@reduxjs/toolkit";
import addressReducer from "./slices/signedInAddressSlice"

export default configureStore({
    reducer: {
        address: addressReducer
    }
})