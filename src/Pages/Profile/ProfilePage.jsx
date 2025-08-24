import React, { useEffect, useState } from 'react';
import { SubmitButton, TitleSection } from '../../Components/Components';
import { useAuth } from '../../Context/Auth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGet } from '../../Hooks/useGet';
import { usePost } from '../../Hooks/usePost';

const ProfilePage = () => {
  const auth = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { refetch: refetchProfile, loading: loadingProfileData, data: dataProfile } = useGet({
    url: `${apiUrl}/customer/profile/profile_data`,
    required: true,
  });
  const { postData, loading: loadingPost, response } = usePost({
    url: `${apiUrl}/customer/profile/update`,
  });

  const [data, setData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    f_name: '',
    l_name: '',
    email: '',
    phone: '',
    phone_2: '',
    //     address: '',
    bio: '',
    password: '',
    image: null,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Profile on mount
  useEffect(() => {
    refetchProfile();
  }, [refetchProfile]);

  // Update state with fetched profile data
  useEffect(() => {
    if (dataProfile && dataProfile.data) {
      setData(dataProfile.data);
      setFormData({
        f_name: dataProfile.data.f_name || '',
        l_name: dataProfile.data.l_name || '',
        email: dataProfile.data.email || '',
        phone: dataProfile.data.phone || '',
        phone_2: dataProfile.data.phone_2 || '',
        //  address: dataProfile.data.address || '',
        bio: dataProfile.data.bio || '',
        password: '',
        image: null,
      });
    }
  }, [dataProfile]);

  useEffect(() => {
    if (response && successMessage) {
      setIsModalOpen(false)
      auth.toastSuccess(t('Profile Updated Successfully'));
    }
  }, [response, loadingPost]);

  const handleOrders = () => {
    navigate('/orders', { replace: true });
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/', { replace: true });
  };

  const handleEditProfile = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // Phone validation
    const phoneRegex = /^01\d{9}$/; // starts with 01 and has 11 digits total

    if (!phoneRegex.test(formData.phone) || !phoneRegex.test(formData.phone_2)) {
      auth.toastError('Phone numbers must be 11 digits and start with "01".');
      return;
    }

    const submitData = new FormData();
    submitData.append('f_name', formData.f_name);
    submitData.append('l_name', formData.l_name);
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    submitData.append('phone_2', formData.phone_2);
    // submitData.append('address', formData.address);
    submitData.append('bio', formData.bio);
    if (formData.password) submitData.append('password', formData.password);
    if (formData.image) submitData.append('image', formData.image);

    try {
      await postData(submitData);
      setSuccessMessage(t('Profile Updated Successfully'));
      refetchProfile();
    } catch (error) {
      setErrorMessage(t('Failed to update profile. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 pb-0">
      <TitleSection
        size="5xl"
        text={t('Profile')}
        className="text-center mb-6 sm:mb-8 font-bold text-gray-800"
      />
      {loadingProfileData ? (
        <div className="text-center text-lg sm:text-xl text-gray-600 animate-pulse">
          {t('Loading...')}
        </div>
      ) : (
        <div className="w-full bg-white rounded-2xl shadow-lg p-4 md:p-6 lg:p-10 flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
          {/* Profile Image */}
          <div className="flex items-center justify-center w-full lg:w-5/12">
            <div className="relative w-40 h-40 sm:w-52 sm:h-52 lg:w-80 lg:h-80">
              <img
                src={data?.image_link || '/src/assets/Images/RedLogo.png'}
                className="w-full h-full object-cover object-center rounded-full lg:rounded-2xl border-4 border-mainColor transition-transform duration-300 hover:scale-105"
                alt="Profile"
              />
            </div>
          </div>
          {/* Profile Details */}
          <div className="flex flex-col w-full lg:w-7/12 gap-4 sm:gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-semibold text-gray-700">{t('Name')}:</span>
                <span className="text-lg sm:text-xl text-secoundColor break-words">
                  {data?.name || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-semibold text-gray-700">{t('Email')}:</span>
                <span className="text-lg sm:text-xl text-secoundColor break-words">
                  {data?.email || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-semibold text-gray-700">{t('Phone Number')}:</span>
                <span className="text-lg sm:text-xl text-secoundColor">
                  {data?.phone || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-semibold text-gray-700">{t('Secondary Phone')}:</span>
                <span className="text-lg sm:text-xl text-secoundColor">
                  {data?.phone_2 || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-semibold text-gray-700">{t('Bio')}:</span>
                <span className="text-lg sm:text-xl text-secoundColor max-h-20 overflow-y-auto">
                  {data?.bio || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-semibold text-gray-700">{t("Order's")}:</span>
                <span className="text-lg sm:text-xl text-secoundColor">
                  {data?.orders_count || 0}
                </span>
              </div>
              {/* <div className="flex flex-col sm:col-span-2">
                <span className="text-lg sm:text-xl font-semibold text-gray-700">{t('Address')}:</span>
                <span className="text-lg sm:text-xl text-secoundColor break-words">
                  {data?.address || 'N/A'}
                </span>
              </div> */}
            </div>
            <div className="flex flex-col md:flex-row justify-end gap-3 mt-4">
              <div className='flex gap-3'>
                <SubmitButton
                  text={t('Orders')}
                  handleClick={handleOrders}
                  className="px-2 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                />
                <SubmitButton
                  text={t('Edit')}
                  handleClick={handleEditProfile}
                  className="px-2 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                />
              </div>
              <div>
                <SubmitButton
                  text={t('Logout')}
                  handleClick={handleLogout}
                  className="px-2 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing Profile */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-labelledby="edit-profile-title"
          >
            <h2 id="edit-profile-title" className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
              {t('Edit Profile')}
            </h2>
            {successMessage && (
              <p className="text-green-600 bg-green-100 p-3 rounded-lg mb-4">{successMessage}</p>
            )}
            {errorMessage && (
              <p className="text-red-600 bg-red-100 p-3 rounded-lg mb-4">{errorMessage}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('First Name')}</label>
                <input
                  type="text"
                  name="f_name"
                  value={formData.f_name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-mainColor transition-colors duration-200"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Last Name')}</label>
                <input
                  type="text"
                  name="l_name"
                  value={formData.l_name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-mainColor transition-colors duration-200"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Email')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-mainColor transition-colors duration-200"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Phone')}</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-mainColor transition-colors duration-200"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Secondary Phone')}</label>
                <input
                  type="text"
                  name="phone_2"
                  value={formData.phone_2}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-mainColor transition-colors duration-200"
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Address')}</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-mainColor transition-colors duration-200"
                />
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Bio')}</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-mainColor transition-colors duration-200 resize-y min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Password')}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mainColor focus:border-mainColor transition-colors duration-200"
                  placeholder={t('Leave blank to keep unchanged')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Profile Image')}</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-mainColor file:text-white hover:file:bg-mainColor-dark transition-colors duration-200"
                  accept="image/*"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  aria-label={t('Cancel')}
                >
                  {t('Cancel')}
                </button>
                <SubmitButton
                  text={loadingPost ? t('Updating...') : t('Update')}
                  disabled={loadingPost}
                  className="px-4 py-2 bg-mainColor text-white rounded-lg hover:bg-mainColor-dark transition-colors duration-200 disabled:bg-mainColor-light disabled:cursor-not-allowed"
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;