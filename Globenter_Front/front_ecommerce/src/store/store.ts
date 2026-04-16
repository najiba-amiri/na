import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import profileReducer from "./slices/profileSlice";
import SellerReducer from "./slices/sellerSlice";
import userReducer from "./slices/userSlice";
import categoriesReducer from "./slices/categoriesSlice";
import brandsReducer from "./slices/brandSlice"; // <-- new import
import tagsReducer from "./slices/tagSlice";
import ownBrandReducer from "@/store/slices/ownBrandSlice";
// hessabpay
import paymentReducer from "./slices/paymentSlice";
import walletReducer from "./slices/walletSlice";
import transactionsReducer from "./slices/transactionsSlice";
import payoutReducer from "@/store/slices/payoutSlice";
import ordersReducer from "@/store/slices/orderSlice";
// Admin Only 
import financeAlertsReducer from "@/store/slices/financeAlertSlice";
import adminWalletTopupReducer from "@/store/slices/adminWalletTopupSlice";
import adminUsersReducer from "@/store/slices/adminUsersSlice";

// Admin Finance Dashboard
import adminFinanceDashboardReducer from "@/store/slices/adminDashboardSlice";
import adminPayoutReducer from "@/store/slices/adminPayoutSlice";
import adminTransactionsReducer from "@/store/slices/adminTransactionsSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    profile: profileReducer,
    Seller: SellerReducer,
    users: userReducer,
    categories: categoriesReducer,
    brands: brandsReducer, 
    tags: tagsReducer,
    ownBrand: ownBrandReducer,
    payment: paymentReducer,
    wallet: walletReducer,
    transactions: transactionsReducer,
    payout: payoutReducer,
    orders: ordersReducer,
    financeAlerts: financeAlertsReducer,
    adminWalletTopup: adminWalletTopupReducer,
    adminFinanceDashboard: adminFinanceDashboardReducer,
    adminPayout: adminPayoutReducer,
    adminTransactions: adminTransactionsReducer,
    adminUsers: adminUsersReducer,
 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
