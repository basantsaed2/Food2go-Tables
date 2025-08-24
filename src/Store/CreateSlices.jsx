import { createSlice } from "@reduxjs/toolkit";

// Initial states
const initialUserState = { data: null };
const initialSignUpTypeState = { data: null };
const initialOtpCodeState = { code: null };
const initialNewPass = false;
const initialMainDataState = { data: null };
const initialCompanyInfoState = { data: null };

const initialTaxType = { data: '', }
const initialProducts = { data: [], }
const initialCategories = { data: [], }
const initialProductsCard = { data: [], }
const initialProductsFilter = { data: [], }
const initialProductsDiscount = { data: [], }
const initialProductsDiscountFilter = { data: [], }
const initialLanguage = { data: [], selected: 'en', }

const initialTotalPrice = { data: 0, }
const initialOrders = {
       data: {
              currentOrders: [],
              historyOrders: [],
       },
}

const initialOrder = {
       data: {
              notes: "",
              // date: "",
              payment_method_id: null,
              receipt: "",
              branch_id: null,
              amount: null,
              total_tax: null,
              total_discount: null,
              address_id: null,
              order_type: null,
              delivery_price: null,
              products: [],
       },
}
const initialPickupLoctaion = { data: '', }


/*  User */
const userSlice = createSlice({
       name: "user",
       initialState: initialUserState,
       reducers: {
              setUser: (state, action) => {
                     state.data = action.payload;
              },
              removeUser: (state) => {
                     state.data = null;
              },
       },
});
/*  MainData */
const mainDataSlice = createSlice({
       name: "mainData",
       initialState: initialMainDataState,
       reducers: {
              setMainData: (state, action) => {
                     state.data = action.payload;
              },
       },
});
/*  CompanyInfo */
const companyInfoSlice = createSlice({
       name: "companyInfo",
       initialState: initialCompanyInfoState,
       reducers: {
              setCompanyInfo: (state, action) => {
                     state.data = action.payload;
              },
       },
});
/*  SignUp Type */
const signUpTypeSlice = createSlice({
       name: "signUpType",
       initialState: initialSignUpTypeState,
       reducers: {
              setSignUpType: (state, action) => {
                     state.data = action.payload;
              },
              removeSignUpType: (state) => {
                     state.data = null;
              },
       },
});
/*  Otp */
const otpCodeSlice = createSlice({
       name: "otpCode",
       initialState: initialOtpCodeState,
       reducers: {
              setOtpCode: (state, action) => {
                     state.code = action.payload;
              },
              removeOtpCode: (state) => {
                     state.code = null;
              },
       },
});
/*  New Pass */
const newPassSlice = createSlice({
       name: "newPass",
       initialState: initialNewPass,
       reducers: {
              setNewPass: (state, action) => {
                     return action.payload;
              },
              removeNewPass: () => {
                     return false;
              },
       },
});

/* Tax Type */
const taxTypeSlice = createSlice({
       name: "taxType",
       initialState: initialTaxType,
       reducers: {
              setTaxType: (state, action) => {
                     state.data = action.payload;
              },
              removeTaxType: (state) => {
                     state.data = '';
              },
       },
});
/* Products */
const productsSlice = createSlice({
       name: "products",
       initialState: initialProducts,
       reducers: {
              setProducts: (state, action) => {
                     state.data = action.payload;
              },
              removeProducts: (state) => {
                     state.data = [];
              },
       },
});
/* Categories */
const categoriesSlice = createSlice({
       name: "categories",
       initialState: initialCategories,
       reducers: {
              setCategories: (state, action) => {
                     state.data = action.payload;
              },
              removeCategories: (state) => {
                     state.data = [];
              },
       },
});
/* Products Card */
// const productsCardSlice = createSlice({
//        name: "productsCard",
//        initialState: initialProductsCard, // Use the corrected initial state
//        reducers: {
//               setProductsCard: (state, action) => {
//                      state.data = [...state.data, action.payload]; // Append the new product to the array
//               },
//               UpdateProductCard: (state, action) => {
//                      state.data = state.data.map(product => {
//                             if (product.numberId === action.payload.numberId) {
//                                    return { ...product, ...action.payload };
//                             }
//                             return product;
//                      });
//               },
//               removeProductsCard: (state, action) => {

