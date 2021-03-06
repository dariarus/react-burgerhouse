import {createSlice, PayloadAction} from "@reduxjs/toolkit";

import {IOrderSliceState} from "../types/index";
import {IOrderActions} from "../types/action-type";

export const orderSlice = createSlice({
  name: 'orderNumber',
  initialState: {
    order: [],
    orderNumber: null,
    isValidOrder: true,
    isLoading: false
  } as IOrderSliceState,
  reducers: {
    checkOrder: (state, action: PayloadAction<boolean>) => {
      if(action.payload) {
        return {
          ...state,
          isValidOrder: true
        }
      } else {
        return {
          ...state,
          isValidOrder: false
        }
      }
    },
    getOrderData: (state) => {
      return {
        ...state,
        isLoading: true
      }
    },
    getOrderSuccess: (state, action: PayloadAction<IOrderSliceState>) => {
      return {
        ...state,
        isLoading: false,
        orderNumber: action.payload.orderNumber,
        order: action.payload.order,
      }
    }
  }
})

export default orderSlice.reducer
export const {
  checkOrder,
  getOrderData,
  getOrderSuccess
} = orderSlice.actions

export const orderActions: IOrderActions = {
  checkOrder: checkOrder,
  getOrderData: getOrderData,
  getOrderSuccess: getOrderSuccess
}
