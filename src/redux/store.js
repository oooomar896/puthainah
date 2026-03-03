import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { authApi } from "./api/authApi";
import { lookupApi } from "./api/typeApi";
import { citiesApi } from "./api/citiesApi";
import { requestersApi } from "./api/requestersApi";
import { providersApi } from "./api/providersApi";
import { detailsApi } from "./api/usersDetails";
import { servicesApi } from "./api/servicesApi";
import { updateApi } from "./api/updateApi";
import { adminStatisticsApi } from "./api/adminStatisticsApi";
import { ordersApi } from "./api/ordersApi";
import { projectsApi } from "./api/projectsApi";
import { ratingsApi } from "./api/ratingsApi";
import { ticketApi } from "./api/ticketApi";
import { ticketMessagesApi } from "./api/ticketMessagesApi";
import { notificationsApi } from "./api/notificationsApi";
import { faqsApi } from "./api/faqsApi";
import { partnersApi } from "./api/partnersApi";
import { paymentApi } from "./api/paymentApi";
import { customersApi } from "./api/customersApi";
import { profileInfoApi } from "./api/profileInfoApi";
import { providerStatisticsApi } from "./api/providerStatisticsApi";
import { adminProfilesApi } from "./api/adminProfilesApi";
import { requestsApi } from "./api/requestsApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [authApi.reducerPath]: authApi.reducer,
      [lookupApi.reducerPath]: lookupApi.reducer,
      [citiesApi.reducerPath]: citiesApi.reducer,
      [requestersApi.reducerPath]: requestersApi.reducer,
      [providersApi.reducerPath]: providersApi.reducer,
      [detailsApi.reducerPath]: detailsApi.reducer,
      [servicesApi.reducerPath]: servicesApi.reducer,
      [updateApi.reducerPath]: updateApi.reducer,
      [adminStatisticsApi.reducerPath]: adminStatisticsApi.reducer,
      [ordersApi.reducerPath]: ordersApi.reducer,
      [projectsApi.reducerPath]: projectsApi.reducer,
      [ratingsApi.reducerPath]: ratingsApi.reducer,
      [ticketApi.reducerPath]: ticketApi.reducer,
      [ticketMessagesApi.reducerPath]: ticketMessagesApi.reducer,
      [notificationsApi.reducerPath]: notificationsApi.reducer,
      [faqsApi.reducerPath]: faqsApi.reducer,
      [partnersApi.reducerPath]: partnersApi.reducer,
      [customersApi.reducerPath]: customersApi.reducer,
      [profileInfoApi.reducerPath]: profileInfoApi.reducer,
      [paymentApi.reducerPath]: paymentApi.reducer,
      [providerStatisticsApi.reducerPath]: providerStatisticsApi.reducer,
      [adminProfilesApi.reducerPath]: adminProfilesApi.reducer,
      [requestsApi.reducerPath]: requestsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(authApi.middleware)
        .concat(lookupApi.middleware)
        .concat(citiesApi.middleware)
        .concat(requestersApi.middleware)
        .concat(providersApi.middleware)
        .concat(detailsApi.middleware)
        .concat(servicesApi.middleware)
        .concat(updateApi.middleware)
        .concat(adminStatisticsApi.middleware)
        .concat(ordersApi.middleware)
        .concat(projectsApi.middleware)
        .concat(ratingsApi.middleware)
        .concat(ticketApi.middleware)
        .concat(ticketMessagesApi.middleware)
        .concat(notificationsApi.middleware)
        .concat(faqsApi.middleware)
        .concat(partnersApi.middleware)
        .concat(customersApi.middleware)
        .concat(profileInfoApi.middleware)
        .concat(paymentApi.middleware)
        .concat(providerStatisticsApi.middleware)
        .concat(adminProfilesApi.middleware)
        .concat(requestsApi.middleware),
  });
};

// Types are available but not exported in JS files
// Use JSDoc comments for type hints if needed

