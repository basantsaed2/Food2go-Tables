import React, { useEffect, useState, useCallback } from 'react';
import { useGet } from '../../../Hooks/useGet';
import { LinkButton, LoaderLogin } from '../../../Components/Components';
import EmptyOrdersIcon from '../../../assets/Icons/EmptyOrdersIcon';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const HistoryOrders = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { refetch: refetchOrdersHistory, loading: loadingOrdersHistory, data: dataOrdersHistory } = useGet({
        url: `${apiUrl}/customer/orders/history`,
    });
    const [ordersHistory, setOrdersHistory] = useState([]);
    const { t, i18n } = useTranslation();

    // Trigger refetch when component mounts or refetch function changes
    useEffect(() => {
        refetchOrdersHistory();
    }, [refetchOrdersHistory]);

    // Update ordersHistory only if dataOrdersHistory.orders has changed
    useEffect(() => {
        if (dataOrdersHistory && dataOrdersHistory.orders && JSON.stringify(dataOrdersHistory.orders) !== JSON.stringify(ordersHistory)) {
            setOrdersHistory(dataOrdersHistory.orders);
        }
    }, [dataOrdersHistory, ordersHistory]);

    const formatTime = (timeString) => {
        const date = new Date(`1970-01-01T${timeString}`); // Add a dummy date
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <>
            {loadingOrdersHistory ? (
                <div className="flex items-center justify-center w-full h-full mt-16">
                    <LoaderLogin />
                </div>
            ) : ordersHistory.length === 0 ? (
                <div className="mt-16 flex flex-col items-center justify-center">
                    <EmptyOrdersIcon />
                    <span className="text-2xl font-TextFontRegular text-fourthColor">{t("NoOdeHistory")}</span>
                    <span className="text-xl font-TextFontLight text-secoundColor">{t("YouHaven'tMadeAnyPurchaseYet")}</span>
                    <div className="mt-8">
                        <LinkButton text={t('ExploreMenu')} to="/" />
                    </div>
                </div>
            ) : (
                <div className="w-full h-[65vh] overflow-y-scroll rounded-xl p-2 shadow-md">
                    <div className="space-y-4">
                        {ordersHistory.map((order) => (
                            <div key={order.id} className="overflow-hidden bg-white shadow-md rounded-xl">
                                {/* Order Number */}
                                <div className="px-4 py-3 bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-TextFontMedium text-secoundColor">{t("Order#")}</h3>
                                        <span className="px-3 py-1 text-sm text-white bg-red-500 rounded-full">{order.id}</span>
                                    </div>
                                </div>
                                {/* Order Status */}
                                <div className="px-4 py-3 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-TextFontMedium text-secoundColor">{t("OrderStatus")}</h3>
                                        <span className="px-3 py-1 text-sm text-white bg-blue-500 rounded-full">{order.order_status}</span>
                                    </div>
                                    <p className="text-sm text-secoundColor">{t("OrderDate")}: {formatTime(order.date)}</p>
                                </div>
                                {/* Order Items */}
                                <div className="px-4 py-3">
                                    <h3 className="text-lg font-TextFontMedium text-secoundColor">{t("OrderItems")}</h3>
                                    {order.products.map((detail, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-1 text-sm">
                                            <div>
                                                <p className="font-TextFontRegular">{detail.name}</p>
                                                <span className="text-xs text-gray-500">x{detail.count}</span>
                                            </div>
                                            {/* <span className="text-red-500 font-TextFontMedium">
                                                {detail.product[0].product.price * detail.product[0].count || 'N/A'} EGP
                                            </span> */}
                                        </div>
                                    ))}
                                </div>
                                {/* Order Details */}
                                <div className="px-4 py-3">
                                    <h3 className="text-lg font-TextFontMedium text-secoundColor">{t("OrderDetails")}</h3>
                                    <div className="space-y-1 text-sm text-secoundColor">
                                        <p>{t("OrderType")}: {order.order_type.replace('_', ' ').replace(/^./, (c) => c.toUpperCase())}</p>
                                        {order.order_type === t("take_away") && (
                                            <p>{t("AddressName")}: {order.address_name || t("Notspecified")}</p>
                                        )}
                                    </div>
                                </div>
                                {/* Payment Details */}
                                <div className="px-4 py-3">
                                    <h3 className="text-lg font-TextFontMedium text-secoundColor">{t("PaymentDetails")}</h3>
                                    <div className="space-y-1 text-sm text-secoundColor">
                                        <p>{t("PaymentMethod")}: {order.payment_method}</p>
                                        <p>{t("Delivery")}: {order.delivery_price || '0.00'} EGP</p>
                                        <p className="font-TextFontMedium">{t("Total")}: <span className="text-red-500">{order.amount} EGP</span></p>
                                    </div>
                                </div>
                                {/* Action Buttons */}
                                <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                                    <Link
                                        to={`/orders/order_traking/${order.id}`}
                                        className="px-3 py-1 text-sm text-white rounded-md bg-mainColor"
                                    >
                                        {t("OrderTracking")}
                                    </Link>
                                </div>
                                {order.rejected_reason && (
                                    <div className="px-4 py-3 border-l-4 border-red-500 bg-red-50">
                                        <div className="flex items-center gap-2">
                                            <Warning className="w-5 h-5 text-red-500" aria-hidden="true" />
                                            <h3 className="text-sm text-red-700 font-TextFontMedium">{t("RejectedReason")}</h3>
                                        </div>
                                        <p className="mt-1 text-sm text-red-600">{order.rejected_reason}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default HistoryOrders;