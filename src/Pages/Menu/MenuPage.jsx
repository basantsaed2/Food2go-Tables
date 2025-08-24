import CategoriesNavSection from './Sections/CategoriesNavSection'
import ItemsMenuSection from './Sections/ItemsMenuSection'
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCategories, setProducts, setProductsDiscount, setProductsDiscountFilter, setProductsFilter, setTaxType } from './../../Store/CreateSlices';
import { useAuth } from '../../Context/Auth';
import { useGet } from '../../Hooks/useGet';
import { StaticSpinner } from '../../Components/Components';
const MenuPage = () => {
  const dispatch = useDispatch();
  const selectedLanguage = useSelector((state) => state.language?.selected ?? 'en');
  const order = useSelector((state) => state?.order?.data || {});
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const auth = useAuth();
  const productsFilter = useSelector(state => state.productsFilter?.data);

  // Construct API URL dynamically
  const key = order.branch_id ? 'branch_id' : 'address_id';
  const value = order.branch_id || order.address_id || '';
  // Construct the URL with user_id if auth.user exists
  const api = `${apiUrl}/customer/home/web_products?${key}=${value}&locale=${selectedLanguage}${auth.user?.user ? `&user_id=${auth.user?.user.id}` : ''
    }`;

  const {
    refetch: refetchProducts,
    loading: loadingProducts,
    data: dataProducts,
  } = useGet({
    url: api,
    skip: !value,
  });

  // Refetch products when value or selectedLanguage changes
  useEffect(() => {
    if (value) {
      refetchProducts();
    }
  }, [value, selectedLanguage, refetchProducts]);

  // Update Redux store with fetched data
  useEffect(() => {
    if (dataProducts && value) {
      dispatch(setTaxType(dataProducts?.tax || null));
      dispatch(setProducts(dataProducts?.products || []));
      dispatch(setProductsFilter(dataProducts?.products || []));
      dispatch(setCategories(dataProducts?.categories || []));
      dispatch(setProductsDiscount(dataProducts?.discounts || []));
      dispatch(setProductsDiscountFilter(dataProducts?.discounts || []));
    }
  }, [dataProducts, dispatch, value]);

  if (loadingProducts) {
    return <StaticSpinner />
  }
  return (
    <>
      <div className="w-full flex flex-col bg-[#f5f5f5] items-center justify-center gap-y-3">
        <CategoriesNavSection />
        <ItemsMenuSection />

        {/* {
          productsFilter ? (
            <ItemsMenuSection />
          ) :
            <StaticSpinner />
        } */}
      </div>
    </>
  )
}

export default MenuPage