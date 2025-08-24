import React from 'react';
import { FaHeart, FaPlus } from 'react-icons/fa';
import { LinkButton, SubmitButton } from '../Components';
import { useAuth } from '../../Context/Auth';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setProductsFilter } from '../../Store/CreateSlices';
import { useTranslation } from 'react-i18next';
import { useChangeState } from '../../Hooks/useChangeState';

const CardItem = ({ product, index }) => {
  const auth = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { changeState, loadingChange } = useChangeState();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.productsFilter.data);
  const pickupLocation = useSelector((state) => state.pickupLocation?.data || []);

  const handleFavorite = async (id) => {
    if (!auth.user) {
      navigate('/auth/login', { replace: true });
      return;
    }
    try {
      // Toggle the favorite state for the API payload
      const newFavoriteState = !product.favourite;
      await changeState(`${apiUrl}/customer/home/favourite/${id}`, 
       `Product Favourite Changed!`,
       {favourite: newFavoriteState ===true? 1:0,});
      // Update the products in Redux state only after successful API call
      const updatedProducts = products.map((p) =>
        p.id === id ? { ...p, favourite: newFavoriteState } : p
      );
      dispatch(setProductsFilter(updatedProducts));
    } catch (error) {
      console.error('Failed to update favorite:', error);
      auth.toastError('Failed to update favorite. Please try again.');
    }
  };

  const handleSendOrder = (id) => {
    if (!auth.user) {
      auth.toastError('You must be logged in to continue.');
      navigate('/auth/login', { replace: true });
      return;
    }

    if (!pickupLocation || (Array.isArray(pickupLocation) && pickupLocation.length === 0)) {
      auth.toastError('Please select a pickup location before proceeding.');
      navigate(`/location`);
      return;
    }

    navigate(`/product/${product?.id}`);
  };

  return (
    <div
      className="flex flex-col min-h-[430px] md:max-h-[430px] items-start justify-between gap-y-2 bg-white rounded-2xl p-3 shadow-md w-full"
      key={index}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden shadow-md rounded-xl min-h-56 md:max-h-56">
        <img
          src={product?.image_link || '/src/assets/Images/RedLogo.jsx'}
          className="object-contain object-center w-full h-full"
          alt="item"
          loading="lazy"
        />
        {/* Favorite Icon */}
        <button
          className="absolute top-4 right-5"
          onClick={() => handleFavorite(product?.id)}
          disabled={loadingChange} // Disable during API request
        >
          <FaHeart
            className={`${
              product?.favourite === true ? 'text-mainColor' : 'text-red-400'
            } hover:text-mainColor transition-all duration-200 text-2xl`}
          />
        </button>
        {product?.discount && (
          product?.discount?.type === 'percentage' ? (
            <span className="absolute w-full text-xl text-center -rotate-45 shadow-md top-5 -left-28 bg-thirdBgColor text-mainColor font-TextFontMedium">
              {product?.discount?.amount || '0'}%
            </span>
          ) : (
            <span className="absolute w-full text-xl text-center -rotate-45 shadow-md top-5 -left-28 bg-thirdBgColor text-mainColor font-TextFontMedium">
              {product?.discount?.amount || '0'} EGP
            </span>
          )
        )}
      </div>

      {/* Item Name */}
      <span className="text-xl font-TextFontMedium text-mainColor">
        {product?.name || '-'}
      </span>

      {/* Item Description */}
      <p className="w-full text-sm text-secoundColor font-TextFontRegular text-ellipsis overflow-hidden ...">
        {product?.description}
      </p>

      {/* Item Amount */}
      <div className="flex items-center justify-start w-full gap-x-2">
        {product?.discount?.type === 'percentage' ? (
          <>
            <span className="text-xl text-mainColor font-TextFontMedium">
              {(product?.price - (product?.price * (product?.discount?.amount || 0) / 100)).toFixed(2)} {t('EGP')}
            </span>
            <span className="text-xl line-through text-secoundColor font-TextFontMedium decoration-secoundColor">
              {product?.price?.toFixed(2) || '0.00'} {t('EGP')}
            </span>
          </>
        ) : (
          <span className="text-xl text-mainColor font-TextFontMedium">
            {product?.price?.toFixed(2) || '0.00'} {t('EGP')}
          </span>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between w-full gap-3">
        <div className="flex items-center justify-center w-full">
          <SubmitButton text={t('OrderNow')} handleClick={() => handleSendOrder(product?.id)} />
        </div>
      </div>
    </div>
  );
};

export default CardItem;