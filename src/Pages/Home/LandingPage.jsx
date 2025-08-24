import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FiHome } from "react-icons/fi";
import { MdWork } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { UpdateOrder, setPickupLoctaion, setCategories, setProducts, setProductsDiscount, setProductsDiscountFilter, setProductsFilter, setTaxType } from '../../Store/CreateSlices';
import AddButton from '../../Components/Buttons/AddButton';
import { useNavigate } from 'react-router-dom';
import { useDelete } from '../../Hooks/useDelete';
import { MdDelete, MdDeliveryDining } from "react-icons/md";
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { PiWarningCircle } from "react-icons/pi";
import { GiMeal } from "react-icons/gi";
import { StaticSpinner } from '../../Components/Components';
import { useGet } from '../../Hooks/useGet';
import { useAuth } from '../../Context/Auth';
import { useTranslation } from 'react-i18next';

// Memoized Branch Item Component
const BranchItem = React.memo(({ branch, isSelected, onClick, t }) => (
  <div
    className={`w-full flex items-center justify-start gap-x-3 text-xl font-TextFontRegular px-3 py-3 rounded-xl cursor-pointer transition-all ease-in-out duration-300
      ${isSelected ? 'text-white bg-mainColor' : 'text-black bg-gray-100 hover:bg-mainColor hover:text-white'}`}
    onClick={onClick}
  >
    <img
      src={branch?.image_link || ''}
      alt={branch?.name || 'Branch Image'}
      className="w-14 h-14 md:w-20 md:h-20 rounded-full object-cover object-center"
      loading="lazy"
    />
    <div className="flex flex-col items-start justify-center">
      <span className="sm:text-lg xl:text-xl font-TextFontRegular">
        {branch.name.charAt(0).toUpperCase() + (branch.name.slice(1) || '')}
      </span>
      <span className="sm:text-xs xl:text-lg font-TextFontRegular">
        {branch.address.charAt(0).toUpperCase() + (branch.address.slice(1) || '')}
      </span>
    </div>
  </div>
));

// Memoized Location Item Component
const LocationItem = React.memo(({ location, isSelected, onSelect, onDelete, t }) => (
  <div
    onClick={() => onSelect(location)}
    className={`group w-full flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300 shadow-sm
      ${isSelected ? 'bg-mainColor text-white' : 'bg-gray-100 text-black hover:bg-mainColor hover:text-white hover:border-mainColor'}`}
  >
    <div className="flex-shrink-0 p-2 transition rounded-md bg-mainColor group-hover:bg-mainColor">
      {location.type === 'Home' ? (
        <FiHome className="w-6 h-6 text-white" />
      ) : (
        <MdWork className="w-6 h-6 text-white" />
      )}
    </div>
    <div className="flex flex-col w-full space-y-1 text-sm">
      <p className="font-semibold line-clamp-1">
        {location.address?.charAt(0).toUpperCase() + (location.address?.slice(1) || '')}
      </p>
      <p className="text-xs line-clamp-1">
        <strong>{t("Bldg")}:</strong> {location.building_num || '-'} |
        <strong>{t("Floor")}:</strong> {location.floor_num || '-'} |
        <strong>{t("Apt")}:</strong> {location.apartment || '-'}
      </p>
      <p className="text-xs line-clamp-1">
        <strong>{t("Extra")}:</strong> {location.additional_data || '-'}
      </p>
      <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200">
        <span className="text-xs font-medium">{t("zoneprice")}: {location?.zone?.price || '-'}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(location.id);
          }}
          className="transition hover:text-white"
        >
          <MdDelete size="18" />
        </button>
      </div>
    </div>
  </div>
));

