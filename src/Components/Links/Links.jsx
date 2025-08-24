import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next';

const Links = () => {
              const pickupLocation = useSelector(state => state.pickupLocation?.data || []); // Ensure it's an array or object
                       const { t, i18n } = useTranslation(); // <-- use i18n to change language
       
       return (
              <div
                     className='flex items-center w-full py-2 justify-evenly gap-x-10 bg-mainColor rounded-3xl'
              >
                     {/* <NavLink to={''}
                            className='pb-1 text-xl text-white font-TextFontRegular'
                     >
                            Home
                     </NavLink> */}
                     <NavLink to={'menu_image'}
                            className='pb-1 text-xl text-white font-TextFontRegular'
                     >
                                                        {t("Menu")}

                     </NavLink>
                     {/* <NavLink
                            to={pickupLocation && (!Array.isArray(pickupLocation) || pickupLocation.length > 0) ? '/menu' : '/location'}
                            className='pb-1 text-xl text-white font-TextFontRegular'
                     >
                            Order Online
                     </NavLink> */}
                     <NavLink
                            to={'/location'}
                            className='pb-1 text-xl text-white font-TextFontRegular'
                     >
                            {t("orderOnline")}
                     </NavLink>
                     <NavLink to={'branches'}
                            className='pb-1 text-xl text-white font-TextFontRegular'
                     >
                            {t("branch")}
                     </NavLink>
                     <NavLink to={'/contact_us'}
                            className='pb-1 text-xl text-white font-TextFontRegular'
                     >
{t("contactUs")}                     </NavLink>
              </div>
       )
}

export default Links