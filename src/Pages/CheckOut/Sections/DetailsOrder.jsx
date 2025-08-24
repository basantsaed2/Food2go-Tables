import { useTranslation } from 'react-i18next';
import { InputTextarea } from 'primereact/inputtextarea';
import React, { useEffect, useState, useRef } from 'react';
import { TimeInput, DropDown } from '../../../Components/Components';
import { useDispatch, useSelector } from 'react-redux';
import { UpdateOrder } from '../../../Store/CreateSlices';
import { useGet } from '../../../Hooks/useGet';

const DetailsOrder = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const { refetch: refetchSchedule, data: dataSchedule } = useGet({
        url: `${apiUrl}/customer/home/schedule_list`,
    });
    const dispatch = useDispatch();
    const order = useSelector(state => state?.order?.data || {});
    const dropdownRef = useRef(null);
    const { t } = useTranslation();

    const getCurrentTime = () => {
        const time = new Date();
        return time.toLocaleTimeString('en-GB', { hour12: false }); // HH:MM:SS
    };

    const [note, setNote] = useState('');
    const [deliveryTime, setDeliveryTime] = useState(getCurrentTime());
    const [scheduleList, setScheduleList] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [openScheduleMenu, setOpenScheduleMenu] = useState(false);
    const [timeMode, setTimeMode] = useState('schedule'); // 'schedule' or 'custom'

    useEffect(() => {
        refetchSchedule();
    }, [refetchSchedule]);

    // useEffect(() => {
    //     if (dataSchedule?.schedule_list) {
    //         setScheduleList(dataSchedule.schedule_list);
    //         const nowOption = dataSchedule.schedule_list.find(item => item.name === 'Now');
    //         if (nowOption) {
    //             setSelectedSchedule(nowOption);
    //             setDeliveryTime(getCurrentTime());
    //             setTimeMode('schedule');
    //         }
    //     }
    // }, [dataSchedule]);

    useEffect(() => {
        if (dataSchedule?.schedule_list) {
            setScheduleList(dataSchedule.schedule_list);
            // Find the "ASAP" option (case-insensitive for robustness)
            const asapOption = dataSchedule.schedule_list.find(
                item => item.name.toLowerCase() === 'asap'
            ) || dataSchedule.schedule_list[0]; // Fallback to first item if "ASAP" not found
            if (asapOption) {
                setSelectedSchedule(asapOption);
                setDeliveryTime(asapOption.name.toLowerCase() === 'asap' ? getCurrentTime() : '');
                setTimeMode('schedule');
            }
        }
    }, [dataSchedule]);

    const handleDeliveryTime = (e) => {
        const newTime = e.target.value;
        setDeliveryTime(newTime);
    };

    const handleSelectSchedule = (schedule) => {
        setSelectedSchedule(schedule);
        if (schedule.name === 'Now') {
            setDeliveryTime(getCurrentTime());
        } else {
            setDeliveryTime('');
        }
    };

    const toggleScheduleMenu = () => {
        setOpenScheduleMenu(!openScheduleMenu);
    };

    const handleTimeModeChange = (mode) => {
        setTimeMode(mode);
        if (mode === 'schedule' && scheduleList.length > 0) {
            const nowOption = scheduleList.find(item => item.name === 'Now') || scheduleList[0];
            setSelectedSchedule(nowOption);
            setDeliveryTime(nowOption.name === 'Now' ? getCurrentTime() : '');
        } else if (mode === 'custom') {
            setSelectedSchedule(null);
            setDeliveryTime('');
        }
    };

    const isValidTime = (time) => {
        return /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(time);
    };

    useEffect(() => {
        const payload = { notes: note };
        let shouldUpdate = order.notes !== note;

        // if (timeMode === 'custom' && deliveryTime && isValidTime(deliveryTime)) {
        //     // Format to HH:MM:SS, matching reference code
        //     const formattedTime = deliveryTime.includes(':') && !deliveryTime.includes(':00')
        //         ? `${deliveryTime}:00`
        //         : deliveryTime;
        //     if (order.date !== formattedTime) {
        //         shouldUpdate = true;
        //         payload.date = formattedTime;
        //         payload.sechedule_slot_id = null;
        //     }
        /*
        // Alternative: Send full datetime if HH:MM:SS fails
        const today = new Date().toISOString().slice(0, 10); // "2025-05-15"
        const formattedTime = `${today} ${deliveryTime.includes(':00') ? deliveryTime : `${deliveryTime}:00`}`; // "2025-05-15 14:30:00"
        if (order.date !== formattedTime) {
            shouldUpdate = true;
            payload.date = formattedTime;
            payload.sechedule_slot_id = null;
        }
        */
        if (timeMode === 'schedule' && selectedSchedule) {
            if (order.sechedule_slot_id !== selectedSchedule.id) {
                shouldUpdate = true;
                payload.sechedule_slot_id = selectedSchedule.id;
                // payload.date = null;
            }
        }

        if (shouldUpdate) {
            dispatch(UpdateOrder(payload));
        }
    }, [note, deliveryTime, selectedSchedule, timeMode, order, dispatch]);

    return (
        <div className='w-full ' >
            <p className="p-3 font-medium text-white text-4x1 bg-mainColor ">Note</p>

            <div className="flex items-start justify-between w-full gap-5 p-3 bg-[#F4F4F4] sm:flex-col xl:flex-row rounded-2xl">
                {/* Delivery Time */}
                <div className="flex flex-col items-start justify-start gap-3 sm:w-full xl:w-6/12">
                    <span className="mb-2 text-3xl text-secoundColor font-TextFontRegular">
                        {t('DeliveryTime')}
                    </span>
                    <div className="flex flex-col w-full gap-4">
                        {/* Radio Buttons */}
                        <div className="flex items-start gap-4 sm:flex-col lg:flex-row">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="timeMode"
                                    value="schedule"
                                    checked={timeMode === 'schedule'}
                                    onChange={() => handleTimeModeChange('schedule')}
                                    className="h-5 w-5 text-mainColor focus:ring-mainColor border-[#1f2937]"
                                />
                                <span className="text-xl text-mainColor font-TextFontRegular">
                                    {t('ChooseSchedule')}
                                </span>
                            </label>

                        </div>

                        {/* Schedule Dropdown */}
                        {timeMode === 'schedule' && (
                            <div className="min-w-[50%] max-w-[70%]">
                                <DropDown
                                    ref={dropdownRef}
                                    handleOpen={toggleScheduleMenu}
                                    handleOpenOption={toggleScheduleMenu}
                                    openMenu={openScheduleMenu}
                                    stateoption={selectedSchedule?.name || t('SelectOption')}
                                    options={scheduleList}
                                    onSelectOption={handleSelectSchedule}
                                    className="w-full p-2 text-xl border-2 outline-none border-[#F4F4F4] rounded-3xl focus:border-mainColor text-[#1f2937] disabled:bg-[#F4F4F4] disabled:cursor-not-allowed sm:font-TextFontRegular xl:font-TextFontMedium"
                                    disabled={timeMode !== 'schedule'}
                                />
                            </div>
                        )}


                    </div>
                </div>
                {/* Order Notes */}
                <div className="flex flex-col items-start justify-start gap-1 sm:w-full xl:w-6/12">
                    <span className="mb-2 text-3xl text-secoundColor font-TextFontRegular">
                        {t('OrderNotes')}
                    </span>
                    <textarea
                        placeholder={t('AddSpecialInstructions')}
                        rows={4}
                        className="w-full max-h-[10rem] p-2 text-xl border-2 outline-none border-[#A9A9A9] rounded-[24px] focus:border-mainColor text-[#1f2937] sm:font-TextFontRegular xl:font-TextFontMedium resize-none overflow-auto"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                </div>


            </div>
        </div>

    );
};

export default DetailsOrder;