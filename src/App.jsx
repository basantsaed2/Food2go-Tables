import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import { useGet } from './Hooks/useGet';
import { setSignUpType, setLanguageData, setMainData, setCompanyInfo } from './Store/CreateSlices';
import { useTranslation } from 'react-i18next';
import './index.css';
import './i18n'; // Initialize i18next globally
import { LoaderLogin } from './Components/Components'; // Keep LoaderLogin for initial load

// Lazy load heavy components
const Navbar = lazy(() => import('./Components/Components').then(module => ({ default: module.Navbar })));
const Footer = lazy(() => import('./Components/Components').then(module => ({ default: module.Footer })));

const App = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const mainData = useSelector((state) => state.mainData?.data);
  const dispatch = useDispatch();
  const location = useLocation();
  const { i18n } = useTranslation();
  const scrollContainerRef = useRef(null);

  // Fetch all necessary initial data in parallel
  const { refetch: refetchSignUp, loading: loadingSignUp, data: dataSignUp } = useGet({
    url: `${apiUrl}/api/customer_login`,
  });
  const { refetch: refetchMaintenance, loading: loadingMaintenance, data: dataMaintenance } = useGet({
    url: `${apiUrl}/api/business_setup`,
  });
  const { refetch: refetchLanguage, loading: loadingLanguageData, data: dataLanguages } = useGet({
    url: `${apiUrl}/customer/home/translation`,
  });
  const { refetch: refetchMainData, loading: loadingMainData, data: dataMainData } = useGet({
    url: `${apiUrl}/customer/home/main_data`,
  });

  // Trigger all fetches on mount
  useEffect(() => {
    refetchSignUp();
    refetchMaintenance();
    refetchLanguage();
    refetchMainData();
  }, [refetchSignUp, refetchMaintenance, refetchLanguage, refetchMainData]);

  // Dispatch data to Redux store
  useEffect(() => {
    if (dataSignUp && dataSignUp.customer_login) {
      dispatch(setSignUpType(dataSignUp.customer_login));
    }
  }, [dataSignUp, dispatch]);

  useEffect(() => {
    if (dataMainData && dataMainData.main_data) {
      dispatch(setMainData(dataMainData.main_data));
    }
  }, [dataMainData, dispatch]);

  useEffect(() => {
    if (dataMaintenance) {
      dispatch(setCompanyInfo(dataMaintenance));
    }
  }, [dataMaintenance, dispatch]);

  useEffect(() => {
    if (dataLanguages && dataLanguages.translation) {
      dispatch(setLanguageData(dataLanguages.translation));
    }
  }, [dataLanguages, dispatch]);

  // Dynamically update title, favicon, and CSS variables
  useEffect(() => {
    if (mainData) {
      document.title = mainData?.name || "Food2go Ordering";
      const favicon = document.querySelector("link[rel='icon']");
      if (favicon && mainData?.logo_link) favicon.href = mainData?.logo_link;

      const rootStyle = document.documentElement.style;
      if (mainData?.first_color) rootStyle.setProperty('--color-main', mainData.first_color);
      if (mainData?.second_color) rootStyle.setProperty('--color-second', mainData.second_color);
      if (mainData?.third_color) rootStyle.setProperty('--color-third', mainData.third_color);
    }
  }, [mainData]);

  // Scroll to Top when page changes
  useEffect(() => {
    if (location.pathname && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [location.pathname]);

  const isLoadingInitialData = loadingSignUp || loadingMainData || loadingLanguageData || loadingMaintenance;
  const isArabic = i18n.language === 'ar';

  return (
    <PrimeReactProvider>
      {isLoadingInitialData ? (
        <div className="flex items-center justify-center w-full h-screen">
          <LoaderLogin />
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          dir={isArabic ? 'rtl' : 'ltr'}
          className="relative flex flex-col items-center justify-between w-full h-screen overflow-x-hidden overflow-y-scroll bg-white"
        >
          <div className="sticky top-0 z-30 w-full">
            <Suspense fallback={<div>Loading Navbar...</div>}>
              <Navbar />
            </Suspense>
          </div>
          <div className="w-full mb-5">
            <Suspense fallback={<div>Loading content...</div>}>
              <Outlet />
            </Suspense>
          </div>
          <Suspense fallback={<div>Loading Footer...</div>}>
            <Footer />
          </Suspense>
        </div>
      )}
    </PrimeReactProvider>
  );
};

export default App;