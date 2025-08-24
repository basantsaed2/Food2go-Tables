import React, { useState } from 'react';
import { GiSettingsKnobs } from 'react-icons/gi';
import { useTranslation } from 'react-i18next'; // <-- Importing useTranslation hook

const DealsOfferSection = () => {
       const [activeTab, setActiveTab] = useState('Deals');
                const { t, i18n } = useTranslation(); // <-- use i18n to change language

       const handleClick = (tabName) => {
              setActiveTab(tabName);
       };

       return (
              <div className="flex flex-wrap items-center justify-start w-full gap-5">
                     <div
                            className={`w-auto border-2 border-mainColor hover:bg-mainColor hover:text-white transition-all ease-in-out duration-300 cursor-pointer px-3 py-2 rounded-full flex justify-between items-center gap-4 ${activeTab === 'Deals' ? 'bg-mainColor text-white' : 'bg-white text-mainColor'
                                   }`}
                            onClick={() => handleClick('Deals')}
                     >
                            <GiSettingsKnobs
                                   className='text-2xl transform rotate-90'
                            />
                            <span className="text-2xl">{t("Deals")}</span>
                     </div>
                     <div
                            className={`w-auto border-2 border-mainColor hover:bg-mainColor hover:text-white transition-all ease-in-out duration-300 cursor-pointer px-3 py-2 rounded-full flex justify-between items-center gap-4 ${activeTab === 'Bestsellers' ? 'bg-mainColor text-white' : 'bg-white text-mainColor'
                                   }`}
                            onClick={() => handleClick('Bestsellers')}
                     >
                            <GiSettingsKnobs
                                   className='text-2xl transform rotate-90'
                            />
                            <span className="text-2xl">{t("Bestsellers")}</span>
                     </div>
                     <div
                            className={`w-auto border-2 border-mainColor hover:bg-mainColor hover:text-white transition-all ease-in-out duration-300 cursor-pointer px-3 py-2 rounded-full flex justify-between items-center gap-4 ${activeTab === 'Highest To Lowest Rating' ? 'bg-mainColor text-white' : 'bg-white text-mainColor'
                                   }`}
                            onClick={() => handleClick('Highest To Lowest Rating')}
                     >
                            <GiSettingsKnobs
                                   className='text-2xl transform rotate-90'
                            />
                            <span className="text-2xl">{t("HighestToLowestRating")}</span>
                     </div>
                     <div
                            className={`w-auto border-2 border-mainColor hover:bg-mainColor hover:text-white transition-all ease-in-out duration-300 cursor-pointer px-3 py-2 rounded-full flex justify-between items-center gap-4 ${activeTab === 'Lowest To Highest Rating' ? 'bg-mainColor text-white' : 'bg-white text-mainColor'
                                   }`}
                            onClick={() => handleClick('Lowest To Highest Rating')}
                     >
                            <GiSettingsKnobs
                                   className='text-2xl transform rotate-90'
                            />
                            <span className="text-2xl">{t("LowestToHighestRating")}</span>
                     </div>
                     <div
                            className={`w-auto border-2 border-mainColor hover:bg-mainColor hover:text-white transition-all ease-in-out duration-300 cursor-pointer px-3 py-2 rounded-full flex justify-between items-center gap-4 ${activeTab === 'Lowest To Highest Price' ? 'bg-mainColor text-white' : 'bg-white text-mainColor'
                                   }`}
                            onClick={() => handleClick('Lowest To Highest Price')}
                     >
                            <GiSettingsKnobs
                                   className='text-2xl transform rotate-90'
                            />
                            <span className="text-2xl">{t("LowestToHighestPrice")}</span>
                     </div>
                     <div
                            className={`w-auto border-2 border-mainColor hover:bg-mainColor hover:text-white transition-all ease-in-out duration-300 cursor-pointer px-3 py-2 rounded-full flex justify-between items-center gap-4 ${activeTab === 'Highest To Lowest Price' ? 'bg-mainColor text-white' : 'bg-white text-mainColor'
                                   }`}
                            onClick={() => handleClick('Highest To Lowest Price')}
                     >
                            <GiSettingsKnobs
                                   className='text-2xl transform rotate-90'
                            />
                            <span className="text-2xl">{t("HighestToLowestPrice")}</span>
                     </div>
              </div>
       );
};

export default DealsOfferSection;
