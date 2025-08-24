import React, { useEffect, useRef, useState } from "react";
import {
  DropDown,
  StaticButton,
  StaticSpinner,
  SubmitButton,
  TextInput,
} from "../../../Components/Components";
import TextInputNew from "../../../Components/Inputs/TextInputNew";
import DropDownNew from "../../../Components/AnotherComponents/DropDownNew";
import { usePost } from "../../../Hooks/usePost";
import { useAuth } from "../../../Context/Auth";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet"; // Import Leaflet for marker icon
import { FiHome, FiMapPin } from "react-icons/fi";
import { MdWork } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { useTranslation } from "react-i18next";
import { useGet } from "../../../Hooks/useGet";
import { useDispatch, useSelector } from 'react-redux';
// Fix for default Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Component to handle map click events
const MapClickHandler = ({ setUserLocation, setLocationName, t }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setUserLocation({ lat, lng });
      // Reverse geocode the new location
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
      )
        .then((res) => res.json())
        .then((data) => {
          setLocationName(data.display_name || t("SelectedAddress"));
        })
        .catch((err) => {
          console.error("Error fetching location name", err);
          setLocationName(t("SelectedAddress"));
        });
    },
  });
  return null;
};

const AddNewAddress = ({ update, setUpdate }) => {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const selectedLanguage = useSelector(state => state.language?.selected ?? 'en'); // Default to 'en' if no language is selected
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/customer/address/add`,
  });
  const {
    refetch: refetchLocations,
    loading: loadingLocationsData,
    data: dataLocations,
  } = useGet({
    url: `${apiUrl}/customer/address?locale=${selectedLanguage}`,
    required: true,
  });
  const auth = useAuth();
  const navigate = useNavigate();

  const dropDownZonesRef = useRef();
  const dropDownCitiesRef = useRef();
  const markerRef = useRef(null); // Ref for the marker

  const [cities, setCities] = useState([]);
  const [zones, setZones] = useState([]);
  const [stateZone, setStateZone] = useState();
  const [zoneId, setZoneId] = useState("");
  const [isOpenZone, setIsOpenZone] = useState(false);
  const [stateCity, setStateCity] = useState(null);
  const [cityId, setCityId] = useState("");

  const [isOpenCity, setIsOpenCity] = useState(false);
  const [street, setStreet] = useState("");
  const [buildingNo, setBuildingNo] = useState("");
  const [floorNo, setFloorNo] = useState("");
  const [apartment, setApartment] = useState("");
  const [moreData, setMoreData] = useState("");
  const [addressType, setAddressType] = useState("home");
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState("");

  //
  // Fetch locations on mount
  useEffect(() => {
    refetchLocations();
  }, [refetchLocations]);

  // Update cities and zones based on fetched data and selected city
  useEffect(() => {
    if (dataLocations && dataLocations.cities && dataLocations.zones) {
      setCities([
        // { id: "", name: t("SelectCity") },
        ...dataLocations.cities.map((city) => ({
          id: city.id,
          name: city.name,
        })),
      ]);
      setZones([
        // { id: "", name: t("SelectZone") },
        ...dataLocations.zones
          .filter((zone) => (cityId ? zone.city_id === cityId : true))
          .map((zone) => ({
            id: zone.id,
            name: zone.zone,
          })),
      ]);
    }
  }, [dataLocations, cityId, t]);

  // Attempt to get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
        },
        (error) => {
          console.error("Error fetching location", error);
        }
      );
    }
  }, [t]);

  // Reverse geocode user location to get address name
  useEffect(() => {
    if (userLocation) {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lng}&accept-language=ar`
      )
        .then((res) => res.json())
        .then((data) => {
          setLocationName(data.display_name || t("SelectedAddress"));
        })
        .catch((err) => {
          console.error("Error fetching location name", err);
          setLocationName(t("SelectedAddress"));
        });
    }
  }, [userLocation, t]);

  // Handle marker drag end
  const handleMarkerDragEnd = (e) => {
    const marker = e.target;
    const { lat, lng } = marker.getLatLng();
    setUserLocation({ lat, lng });
    // Reverse geocode the new location
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
    )
      .then((res) => res.json())
      .then((data) => {
        setLocationName(data.display_name || t("SelectedAddress"));
      })
      .catch((err) => {
        console.error("Error fetching location name", err);
        setLocationName(t("SelectedAddress"));
      });
  };

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropDownZonesRef.current &&
        !dropDownZonesRef.current.contains(event.target) &&
        dropDownCitiesRef.current &&
        !dropDownCitiesRef.current.contains(event.target)
      ) {
        setIsOpenZone(false);
        setIsOpenCity(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigate back and refetch locations after successful submission
  useEffect(() => {
    if (!loadingPost && response) {
      navigate(-1); // Navigate back first
    }
  }, [loadingPost, response, navigate]);

  // Reset form fields
  const handleReset = () => {
    setStreet("");
    setBuildingNo("");
    setFloorNo("");
    setApartment("");
    setMoreData("");
    setStateZone(t("SelectZone"));
    setZoneId("");
    setIsOpenZone(false);
    setStateCity(t("SelectCity"));
    setCityId("");
    setIsOpenCity(false);
    setAddressType("home");
    setLocationName("");
    setUserLocation(null); // Reset location
  };

  // Handle form submission
  const handleZoneAdd = (e) => {
    e.preventDefault();

    if (!locationName) {
      auth.toastError(t("Please Enter Location"));
      return;
    }
    if (!street) {
      auth.toastError(t("Please Enter Street Name"));
      return;
    }
    if (!buildingNo) {
      auth.toastError(t("Please Enter Building Number"));
      return;
    }
    if (!floorNo) {
      auth.toastError(t("Please Enter Floor Number"));
      return;
    }
    if (!zoneId) {
      auth.toastError(t("Please Select Zone"));
      return;
    }
    if (!addressType) {
      auth.toastError(t("Please select address type: Home, Work, or Other"));
      return;
    }

    const formData = new FormData();
    formData.append("address", locationName);
    formData.append("zone_id", zoneId);
    formData.append("street", street);
    formData.append("building_num", buildingNo);
    formData.append("floor_num", floorNo);
    formData.append("apartment", apartment);
    formData.append("additional_data", moreData);
    formData.append("type", addressType);
    formData.append("city_id", cityId);
    if (userLocation) {
      formData.append("latitude", userLocation.lat);
      formData.append("longitude", userLocation.lng);
    }

    postData(formData, "Address Added Success");
  };

  // Dropdown handlers
  const handleOpenZones = () => setIsOpenZone(!isOpenZone);
  const handleOpenOptionZone = () => setIsOpenZone(false);
  const handleSelectZone = (option) => {
    setZoneId(option.id);
    setStateZone(option);
  };

  const handleOpenCity = () => setIsOpenCity(!isOpenCity);
  const handleOpenOptionCity = () => setIsOpenCity(false);
  const handleSelectCity = (option) => {
    setCityId(option.id);
    setStateCity(option);
    setZoneId(""); // Reset zone when city changes
    setStateZone(t("SelectZone"));
  };

  return (
    <div>
      {loadingPost || loadingLocationsData ? (
        <div className="flex items-center justify-center w-full h-56">
          <StaticSpinner />
        </div>
      ) : (
        <section className="px-1 mb-5 py-10 lg:px-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <IoIosArrowBack
              className="transition-transform duration-200 cursor-pointer text-mainColor hover:scale-110"
              size={28}
              onClick={() => navigate(-1)}
            />
            <h1 className="text-2xl font-semibold sm:text-3xl text-mainColor">
              {t("AddAddress")}
            </h1>
          </div>
          {/* Form */}
          <form onSubmit={handleZoneAdd}>
            <div className="flex flex-col gap-10 px-5 py-5 h-125 lg:flex-row lg:h-screen">
              {/* Map Section or Manual Location Input */}
              {userLocation ? (
                <div className="w-full lg:w-1/2 p-4 h-[300px] sm:h-[400px] md:h-[500px] lg:h-full">
                  <MapContainer
                    center={userLocation}
                    zoom={13}
                    style={{
                      height: "100%",
                      width: "100%",
                      zIndex: 10,
                    }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker
                      position={userLocation}
                      draggable={true}
                      ref={markerRef}
                      eventHandlers={{
                        dragend: handleMarkerDragEnd,
                      }}
                    />
                    <MapClickHandler
                      setUserLocation={setUserLocation}
                      setLocationName={setLocationName}
                      t={t}
                    />
                  </MapContainer>

                  <div className="my-5">
                    <TextInputNew
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder={t("Enteryourlocationmanually")}
                      className="w-full"
                      succ
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex flex-col items-start w-full my-2 gap-y-1">
                    <span className="text-xl font-TextFontRegular text-fourthColor">
                      {t("Address")} :
                    </span>
                    <TextInputNew
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder={t("Enteryourlocationmanually")}
                      succ
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center justify-center w-full px-2 mx-auto mt-5 lg:px-10 lg:w-1/2">
                {/* Address Type Tabs */}
                <div className="flex items-center w-full gap-4 my-4 justify-evenly">
                  <div
                    onClick={() => setAddressType("home")}
                    className={`flex justify-center gap-1 items-center cursor-pointer w-[140px] h-[56px] transition-colors duration-300 px-4 py-2 rounded-full
                    ${addressType === "home"
                        ? "bg-mainColor text-white"
                        : "bg-white text-mainColor border border-mainColor hover:bg-mainColor hover:text-white"
                      }`}
                  >
                    {/* <FiHome className="w-6 h-6 md:w-8 md:h-8" /> */}
                    <span className="mt-1 text-lg">{t("Home")}</span>
                  </div>
                  <div
                    onClick={() => setAddressType("work")}
                    className={`flex justify-center gap-1 items-center cursor-pointer   w-[140px] h-[56px]transition-colors duration-300 px-4 py-2 rounded-full
                    ${addressType === "work"
                        ? "bg-mainColor text-white"
                        : "bg-white text-mainColor border border-mainColor hover:bg-mainColor hover:text-white"
                      }`}
                  >
                    {/* <MdWork className="w-6 h-6 md:w-8 md:h-8" /> */}
                    <span className="mt-1 text-lg">{t("Work")}</span>
                  </div>
                  <div
                    onClick={() => setAddressType("other")}
                    className={`flex justify-center gap-1 items-center cursor-pointer  w-[140px] h-[56px] transition-colors duration-300 px-4 py-2 rounded-full
                    ${addressType === "other"
                        ? "bg-mainColor text-white"
                        : "bg-white text-mainColor border border-mainColor hover:bg-mainColor hover:text-white"
                      }`}
                  >
                    {/* <FiMapPin className="w-6 h-6 md:w-8 md:h-8" /> */}
                    <span className="mt-1 text-lg">{t("Other")}</span>
                  </div>
                </div>

                <span className=" my-5  pl-4  w-full text-[#474851] text-[32px] font-normal ">
                  {" "}
                  {t("AddNewAddress")}
                </span>

                {/* Input Fields */}
                <div className="flex flex-wrap items-center justify-start w-full py-4 gap- ">
                  {/* Select City */}
                  <div className="flex flex-col items-start sm:w-full gap-y-1">
                    <span className="text-xl font-TextFontRegular text-fourthColor">
                      {/* {t("City")}: */}
                    </span>
                    <DropDownNew
                      ref={dropDownCitiesRef}
                      handleOpen={handleOpenCity}
                      stateoption={stateCity}
                      openMenu={isOpenCity}
                      handleOpenOption={handleOpenOptionCity}
                      onSelectOption={handleSelectCity}
                      options={cities}
                      title={t("Select City")}
                      border={false}
                    />

                  </div>
                  {/* Select Zone */}
                  <div className="flex flex-col items-start my-4 sm:w-full gap-y-4">
                    <span className="text-xl font-TextFontRegular text-fourthColor">
                      {/* {t("Zones")}: */}
                    </span>
                    <DropDownNew
                      ref={dropDownZonesRef}
                      handleOpen={handleOpenZones}
                      stateoption={stateZone}
                      openMenu={isOpenZone}
                      handleOpenOption={handleOpenOptionZone}
                      onSelectOption={handleSelectZone}
                      options={zones}
                      border={false}
                      title={t("Select Zone")}

                    />
                  </div>
                  {/* Street Name */}
                  <div className="flex flex-col items-start sm:w-full gap-y-1">
                    <span className="text-xl font-TextFontRegular text-black/20">
                      {/* {t("StreetName")}: */}
                    </span>
                    <TextInputNew
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder={t("EnterStreetName")}
                    />
                  </div>
                  {/* Building Number */}
                  <div className="flex flex-col items-start sm:w-full gap-y-1">
                    <span className="text-xl font-TextFontRegular text-fourthColor">
                      {/* {t("BuildingNumber")}: */}
                    </span>
                    <TextInputNew
                      value={buildingNo}
                      onChange={(e) => setBuildingNo(e.target.value)}
                      placeholder={t("EnterBuildingNumber")}
                    />
                  </div>
                  <div className="flex gap-2">
                    {/* Floor Number */}
                    <div className="flex flex-col items-start sm:w-full gap-y-1">
                      <span className="text-xl font-TextFontRegular text-fourthColor">
                        {/* {t("FloorNumber")}: */}
                      </span>
                      <TextInputNew
                        value={floorNo}
                        onChange={(e) => setFloorNo(e.target.value)}
                        placeholder={t("EnterFloorNumber")}
                      />
                    </div>
                    {/* Apartment */}
                    <div className="flex flex-col items-start sm:w-full gap-y-1">
                      <span className="text-xl font-TextFontRegular text-fourthColor">
                        {/* {t("Apartment")}: */}
                      </span>
                      <TextInputNew
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder={t("Apartment")}
                      />
                    </div>
                  </div>

                  {/* Additional Data */}
                  <div className="flex flex-col items-start sm:w-full gap-y-1">
                    <span className="text-xl font-TextFontRegular text-fourthColor">
                      {/* {t("AdditionalData")}: */}
                    </span>
                    <TextInputNew
                      value={moreData}
                      onChange={(e) => setMoreData(e.target.value)}
                      placeholder={t("EnterAdditionalData")}
                    />
                  </div>
                </div>
                {/* Buttons */}
                <div className="flex items-center justify-end w-full gap-x-4">
                  <StaticButton
                    text={t("Reset")}
                    handleClick={handleReset}
                    bgColor="bg-transparent"
                    Color="text-mainColor"
                    border="border-2"
                    borderColor="border-mainColor"
                    rounded="rounded-full"
                  />
                  <SubmitButton
                    text={t("Submit")}
                    rounded="rounded-full"
                    handleClick={handleZoneAdd}
                  />
                </div>
              </div>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default AddNewAddress;
