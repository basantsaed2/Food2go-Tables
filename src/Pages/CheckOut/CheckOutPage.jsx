import React, { useEffect, useState } from "react";
import {
  HeaderNavigate,
  LoaderLogin,
  SubmitButton,
} from "../../Components/Components";
import PaymentMethods from "./Sections/PaymentMethods";
import DetailsOrder from "./Sections/DetailsOrder";
import { useDispatch, useSelector } from "react-redux";
import { usePost } from "../../Hooks/usePost";
import {
  removeAllProductsCard,
  removeOrder,
  removeProductsCard,
  removeTotlePrice,
  UpdateOrder,
} from "../../Store/CreateSlices";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // <-- Importing useTranslation hook
import { useAuth } from "../../Context/Auth";

const CheckOutPage = () => {
  const order = useSelector((state) => state?.order?.data || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allProducts = useSelector((state) => state?.productsCard?.data || []);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const { t, i18n } = useTranslation(); // <-- use i18n to change language
  const auth = useAuth();
  const selectedLanguage = useSelector(state => state.language?.selected ?? 'en');
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    dispatch(
      UpdateOrder({
        ...order,
        confirm_order: 0,
        products: allProducts.map((product) => ({
          product_id: product.productId,
          note: product.note,
          count: product.count,
          addons: (product?.addons || []).map((addon) => ({
            addon_id: addon.id,
            count: addon.count,
          })),
          variation: (product.variations || []).map((variation) => ({
            variation_id: variation.variation_id,
            option_id: (product?.options || [])
              .filter(
                (option) => option.variation_id === variation.variation_id
              )
              .map((option) => option.id),
          })),
          extra_id: [
            ...product?.extraProduct.map((ex) => ex.id),
            ...product?.extraOptions.map((ex) => ex.id),
          ],
          exclude_id: product?.excludes,
        })),
        source:"web",
      })
    );
  }, [allProducts]);

  const {
    postData: postOrder,
    loadingPost: loadingOrder,
    response: responseOrder,
  } = usePost({
    url: `${apiUrl}/customer/make_order?locale=ar`,
    type: true,
  });

  const handleSendOrder = async () => {
    try {
      // if (order.paymentMethodName.split().toLowerCase().includes("visa")) {
      await postOrder(order);
      // } else {
      //   // If the payment method is not Visa, we can handle it differently if needed
      //   await postOrder(order,t("OrderPlacedSuccessfully"));
      // }
    } catch (error) {
      // Check for the specific processing order error
      if (error?.response?.data?.errors === "You has order at proccessing") {
        setPendingOrderData(order);
        setShowProcessingModal(true);
      }
      // All other errors are already handled by usePost
    }
  };
  const handleConfirmOrder = () => {
    setShowProcessingModal(false);
    // if (order.paymentMethodName.split.toLowerCase().includes("visa")) {
    postOrder(
      { ...pendingOrderData, confirm_order: 1 },
    );
    // else { 
    // postOrder(
    //   { ...pendingOrderData, confirm_order: 1 },
    //   // "Order Placed Successfully"
    // )}
  };

  const handleCancelOrder = () => {
    setShowProcessingModal(false);
    dispatch(removeOrder());
    dispatch(removeTotlePrice());
    dispatch(removeAllProductsCard());
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (responseOrder) {
      if (responseOrder && responseOrder.data?.paymentLink) {
        // dispatch(removeOrder());
        // dispatch(removeTotlePrice());
        // dispatch(removeAllProductsCard());
        window.open(responseOrder.data.paymentLink, "_blank");
      } else {
        // dispatch(removeOrder());
        // dispatch(removeTotlePrice());
        // dispatch(removeAllProductsCard());
        navigate(`/orders/order_traking/${responseOrder?.data?.success}`, {
          replace: true,
        });
      }
    }
  }, [responseOrder]);

  return (
    <>
      {loadingOrder ? (
        <div className="flex items-center justify-center w-full h-screen">
          <LoaderLogin />
        </div>
      ) : (
        <div className="flex flex-col items-start justify-start w-11/12 pt-4 mx-auto gap-y-4">
          <HeaderNavigate title={t("Checkout")} />
          <PaymentMethods />
          <DetailsOrder />
          <div className="flex items-center justify-end w-full">
            <div className="">
              <SubmitButton
                text={t("PlaceOrder")}
                handleClick={handleSendOrder}
              />
            </div>
          </div>

          {/* Processing Order Modal */}
          {showProcessingModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                  className="fixed inset-0 transition-opacity"
                  aria-hidden="true"
                  onClick={handleCancelOrder}
                >
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                {/* Modal container */}
                <span
                  className="hidden sm:inline-block sm:align-middle sm:h-screen"
                  aria-hidden="true"
                >
                  &#8203;
                </span>

                {/* Modal content */}
                <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-yellow-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                        <svg
                          className="w-6 h-6 text-yellow-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                          {t("OrderAlreadyinProgress")}
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            {t("Youcurrently")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={handleConfirmOrder}
                      className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white border border-transparent rounded-md shadow-sm bg-mainColor hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {t("PlaceNewOrder")}                    </button>
                    <button
                      type="button"
                      onClick={handleCancelOrder}
                      className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {t("NoCancel")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CheckOutPage;
