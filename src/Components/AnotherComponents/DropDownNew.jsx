import React, { forwardRef, useState, useEffect, useRef } from "react";
import { IoIosArrowDown } from "react-icons/io";

const DropDownNew = forwardRef(
  (
    {
      iconDirection = false,
      handleOpen,
      stateoption, // This should be the full object
      openMenu,
      handleOpenOption,
      border = true,
      options = [],
      onSelectOption,
      title = "اختر",
    },
    ref
  ) => {
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef();

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          handleOpenOption(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [handleOpenOption]);

    const handleOptionClick = (option) => {
      if (onSelectOption) onSelectOption(option);
      setSearchTerm("");
      handleOpenOption(false);
    };

    // فلترة الخيارات حسب نص البحث
    const filteredOptions = options.filter((option) =>
      (option.name || option.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    // نص القيمة المعروضة داخل input
    const displayValue = openMenu
      ? searchTerm
      : stateoption?.name || stateoption?.title || ""; // This expects stateoption to be an object

    return (
      <div className="relative w-full mx-auto" ref={containerRef}>
        <div
          className={`flex ${
            iconDirection ? "flex-row-reverse" : "flex-row"
          } items-center justify-between w-full h-14 shadow 
                        ${
                          border ? "border-2 border-gray-400" : ""
                        } rounded-[24px] bg-white  border-[1px] border-[#ADADAD] text-[18px] lg:text-2xl text-[#1f2937] px-3`}
          onClick={() => {
            if (!openMenu) handleOpen();
          }}
        >
          <input
            type="text"
            placeholder={title}
            value={displayValue}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!openMenu) handleOpenOption(true);
            }}
            className="w-full bg-transparent outline-none text-[18px] lg:text-2xl placeholder-gray-400"
          />
          <IoIosArrowDown
            className={`${
              openMenu ? "rotate-180" : "rotate-0"
            } text-fourthColor text-2xl transition-transform duration-300 ml-2`}
          />
        </div>

        {openMenu && (
          <div className="absolute z-20 w-full mt-2 overflow-y-auto bg-white  border-[#ADADAD] border-[1px]   sm:top-16 rounded-xl max-h-60">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={`${option.id}-${index}`}
                  className="flex items-center justify-center gap-2 px-2 py-2 text-xl font-medium transition-colors duration-300 text-mainColor hover:cursor-pointer hover:bg-mainColor hover:text-white"
                  onClick={() => handleOptionClick(option)}
                >
                  {option.name || option.title}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-center text-gray-500">
                لا توجد نتائج
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

export default DropDownNew;