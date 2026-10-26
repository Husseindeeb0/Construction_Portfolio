import { configureStore } from '@reduxjs/toolkit'
import { authApi } from '../client/authAPI'
import { companyProfileApi } from '../client/companyProfileAPI'
import { heroApi } from '../client/heroAPI'
import { aboutApi } from '../client/aboutAPI'
import { serviceApi } from '../client/serviceAPI'
import { trackRecordApi } from '../client/trackRecordAPI'
import { projectApi } from '../client/projectAPI'
import { categoryApi } from '../client/categoryAPI'

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [companyProfileApi.reducerPath]: companyProfileApi.reducer,
    [heroApi.reducerPath]: heroApi.reducer,
    [aboutApi.reducerPath]: aboutApi.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
    [trackRecordApi.reducerPath]: trackRecordApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      companyProfileApi.middleware,
      heroApi.middleware,
      aboutApi.middleware,
      serviceApi.middleware,
      trackRecordApi.middleware,
      projectApi.middleware,
      categoryApi.middleware
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