//                      state.data = state.data.filter(product => product.numberId !== action.payload);
//                  },
//               removeAllProductsCard: (state) => {
//                      state.data = [];
//               },
//        },
// });

const productsCardSlice = createSlice({
       name: 'productsCard',
       initialState: initialProductsCard,
       reducers: {
              setProductsCard: (state, action) => {
                     const newProduct = action.payload;

                     // Helper function to compare arrays (e.g., variations, extras, addons, excludes)
                     const areArraysEqual = (arr1, arr2, key = 'id') => {
                            if (arr1.length !== arr2.length) return false;
                            const sorted1 = [...arr1].sort((a, b) => (a[key] || a) - (b[key] || b));
                            const sorted2 = [...arr2].sort((a, b) => (a[key] || a) - (b[key] || b));
                            return sorted1.every((item, index) => {
                                   if (typeof item === 'object') {
                                          return JSON.stringify(item) === JSON.stringify(sorted2[index]);
                                   }
                                   return item === sorted2[index];
                            });
                     };

                     // Find an existing product with matching attributes
                     const existingProductIndex = state.data.findIndex((product) => {
                            return (
                                   product.productId === newProduct.productId &&
                                   areArraysEqual(product.variations, newProduct.variations, 'variation_id') &&
                                   areArraysEqual(product.extraProduct, newProduct.extraProduct, 'id') &&
                                   areArraysEqual(product.extraOptions, newProduct.extraOptions, 'id') &&
                                   areArraysEqual(product.excludes, newProduct.excludes) &&
                                   areArraysEqual(product.addons, newProduct.addons, 'id') &&
                                   product.note === newProduct.note
                            );
                     });

                     if (existingProductIndex !== -1) {
                            // If a matching product is found, increment its count and update prices
                            const existingProduct = state.data[existingProductIndex];
                            const newCount = existingProduct.count + newProduct.count;
                            state.data[existingProductIndex] = {
                                   ...existingProduct,
                                   count: newCount,
                                   total: (parseFloat(existingProduct.total) + parseFloat(newProduct.total)).toFixed(2),
                                   passProductPrice: (
                                          (parseFloat(existingProduct.passProductPrice) * existingProduct.count +
                                                 parseFloat(newProduct.passProductPrice) * newProduct.count) / newCount
                                   ).toFixed(2), // Average price per unit
                                   passPrice: (
                                          (parseFloat(existingProduct.passPrice) * existingProduct.count +
                                                 parseFloat(newProduct.passPrice) * newProduct.count) / newCount
                                   ).toFixed(2), // Average base price per unit
                            };
                     } else {
                            // If no match is found, append the new product
                            state.data = [...state.data, newProduct];
                     }
              },
              UpdateProductCard: (state, action) => {
                     state.data = state.data.map((product) => {
                            if (product.numberId === action.payload.numberId) {
                                   return { ...product, ...action.payload };
                            }
                            return product;
                     });
              },
              removeProductsCard: (state, action) => {
                     state.data = state.data.filter((product) => product.numberId !== action.payload);
              },
              removeAllProductsCard: (state) => {
                     state.data = [];
              },
       },
});

/*  Products Filter */
const productsFilterSlice = createSlice({
       name: "productsFilter",
       initialState: initialProductsFilter,
       reducers: {
              setProductsFilter: (state, action) => {
                     state.data = action.payload;
              },
              removeProductsFilter: (state) => {
                     state.data = [];
              },
       },
});
/*  Products Discount */
const productsDiscountSlice = createSlice({
       name: "productsDiscount",
       initialState: initialProductsDiscount,
       reducers: {
              setProductsDiscount: (state, action) => {
                     state.data = action.payload;
              },
              removeProductsDiscount: (state) => {
                     state.data = [];
              },
       },
});
/* Products Discount Filter */
const productsDiscountFilterSlice = createSlice({
       name: "productsDiscountFilter",
       initialState: initialProductsDiscountFilter,
       reducers: {
              setProductsDiscountFilter: (state, action) => {
                     state.data = action.payload;
              },
              removeProductsDiscountFilter: (state) => {
                     state.data = [];
              },
       },
});

