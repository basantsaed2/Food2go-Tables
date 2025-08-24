import React, { useState, useEffect } from 'react';
import RedLogo from '../../assets/Images/RedLogo';
import { Links } from '../Components';
import { Link, useLocation } from 'react-router-dom';
import { MdFavoriteBorder, MdRestaurantMenu } from 'react-icons/md';
// import FaShoppingCart from '../../assets/Icons/FaShoppingCart';
import { LuUserRound } from 'react-icons/lu';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../../Store/CreateSlices'; // <-- Adjust this path
import { FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; // <-- Importing useTranslation hook
import { FaShoppingCart } from "react-icons/fa";

const Navbar = () => {
    const { t, i18n } = useTranslation(); // <-- use i18n to change language

    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(state => state.user?.data);
    const mainData = useSelector(state => state.mainData?.data);
    const languages = useSelector(state => state.language ? state.language.data : []);
    const selectedLanguage = useSelector(state => state.language?.selected ?? 'en');
    const [pages] = useState(['/auth/login', '/auth/sign_up', '/auth/login/forgot_password', '/auth/otp_verification']);
    const [toggleOpen, setToggleOpen] = useState(false);
    const pickupLocation = useSelector(state => state.pickupLocation?.data || []);
    const items = useSelector(state => state.productsCard?.data || []); // Get cart items
    // This effect runs every time the language changes
    useEffect(() => {
        // Change the language when the selectedLanguage in Redux updates
        if (selectedLanguage) {
            i18n.changeLanguage(selectedLanguage);
        }
    }, [selectedLanguage, i18n]); // Add i18n to the dependencies to ensure proper updating

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        dispatch(setLanguage(newLang));  // Update Redux store with the new language
    };
    return (
        <>
            {pages.some(page => location.pathname === page) ? (
                ''
            ) : (
                <nav className='relative flex justify-between w-full py-3 bg-white shadow-md align-center sm:px-5 xl:px-10'>
                    <div className='z-10 flex items-center justify-start sm:w-6/12 xl:w-3/12 gap-x-2'>
                        <Link to={'/'} className="flex items-center justify-start gap-x-2">
                            <img src={mainData.logo_link} width={50} height={50} alt="Logo" />
                            <span className='text-2xl md:text-3xl text-mainColor font-TextFontRegular'>{selectedLanguage === "en"? mainData.name : mainData.ar_name}</span>
                        </Link>
                    </div>
                    <div className='items-center w-5/12 sm:hidden xl:flex'>
                        <Links />
                    </div>

                    <div className='items-center justify-end w-3/12 sm:hidden xl:flex gap-x-4'>
                        {user ? (
                            <>
                                <div className="flex items-center gap-2 px-4 py-2 rounded">
                                    <FaGlobe className="w-5 h-5 text-mainColor" />
                                    {languages.length > 0 ? (
                                        <select
                                            onChange={handleLanguageChange}
                                            value={selectedLanguage || 'en'}
                                            className="font-medium bg-transparent cursor-pointer text-mainColor focus:outline-none text-md"
                                        >
                                            {languages.map((lang) => (
                                                <option key={lang.id} value={lang.name} className="text-sm text-mainColor">
                                                    {lang.name.toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-sm text-gray-400">{t('loadingLanguages')}</span>
                                    )}
                                </div>

                                <Link to={'/favorites'}>
                                    <MdFavoriteBorder className='text-3xl text-mainColor' />
                                </Link>
                                <Link to={'/cart'} className="relative">
                                    <FaShoppingCart className='w-6 h-6 text-mainColor' />
                                    {items.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {items.length}
                                        </span>
                                    )}
                                </Link>
                                <Link to={'/profile'}>
                                    <LuUserRound className='text-3xl text-mainColor' />
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to={'/auth/login'}
                                    className='px-5 py-1 text-xl border-2 rounded-full text-mainColor border-mainColor font-TextFontRegular'
                                >
                                    {t('login')}
                                </Link>
                                <Link
                                    to={'/auth/sign_up'}
                                    className='px-5 py-1 text-xl text-white border-2 rounded-full bg-mainColor border-mainColor font-TextFontRegular'
                                >
                                    {t('signUp')}
                                </Link>
                            </>
                        )}
                    </div>
                    <div className='flex gap-3 items-center justify-center xl:hidden'>
                        <div className="flex items-center rounded">
                            <FaGlobe className="w-5 h-5 text-mainColor" />
                            {languages.length > 0 ? (
                                <select
                                    onChange={(e) => dispatch(setLanguage(e.target.value))}
                                    value={selectedLanguage || 'en'}
                                    className="font-medium bg-transparent cursor-pointer text-mainColor focus:outline-none text-md"
                                >
                                    {languages.map((lang) => (
                                        <option key={lang.id} value={lang.name} className="text-sm text-mainColor">
                                            {lang.name.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className="text-sm text-gray-400">{t('loadingLanguages')}</span>
                            )}
                        </div>
                        <Link to={'/cart'} className="relative">
                            <FaShoppingCart className='w-5 h-5 text-mainColor' />
                            {items.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {items.length}
                                </span>
                            )}
                        </Link>
                        <MdRestaurantMenu
                            onClick={() => setToggleOpen(!toggleOpen)}
                            className='z-10 text-4xl cursor-pointer text-mainColor'
                        />
                    </div>

                    {/* Mobile Navbar  */}
                    <div
                        className={`w-full absolute ${toggleOpen ? 'top-16' : '-top-[400px]'} transition-all duration-300 left-0 bg-white shadow-md sm:flex xl:hidden flex-col items-center justify-center px-4 pb-3 rounded-br-3xl rounded-bl-3xl z-20`}
                    >
                        <div className='flex flex-col w-full'>
                            <Link
                                to={'menu_image'}
                                className='w-full p-3 pb-1 text-xl border-b-2 font-TextFontMedium text-mainColor'
                                onClick={() => setToggleOpen(false)}
                            >
                                {t('menu')}
                            </Link>
                            <Link
                                to={'/location'}
                                className='w-full p-3 pb-1 text-xl border-b-2 font-TextFontMedium text-mainColor'
                                onClick={() => setToggleOpen(false)}
                            >
                                {t('orderOnline')}
                            </Link>
                            <Link
                                to={'branches'}
                                className='w-full p-3 pb-1 text-xl border-b-2 font-TextFontMedium text-mainColor'
                                onClick={() => setToggleOpen(false)}
                            >
                                {t('branch')}
                            </Link>
                            <Link
                                to={'/contact_us'}
                                className='w-full p-3 pb-1 text-xl border-b-2 font-TextFontMedium text-mainColor'
                                onClick={() => setToggleOpen(false)}
                            >
                                {t('contactUs')}
                            </Link>
                        </div>
                        <div className='flex flex-col items-center justify-center w-full gap-y-2'>
                            {user ? (
                                <div className='flex flex-col items-center justify-center w-full gap-x-3'>
                                    <Link
                                        to={'/favorites'}
                                        className='flex items-center w-full gap-3 p-3 pb-1 text-xl border-b-2 font-TextFontMedium text-mainColor'
                                        onClick={() => setToggleOpen(false)}
                                    >
                                        <MdFavoriteBorder className='text-2xl text-mainColor' /> {t('favorites')}
                                    </Link>
                                    <Link
                                        to={'/cart'}
                                        className='flex items-center w-full gap-3 p-3 pb-1 text-xl border-b-2 font-TextFontMedium text-mainColor'
                                        onClick={() => setToggleOpen(false)}
                                    >
                                        <FaShoppingCart /> {t('cart')}
                                    </Link>
                                    <Link
                                        to={'/profile'}
                                        className='flex items-center w-full gap-3 p-3 pb-1 text-xl border-b-2 font-TextFontMedium text-mainColor'
                                        onClick={() => setToggleOpen(false)}
                                    >
                                        <LuUserRound className='text-2xl text-mainColor' /> {t('profile')}
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        to={'/auth/login'}
                                        onClick={() => setToggleOpen(false)}
                                        className='w-full px-5 py-1 text-xl text-center border-2 rounded-full text-mainColor border-mainColor font-TextFontRegular'
                                    >
                                        {t('login')}
                                    </Link>
                                    <Link
                                        to={'/auth/sign_up'}
                                        onClick={() => setToggleOpen(false)}
                                        className='w-full px-5 py-1 text-xl text-center text-white border-2 rounded-full bg-mainColor border-mainColor font-TextFontRegular'
                                    >
                                        {t('signUp')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>
            )}
        </>
    );
};

export default Navbar;
