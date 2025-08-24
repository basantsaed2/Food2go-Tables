import React, { useEffect, useState } from 'react';
import { useGet } from '../../../Hooks/useGet';
import { LinkButton, LoaderLogin } from '../../../Components/Components';
import EmptyOrdersIcon from '../../../assets/Icons/EmptyOrdersIcon';
import { Link } from 'react-router-dom';
import { MdAutoDelete } from 'react-icons/md';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import Warning from '../../../assets/Icons/WarningIcon';
import { useChangeState } from '../../../Hooks/useChangeState';
import { useTranslation } from 'react-i18next';

const UpComingOrders = () => {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { refetch: refetchOrders, loading: loadingOrders, data: dataOrders } = useGet({
    url: `${apiUrl}/customer/orders`,
  });
  const { changeState: cancelOrder, loadingChange: loadingCancel } = useChangeState();

  const [orders, setOrders] = useState([]);
  const [cancelledTime, setCancelledTime] = useState('');
  const [openCancelModal, setOpenCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    refetchOrders();
  }, [refetchOrders]);

  useEffect(() => {
    if (dataOrders && dataOrders.orders) {
      console.log('Data fetched:', dataOrders);
      const currentTime = new Date().getTime();
      const updatedOrders = dataOrders.orders.map((order) => ({
        ...order,
        isCancellable: isCancellable(order, dataOrders.cancel_time || '00:05:00'),
      }));
      setCancelledTime(dataOrders.cancel_time);
      setOrders(updatedOrders);
      console.log('Initial orders with isCancellable:', updatedOrders);
    }
  }, [dataOrders]);

  useEffect(() => {
    const checkCancellability = () => {
      const currentTime = new Date().getTime();
      setOrders((prevOrders) => {
        const updatedOrders = prevOrders.map((order) => {
          const isCancellableStatus = isCancellable(order, cancelledTime || '00:05:00');
          return order.isCancellable !== isCancellableStatus
            ? { ...order, isCancellable: isCancellableStatus }
            : order;
        });
        const hasChanged = prevOrders.some(
          (order, i) => order.isCancellable !== updatedOrders[i].isCancellable
        );
        console.log('Cancellability checked:', updatedOrders, 'Changed:', hasChanged);
        return hasChanged ? updatedOrders : prevOrders;
      });
    };
    checkCancellability();
    const interval = setInterval(checkCancellability, 30 * 1000);
    return () => clearInterval(interval);
  }, [cancelledTime, orders]);

  const handleOpenCancelModal = (orderId) => setOpenCancelModal(orderId);
  const handleCloseCancelModal = () => {
    setOpenCancelModal(null);
    setCancelReason('');
  };

  const handleCancelOrder = async (id) => {
    await cancelOrder(
      `${apiUrl}/customer/orders/cancel/${id}`,
      `Order #${id} is Cancelled. Reason: ${cancelReason}`,
      { status: '', customer_cancel_reason: cancelReason }
    );
    handleCloseCancelModal();
    refetchOrders();
  };

  const isCancellable = (order, cancelTime = '00:05:00') => {
    try {
      const currentTime = new Date().getTime();
      const orderTimeString = `${order.order_date}T${order.date}`;
      const orderTime = new Date(orderTimeString).getTime();

      if (isNaN(orderTime)) {
        console.error('Invalid order date or time:', order.order_date, order.date);
        return false;
      }

      const [hours, minutes, seconds] = cancelTime.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        console.error('Invalid cancellation time format:', cancelTime);
        return false;
      }

      const cancelWindow = (hours * 3600 + minutes * 60 + seconds) * 1000;
      const isWithinWindow = currentTime - orderTime <= cancelWindow;
      console.log(
        `Order ${order.id}: currentTime=${currentTime}, orderTime=${orderTime}, cancelWindow=${cancelWindow}, isCancellable=${isWithinWindow}`
      );
      return isWithinWindow;
    } catch (error) {
      console.error('Error in isCancellable for order', order.id, error);
      return false;
    }
  };

  const formatTime = (dateString, timeString) => {
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <>
      {loadingOrders || loadingCancel ? (
        <div className="flex items-center justify-center w-full h-full mt-16">
          <LoaderLogin />
        </div>
      ) : (
        <div className="w-full h-[65vh] overflow-y-scroll rounded-xl p-2 shadow-md">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-16">
              <EmptyOrdersIcon />
              <span className="text-2xl font-TextFontRegular text-fourthColor">{t('NoOdeOrders')}</span>
              <span className="text-xl font-TextFontLight text-secoundColor">{t('YouHaven\'tMadeAnyPurchaseYet')}</span>
              <div className="mt-8">
                <LinkButton text={t('ExploreMenu')} to="/" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const canCancel = order.isCancellable;
                console.log(`Rendering order ${order.id}, canCancel=${canCancel}`);
                return (
                  <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50">
                      <div className="flex gap-2 items-center">
                        <h3 className="text-lg font-TextFontMedium text-secoundColor">{t('Order#')}</h3>
                        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm">{order.id}</span>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-TextFontMedium text-secoundColor">{t('OrderStatus')}</h3>
                        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm">{order.order_status}</span>
                      </div>
                      <p className="text-sm text-secoundColor">{t('OrderDate')}: {order.order_date} - {formatTime(order.order_date, order.date)}</p>
                    </div>
                    <div className="px-4 py-3">
                      <h3 className="text-lg font-TextFontMedium text-secoundColor">{t('OrderItems')}</h3>
                      {order.products.map((product, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm py-1">
                          <div>
                            <p className="font-TextFontRegular">{product?.name}</p>
                            <span className="text-xs text-gray-500">x{product?.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3">
                      <h3 className="text-lg font-TextFontMedium text-secoundColor">{t('OrderDetails')}</h3>
                      <div className="space-y-1 text-sm text-secoundColor">
                        <p>{t('OrderType')}: {order.order_type.replace('_', ' ').replace(/^./, (c) => c.toUpperCase())}</p>
                        {order.order_type === 'take_away' && (
                          <p>{t('AddressName')}: {order.address_name || 'Not specified'}</p>
                        )}
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <h3 className="text-lg font-TextFontMedium text-secoundColor">{t('PaymentDetails')}</h3>
                      <div className="space-y-1 text-sm text-secoundColor">
                        <p>{t('PaymentMethod')}: {order.payment_method}</p>
                        <p>{t('Delivery')}: {order.delivery_price || '0.00'} EGP</p>
                        <p className="font-TextFontMedium">{t('Total')}: <span className="text-red-500">{order.amount} EGP</span></p>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex justify-between items-center bg-gray-50">
                      <Link
                        to={`order_traking/${order.id}`}
                        className="px-3 py-1 text-sm text-white bg-mainColor rounded-md"
                      >
                        {t('OrderTracking')}
                      </Link>
                      {canCancel && (
                        <button
                          onClick={() => handleOpenCancelModal(order.id)}
                          className="px-3 py-1 text-sm rounded-md flex items-center text-red-500 bg-red-100 hover:bg-red-200"
                        >
                          <MdAutoDelete className="mr-1" /> {t('CancelOrder')}
                        </button>
                      )}
                    </div>
                    {order.rejected_reason && (
                      <div className="px-4 py-3 bg-red-50 border-l-4 border-red-500">
                        <div className="flex items-center gap-2">
                          <Warning className="w-5 h-5 text-red-500" aria-hidden="true" />
                          <h3 className="text-sm font-TextFontMedium text-red-700">{t('RejectedReason')}</h3>
                        </div>
                        <p className="mt-1 text-sm text-red-600">{order.rejected_reason}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {openCancelModal && (
        <Dialog open={true} onClose={handleCloseCancelModal} className="relative z-10">
          <DialogBackdrop className="w-full fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="w-full fixed inset-0 z-10 overflow-y-auto">
            <div className="w-full flex items-center justify-center min-h-screen">
              <DialogPanel className="relative bg-white rounded-2xl p-6 w-[60%] lg:w-[40%]">
                <div className="flex flex-col items-center">
                  <Warning className="w-12 h-12" aria-hidden="true" />
                  <h3 className="text-lg font-TextFontMedium text-secoundColor mt-2">{t('CancelOrder')}</h3>
                  <p className="text-sm text-secoundColor text-center mt-2">{t('PleaseProvideReason')}</p>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder={t('EnterReason')}
                    className="w-full mt-4 p-2 border rounded-md text-sm"
                    rows="3"
                  />
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={handleCloseCancelModal}
                    className="px-4 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    onClick={() => handleCancelOrder(openCancelModal)}
                    className="px-4 py-2 text-sm text-white bg-mainColor rounded-md"
                    disabled={!cancelReason.trim()}
                  >
                    {t('ConfirmCancel')}
                  </button>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default UpComingOrders;