/*  Total Price */
const totalPriceSlice = createSlice({
       name: "totalPrice",
       initialState: initialTotalPrice,
       reducers: {
              setTotalPrice: (state, action) => {
                     state.data = action.payload;
              },
              removeTotlePrice: (state) => {
                     state.data = 0;
              }
       },
});
/* Order Slice */
const orderSlice = createSlice({
       name: "order",
       initialState: initialOrder,
       reducers: {
              UpdateOrder: (state, action) => {
                     // Perform deep equality check to avoid unnecessary updates
                     const isEqual = (obj1, obj2) => {
                            return JSON.stringify(obj1) === JSON.stringify(obj2);
                     };

                     if (!isEqual(state.data, action.payload)) {
                            state.data = { ...state.data, ...action.payload };
                     }
              },
              removeOrder: (state) => {
                     state.data = {
                            notes: "",
                            payment_method_id: null,
                            receipt: "",
                            branch_id: null,
                            amount: null,
                            total_tax: null,
                            total_discount: null,
                            address_id: null,
                            order_type: null,
                            delivery_price: null,
                            products: [],
                     };
              },
       },
});
/*  Orders */
const ordersSlice = createSlice({
       name: 'orders',
       initialState: initialOrders,
       reducers: {
              setOrders: (state, action) => {
                     state.data = action.payload;
              }
       }
})

/* Languages */
const languageSlice = createSlice({
       name: 'language',
       initialState: initialLanguage,
       reducers: {
              setLanguage: (state, action) => {
                     state.selected = action.payload;
              },
              setLanguageData: (state, action) => {
                     state.data = action.payload;
              },
       }
})

/* Tax Type */
const pickupLocationSlice = createSlice({
       name: "pickUpLocation",
       initialState: initialPickupLoctaion,
       reducers: {
              setPickupLoctaion: (state, action) => {
                     state.data = action.payload;
              },
              removePickupLoctaion: (state) => {
                     state.data = '';
              },
       },
});

export const { setUser, removeUser } = userSlice.actions;
export const { setMainData } = mainDataSlice.actions;
export const { setCompanyInfo } = companyInfoSlice.actions;
export const { setSignUpType, removeSignUpType } = signUpTypeSlice.actions;
export const { setOtpCode, removeOtpCode } = otpCodeSlice.actions;
export const { setNewPass, removeNewPass } = newPassSlice.actions;

export const { setTaxType, removeTaxType } = taxTypeSlice.actions;
export const { setProducts, removeProducts } = productsSlice.actions;
export const { setCategories, removeCategories } = categoriesSlice.actions;
export const { setProductsCard, UpdateProductCard, removeProductsCard, removeAllProductsCard } = productsCardSlice.actions;
export const { setProductsFilter, removeProductsFilter } = productsFilterSlice.actions;
export const { setProductsDiscount, removeProductsDiscount } = productsDiscountSlice.actions;
export const { setProductsDiscountFilter, removeProductsDiscountFilter } = productsDiscountFilterSlice.actions;

export const { setTotalPrice, removeTotlePrice } = totalPriceSlice.actions;
export const { UpdateOrder, removeOrder } = orderSlice.actions;
export const { setOrders } = ordersSlice.actions;
export const { setLanguage, setLanguageData } = languageSlice.actions;
export const { setPickupLoctaion, removePickupLoctaion } = pickupLocationSlice.actions;

export const userReducer = userSlice.reducer;
export const mainDataReducer = mainDataSlice.reducer;
export const companyInfoReducer = companyInfoSlice.reducer;
export const signUpTypeReducer = signUpTypeSlice.reducer;
export const otpCodeReducer = otpCodeSlice.reducer;
export const newPassReducer = newPassSlice.reducer;

export const taxTypeReducer = taxTypeSlice.reducer;
export const productsReducer = productsSlice.reducer;
export const categoriesReducer = categoriesSlice.reducer;
export const productsCardReducer = productsCardSlice.reducer;
export const productsFilterReducer = productsFilterSlice.reducer;
export const productsDiscountReducer = productsDiscountSlice.reducer;
export const productsDiscountFilterReducer = productsDiscountFilterSlice.reducer;

export const totalPriceReducer = totalPriceSlice.reducer;
export const orderReducer = orderSlice.reducer;
export const ordersReducer = ordersSlice.reducer;
export const languageReducer = languageSlice.reducer;
export const pickupLocationReducer = pickupLocationSlice.reducer;
