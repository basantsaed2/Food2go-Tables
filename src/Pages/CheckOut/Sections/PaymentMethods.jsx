import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StaticSpinner, UploadInput } from "../../../Components/Components";
import { UpdateOrder } from "../../../Store/CreateSlices";
import { useTranslation } from "react-i18next"; // <-- Importing useTranslation hook
import { useGet } from "../../../Hooks/useGet";

const PaymentMethods = () => {
  const ReciptRef = useRef(null);
  const { t, i18n } = useTranslation(); // <-- use i18n to change language
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { refetch: refetchPaymentMethod, loading: loadingPaymentMethod, data: dataPaymentMethod } = useGet({
    url: `${apiUrl}/customer/order_type`,
  });
  const [PaymentMethod, setPaymentMethod] = useState([]);

  const dispatch = useDispatch();
  const order = useSelector((state) => state?.order?.data || {});

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedPaymentMethodName, setSelectedPaymentMethodName] = useState("");
  const [recipt, setRecipt] = useState("");
  const [reciptFile, setReciptFile] = useState(null);

  useEffect(() => {
    refetchPaymentMethod();
  }, [refetchPaymentMethod]);

   useEffect(() => {
      if (dataPaymentMethod && dataPaymentMethod.payment_methods) {
        setPaymentMethod(dataPaymentMethod.payment_methods);
      }
    }, [dataPaymentMethod]);

  const handleReciptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRecipt(file.name); // Set the file object in state
      convertFileToBase64(file); // Convert file to Base64 and update `recipt`
    }
  };

  const handleReciptClick = () => {
    if (ReciptRef.current) {
      ReciptRef.current.click(); // Trigger file input click
    }
  };

  const convertFileToBase64 = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      setReciptFile(base64data); // Update `recipt` with Base64 string
    };
    reader.readAsDataURL(file); // Read the file as a Base64 string
  };

  useEffect(() => {
    dispatch(
      UpdateOrder({
        ...order,
        payment_method_id: selectedPaymentMethod,
        paymentMethodName: selectedPaymentMethodName,
        receipt: reciptFile,
      })
    );
  }, [selectedPaymentMethod, reciptFile]);

  if(loadingPaymentMethod){
    return <StaticSpinner/>
  }
  return (
    <>
      <div className="flex items-center justify-between w-full sm:flex-col xl:flex-row bg-[#F4F4F4]">
        <div className="space-y-2 sm:w-full">
          <p className="p-3 font-medium text-white text-3x1 bg-mainColor">Payment</p>
          <p className="px-2 mb-2 text-2xl text-secoundColor font-TextFontRegular">
            {t("ChooseYourPreferred")}{" "}
            <span className="text-mainColor">{t("PaymentMethod")}</span>
          </p>
          <div className="px-2 ">
            {PaymentMethod.map((card, index) => (
              <div
                className="flex items-center justify-start mb-2 gap-x-2"
                key={card.id}
              >
                <input
                  type="radio"
                  name="payment"
                  id={card.id}
                  style={{
                    accentColor: "mainColor",
                    width: "20px",
                    height: "20px",
                  }}
                  onChange={() => {
                    setSelectedPaymentMethod(card.id);
                    setSelectedPaymentMethodName(card.name);
                  }}
                />
                <img
                  src={card.logo_link}
                  alt={card.name}
                  className="object-contain w-16 h-16 rounded-full"
                />
                <label
                  htmlFor={card.id}
                  className="text-2xl text-mainColor font-TextFontRegular"
                >
                  {card.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        {selectedPaymentMethodName?.toLowerCase().includes("vodafone") && (
          <div className="sm:w-full xl:w-6/12">
            <div className="flex justify-center gap-0 sm:w-full xl:w-3/4 sm:flex-col xl:flex-row sm:items-start xl:items-center">
              <span className="w-7/12 text-2xl font-TextFontRegular text-mainColor xl:mt-2">
                {t("ReciptUpload")}:
              </span>
              <UploadInput
                value={recipt}
                uploadFileRef={ReciptRef}
                placeholder={t("ReciptImage")}
                handleFileChange={handleReciptChange}
                onChange={(e) => setRecipt(e.target.value)}
                onClick={() => handleReciptClick(ReciptRef)}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentMethods;
