import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // <-- Importing useTranslation hook

const NotFoundPage = () => {
                         const { t, i18n } = useTranslation(); // <-- use i18n to change language
       
       return (
              <>
                     <section className="bg-white h-[100vh] flex justify-center">
                            <div className="max-w-screen-xl m-auto">
                                   <div className="mx-auto text-center max-w-screen">
                                          <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-[#D01025]">404</h1>
                                          <p className="mb-4 text-3xl font-bold tracking-tight ltr md:text-4xl">{t("NotFoundPage")}</p>
                                   </div>
                            </div>
                     </section>
              </>
       )
}

export default NotFoundPage