const LandingPage = () => {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useAuth();
  const order = useSelector(state => state?.order?.data || {});
  const total = useSelector(state => state?.totalPrice?.data || 0);
  const selectedLanguage = useSelector(state => state.language?.selected ?? 'en');
  const { deleteData } = useDelete();

  const [openDelete, setOpenDelete] = useState(null);
  const [canNavigate, setCanNavigate] = useState(false);
  const [locations, setLocations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [orderTypes, setOrderTypes] = useState([]);

  // Fetch initial data
  const {
    refetch: refetchInitialData,
    loading: loadingInitialData,
    data: initialData
  } = useGet({
    url: `${apiUrl}/customer/address`,
    required: true
  });

  const {
    refetch: refetchBranches,
    loading: loadingBranchesa,
    data: initialBranches
  } = useGet({
    url: `${apiUrl}/customer/order_type`,
  });

  // Fetch initial data on mount
  useEffect(() => {
    refetchInitialData();
    refetchBranches();
  }, [refetchInitialData, refetchBranches]);

  // Process initial data
  useEffect(() => {
    if (initialData) {
      setLocations(initialData.addresses || []);
    }
  }, [initialData]);

    // Initialize with take_away as default
  const [orderConfig, setOrderConfig] = useState(() => {
    const savedOrderType = localStorage.getItem('orderTypeSelected');
    const savedOrderTypeId = localStorage.getItem('orderTypeId');

    // If no saved order type, default to take_away
    return {
      orderTypeSelected: '',
      orderTypeId: '',
      brancheId: '',
      locationId: '',
      deliveryPrice: localStorage.getItem('deliveryPrice') || '',
    };
  });
  useEffect(() => {
    if (initialBranches) {
      setBranches(initialBranches.branches || []);
      setOrderTypes(initialBranches.order_types || []);

      // Ensure take_away is set as default if order types are available
      if (!orderConfig.orderTypeSelected && initialBranches.order_types?.length > 0) {
          updateOrderConfig({
            orderTypeSelected: initialBranches.order_types[0]?.type,
            orderTypeId: initialBranches.order_types[0]?.id.toString()
          });
      }
    }
  }, [initialBranches, orderConfig.orderTypeSelected]);

  // Update Redux order object
  useEffect(() => {
    const newOrder = {
      ...order,
      order_type: orderConfig.orderTypeSelected,
      branch_id: orderConfig.brancheId,
      address_id: orderConfig.locationId,
      delivery_price: orderConfig.deliveryPrice,
      amount: Number(total) + Number(orderConfig.deliveryPrice || 0)
    };

    if (JSON.stringify(newOrder) !== JSON.stringify(order)) {
      dispatch(UpdateOrder(newOrder));
    }
  }, [orderConfig.orderTypeSelected, orderConfig.brancheId, orderConfig.locationId, orderConfig.deliveryPrice, total, dispatch, order]);

  // Navigate to menu
  useEffect(() => {
    if ((orderConfig.brancheId || orderConfig.locationId)) {
      navigate('/menu', { replace: true });
    }
  }, [canNavigate, orderConfig.brancheId, orderConfig.locationId, navigate]);

  // Trigger product fetch when productsUrl changes
  useEffect(() => {
    if (orderConfig.brancheId || orderConfig.locationId) {
      dispatch(setPickupLoctaion(orderConfig.brancheId || orderConfig.locationId));
    }
  }, [dispatch, orderConfig.brancheId, orderConfig.locationId]);

  // Update order config and sync to localStorage
  const updateOrderConfig = useCallback((updates) => {
    setOrderConfig(prev => {
      const newConfig = { ...prev, ...updates };
      Object.entries(updates).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      return newConfig;
    });
    setCanNavigate(false);
  }, []);

  // Handle order type selection
  const handleOrderTypeSelect = useCallback((type) => {
    if (type.type === 'delivery' && !auth.user) {
      navigate('/auth/login', { replace: true });
      return;
    }

    if (orderConfig.orderTypeSelected !== type.type || orderConfig.orderTypeId !== type.id.toString()) {
      updateOrderConfig({
        orderTypeSelected: type.type,
        orderTypeId: type.id.toString(),
        brancheId: '',
        locationId: '',
        deliveryPrice: ''
      });
    }
  }, [auth.user, navigate, orderConfig.orderTypeSelected, orderConfig.orderTypeId, updateOrderConfig]);

  // Handle branch selection
  const handleSelectBranch = useCallback((branch) => {
    if (branch.status === 0) {
      auth.toastError(branch.block_reason || t("BranchBlockedDefault"));
      return;
    }
    if (orderConfig.brancheId !== branch.id) {
      updateOrderConfig({
        brancheId: branch.id,
        deliveryPrice: '',
        locationId: ''
      });
    }
  }, [orderConfig.brancheId, auth, t, updateOrderConfig]);

  // Handle location selection
  const handleSelectLocation = useCallback((location) => {
    if (location.branch_status === 0) {
      auth.toastError(location.block_reason || t("AddressBlockedDefault"));
      return;
    }
    if (orderConfig.locationId !== location.id) {
      updateOrderConfig({
        locationId: location.id,
        deliveryPrice: location?.zone?.price || '',
        brancheId: ''
      });
    }
  }, [orderConfig.locationId, auth, t, updateOrderConfig]);

  // Handle add address
  const handleAddAddress = useCallback(() => {
    navigate('/check_out/add_address');
  }, [navigate]);

  // Handle delete dialog
  const handleOpenDelete = useCallback((item) => {
    setOpenDelete(item);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setOpenDelete(null);
  }, []);

  const handleDelete = useCallback(async (id) => {
    const locationToDelete = locations.find(loc => loc.id === id);
    if (!locationToDelete) return;

    const success = await deleteData(
      `${apiUrl}/customer/address/delete/${id}`,
      `${locationToDelete.address} ${t("DeletedSuccess")}`
    );

    if (success) {
      setLocations(prev => prev.filter(location => location.id !== id));
      if (orderConfig.locationId === id) {
        updateOrderConfig({
          locationId: '',
          deliveryPrice: ''
        });
      }
    }
    handleCloseDelete();
  }, [deleteData, apiUrl, locations, orderConfig.locationId, handleCloseDelete, t, updateOrderConfig]);

  // Skeleton Loading State
  if (loadingInitialData || loadingBranchesa) {
    return (
      <div className="flex flex-col w-full gap-3 mb-5">
        <div className="flex flex-col w-full gap-5 p-4 lg:flex-row">
          {/* Skeleton for order type selection */}
          <div className="flex flex-col items-center justify-center w-full gap-5 pt-4 lg:w-1/2 gap-x-3 md:p-6">
            <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex items-center justify-center w-full gap-x-4 md:gap-x-6">
              {[1, 2].map((i) => (
                <div key={i} className="min-w-40 h-40 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Skeleton for branch/location selection */}
          <div className="flex flex-col justify-center w-full gap-5 lg:w-1/2 gap-x-3">
            <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full h-20 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col w-full gap-3 mb-5'>
      <div className="flex flex-col w-full gap-5 p-4 lg:flex-row">
        {/* Order Type Selection */}
        <div className="flex flex-col items-center justify-center w-full gap-5 pt-4 lg:w-1/2 gap-x-3 md:p-6">
          <h1 className='text-2xl font-semibold'>{t("OrderType")}</h1>
          <div className="flex items-center justify-center w-full gap-x-4 md:gap-x-6">
            {orderTypes.map((type) => (
              type.status === 1 && (
                <span
                  key={type.id}
                  className={`flex min-w-40 h-40 flex-col items-center justify-center gap-2 text-xl font-TextFontRegular px-4 py-2 rounded-lg cursor-pointer border-2 transition-all ease-in-out duration-300
                    ${orderConfig.orderTypeSelected === type.type ? 'text-mainColor border-mainColor bg-white' : 'text-mainColor bg-thirdColor border-thirdColor'}`}
                  onClick={() => handleOrderTypeSelect(type)}
                >
                  {type.type === "delivery" ? (
                    <>
                      <MdDeliveryDining size={64} />
                      <span>{t("Delivery")}</span>
                    </>
                  ) : type.type === "take_away" ? (
                    <>
                      <GiMeal size={64} />
                      <span>{t("Take_away")}</span>
                    </>
                  ) : null}
                </span>
              )
            ))}
          </div>
        </div>

        {/* Address/Branch Selection */}
        <div className="flex flex-col justify-center w-full gap-5 lg:w-1/2 gap-x-3">
          {(orderConfig.orderTypeSelected === 'delivery' && auth.user) && (
            <>
              <h1 className='text-2xl font-semibold'>{t("SelectAddress")}</h1>
              <div className='flex justify-end w-full'>
                <AddButton handleClick={handleAddAddress} text={t("AddNewAddress")} Color='mainColor' iconColor='mainColor' />
              </div>
              <div className="w-full max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                {locations.map((location) => (
                  <LocationItem
                    key={location.id}
                    location={location}
                    isSelected={orderConfig.locationId === location.id}
                    onSelect={handleSelectLocation}
                    onDelete={handleOpenDelete}
                    t={t}
                  />
                ))}
              </div>
            </>
          )}
          {orderConfig.orderTypeSelected === 'take_away' && (
            <div className="flex flex-col items-start w-full gap-3 justify-evenly">
              <h1 className='text-2xl font-semibold'>{t("SelectBranch")}</h1>
              <div className="w-full max-h-[400px] overflow-y-auto flex flex-col gap-3">
                {branches.map((branch) => (
                  <BranchItem
                    key={branch.id}
                    branch={branch}
                    isSelected={orderConfig.brancheId === branch.id}
                    onClick={() => handleSelectBranch(branch)}
                    t={t}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!openDelete} onClose={handleCloseDelete} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4">
            <DialogPanel className="w-full max-w-sm bg-white shadow-lg rounded-xl">
              <div className="flex flex-col items-center px-6 py-6">
                <PiWarningCircle size="50" className="mb-3 text-mainColor" />
                <div className="text-center text-gray-800">
                  {t("Areyousureyouwanttodeletethislocation?")}
                  <div className="mt-1 text-sm font-semibold">
                    {locations.find(loc => loc.id === openDelete)?.address || '-'}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 pb-4">
                <button
                  className="px-4 py-2 text-sm text-white transition rounded-lg bg-mainColor hover:bg-mainColor/90"
                  onClick={() => handleDelete(openDelete)}
                >
                  {t("Delete")}
                </button>
                <button
                  onClick={handleCloseDelete}
                  className="px-4 py-2 text-sm text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  {t("Cancel")}
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default LandingPage;