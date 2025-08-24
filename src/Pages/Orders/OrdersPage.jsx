import React, { useEffect } from 'react'
import { HeaderNavigate } from '../../Components/Components'
import OrderImage from '../../assets/Images/OrderImage'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'; // <-- Importing useTranslation hook

const OrdersPage = () => {
       const location = useLocation();
                  const { t, i18n } = useTranslation(); // <-- use i18n to change language

       return (
              <>
                     <div className="flex flex-col items-start justify-start w-11/12 pt-4 mx-auto gap-y-4">
                            <HeaderNavigate
                                   title={location.pathname === '/orders' || location.pathname === '/orders/history' ? t('Orders') : t('OrderTraking')}
                            />

                            <div className="flex items-center justify-center w-full pb-5 mx-auto overflow-hidden">
                                   <div className="flex items-start justify-between w-11/12">

                                          <div className="sm:w-full xl:w-5/12 flex flex-col justify-start items-center overflow-hidden min-h-[75vh]">
                                                 {/* Navbar orders */}
                                                 {(location.pathname === '/orders' || location.pathname === '/orders/history') && (

                                                        <div className="flex items-center justify-between w-full mb-4">
                                                               <Link to="/orders"
                                                                      className={`text-2xl font-TextFontRegular py-2 w-5/12 text-center rounded-2xl border-2 border-mainColor
                                                                      transition-all ease-in-out duration-300 
                                                               ${location.pathname === '/orders' ? 'bg-mainColor text-white' : 'bg-white text-mainColor hover:bg-mainColor hover:text-white'}`}
                                                               >
                                                                      {t("Orders")}
                                                               </Link>
                                                               <Link to="/orders/history"
                                                                      className={`text-2xl font-TextFontRegular py-2 w-5/12 text-center rounded-2xl border-2 border-mainColor
                                                                      transition-all ease-in-out duration-300 
                                                                      ${location.pathname === '/orders/history' ? 'bg-mainColor text-white' : 'bg-white text-mainColor hover:bg-mainColor hover:text-white'}`}
                                                               >
                                                                      {t("History")}
                                                               </Link>
                                                        </div>
                                                 )}
                                                 {/* {location.pathname === '/orders' || location.pathname === '/orders/history' && ( */}
                                                 {/* <div className="w-full min-h-[75vh]"> */}
                                                 <Outlet />
                                                 {/* </div> */}
                                          </div>

                                          <div className="sm:hidden xl:flex w-2/4 items-center justify-center h-[75vh]">
                                                 <OrderImage height='100%' />
                                          </div>
                                   </div>
                            </div>
                     </div>
              </>
       )
}

export default OrdersPage