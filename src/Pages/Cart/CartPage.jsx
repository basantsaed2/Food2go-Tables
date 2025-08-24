import React from "react";
import { TitlePage } from "../../Components/Components";
import Carts from "./Sections/Carts";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { UpdateOrder } from "../../Store/CreateSlices";
import { useAuth } from "../../Context/Auth";
import { useTranslation } from "react-i18next"; // <-- Importing useTranslation hook

const CartPage = () => {
  const { t, i18n } = useTranslation(); // <-- use i18n to change language

  // const auth = useAuth();
  // const navigate = useNavigate();

  // const dispatch = useDispatch();
  // const order = useSelector((state) => state?.order?.data || {});
  // const productsSelected = useSelector(
  //   (state) => state?.productsCard?.data || []
  // );
  // const handleOrder = () => {
  //   if (productsSelected.length === 0) {
  //     auth.toastError(t("Yourcartisempty"));
  //   } else {
  //     if (!auth.user) {
  //       auth.toastError("You must be logged in to continue.");
  //       navigate("/auth/login", { replace: true });
  //       return;
  //     } else {
  //       navigate("/check_out", { replace: true });
  //       dispatch(UpdateOrder({ ...order, products: productsSelected }));
  //     }
  //   }
  //   // productsSelected.length === 0 || !auth.user ? auth.toastError('Your cart is empty') : dispatch(UpdateOrder({ ...order, products: productsSelected }));
  // };
  return (
    <>
      <div className="flex flex-col items-center justify-center w-11/12 mx-auto gap-y-4">
        <TitlePage title={t("cart")} />
        <Carts />
        {/* Buttons */}
        {/* <div className="flex items-center justify-end w-full gap-5 sm:flex-col lg:flex-row">
          <span
            className="px-16 py-2 text-center text-white transition-all duration-300 ease-in-out border-2 cursor-pointer sm:w-full lg:w-auto sm:text-xl xl:text-2xl bg-mainColor rounded-2xl hover:bg-transparent hover:text-mainColor border-mainColor"
            onClick={handleOrder}
          >
            {t("Checkout")}
          </span>
          <Link
            to={"/menu"}
            className="px-16 py-2 text-center transition-all duration-300 ease-in-out bg-transparent border-2 sm:w-full lg:w-auto sm:text-xl xl:text-2xl text-mainColor rounded-2xl hover:bg-mainColor hover:text-white border-mainColor"
          >
            {t("BuyMore")}
          </Link>
        </div> */}
      </div>
    </>
  );
};

export default CartPage;
