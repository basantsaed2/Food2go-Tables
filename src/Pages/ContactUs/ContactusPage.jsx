import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import image from '../../assets/Images/contact.png'
import { useTranslation } from 'react-i18next'; // <-- Importing useTranslation hook

const ContactusPage = () => {
                const { t, i18n } = useTranslation(); // <-- use i18n to change language
  const isArabic = i18n.language === 'ar'; // تحقق إذا اللغة الحالية هي العربية

  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [describtion ,setDescribtion]= useState('')
  return (
<div  className="flex flex-col-reverse justify-center min-h-screen px-4 py-4 md:flex-row bg-gray-50 lg:py-10">
 
 {/* Left Section: Contact Form */}
 <div className="flex flex-col w-full p-2 space-y-3 contact-left md:w-1/2">
  <div // <-- هنا يتم تحديد الاتجاه بناءً على اللغة
 className={`mb-3 text-center title  ${!isArabic?"md:text-left":"md:text-right"}`}>
    <h2 className="text-2xl font-extrabold leading-tight text-gray-800 md:text-4xl">
{t("Wearehappytoansweryour")}    </h2>
    <h2 className="text-2xl font-extrabold leading-tight md:text-4xl text-mainColor">
      {t("questionsatanytime")}
    </h2>
    <p className="mt-2 text-lg text-gray-600">
{t("Feelfreetoreachoutwithanyinquiries.We'reheretohelp!")}    </p>
  </div>

  <form className="flex flex-col space-y-3">
    <input 
      type="text" 
      placeholder={t("FullName")}
      className="w-full p-4 transition-all bg-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-mainColor"
    />
    <input 
      type="email" 
      placeholder={t("Email")} 
      className="w-full p-4 transition-all bg-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-mainColor"
    />
    <textarea
      placeholder={t("Message")}
      rows="4"
      className="w-full p-4 transition-all bg-gray-200 rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-mainColor"
    ></textarea>
    
    <Link 
      to={''} 
      className="self-center w-full px-6 py-3 text-lg font-semibold text-center text-white transition-all duration-300 ease-in-out border-2 rounded-lg md:self-start md:w-auto bg-mainColor hover:bg-transparent hover:text-mainColor border-mainColor">
      {t("SendMessage")}
    </Link>
  </form>
</div>

{/* Right Section: Image (Appears first on small screens) */}
<div className="flex items-center justify-center w-full p-2 contact-right md:w-1/2 lg:p-4">
  <div className="relative w-full h-40 overflow-hidden transition-transform duration-300 transform shadow-lg md:w-4/5 md:h-80 rounded-xl hover:scale-105">
    <img 
      src={image} 
      alt="Contact Us" 
      className="object-cover w-full h-full"
    />
  </div>
</div>

</div>
  )
}

export default ContactusPage