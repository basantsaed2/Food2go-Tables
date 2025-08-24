import { useEffect, useState } from "react";
import DeleteIcon from "../../../assets/Icons/DeleteIcon";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { InputTextarea } from "primereact/inputtextarea";
import { useDispatch, useSelector } from "react-redux";
import { UpdateProductCard } from "../../../Store/CreateSlices";
import { useTranslation } from "react-i18next"; // <-- Importing useTranslation hook

const Cart = ({
  // id,
  suppId,
  image,
  name,
  count,
  description,
  note,
  productPriceBase,
  productPrice,
  passProductPrice,
  tax,
  discount,
  addons,
  options,
  taxType,
  onDelete,
}) => {
  const [openNote, setOpenNote] = useState(null);
  const [noteDes, setNoteDes] = useState("");

  const items = useSelector((state) => state?.productsCard?.data || []);
  const dispatch = useDispatch();

  const handleOpenNote = (id) => {
    setOpenNote(id);
    setNoteDes("");
  };
  const handleCloseNote = () => {
    setOpenNote(null);
    setNoteDes("");
  };
  const handleAddNote = () => {
    if (!noteDes.trim()) return;

    const targetProduct = items.find((item) => item.numberId === suppId);

    if (targetProduct) {
      const updatedProduct = { ...targetProduct, note: noteDes };
      dispatch(UpdateProductCard(updatedProduct));
    }

    setOpenNote(null);
    setNoteDes("");
  };

  // useEffect(() => {
  //        {
  //               const updatedItems = items.map((item) =>
  //                      item.key === key ? { ...item, note: noteDes } : item
  //               );
  //               // Dispatch an action to update the state with updatedItems
  //               dispatch(UpdateProductCard(updatedItems));
  //        }
  // }, [noteDes])

  // // Calculate Total Food Price
  // const addonsPrice = addons.reduce((acc, addon) => acc + (Number(addon.price) || 0), 0);
  // // Calculate Total Food Price
  // const optionsPrice = options.reduce((acc, option) => acc + (Number(option.price) || 0), 0);

  const { t, i18n } = useTranslation(); // <-- use i18n to change language
  const dirc = i18n.dir();
  return (
    <div
      className="relative flex flex-col md:justify-between md:items-center w-full gap-4 p-4 border-[#848484] border-b-2 md:flex-row"
      key={suppId}
    >
      {/* Cart Image */}
      <div className="relative w-full md:w-3/12 shadow-md rounded-xl">
        <img
          src={image || "/src/assets/Images/RedLogo.jsx"}
          className="object-contain object-center w-full rounded-xl h-[200px]"
          alt="item"
          loading="lazy"
        />
        {/* Favorite Icon */}
        {discount &&
          (discount.type === "precentage" ? (
            <span className="absolute w-full text-center -rotate-45 shadow-md top-6 -left-28 bg-mainBgColor text-mainColor sm:text-xl xl:text-2xl font-TextFontMedium">
              {discount.amount || "0"}%
            </span>
          ) : (
            <span className="absolute w-full text-center -rotate-45 shadow-md top-7 -left-32 bg-mainBgColor text-mainColor sm:text-xl xl:text-2xl font-TextFontMedium">
              {discount.amount || "0"}
              {t("EGP")}
            </span>
          ))}
      </div>

      {/* Cart Details */}
      <div className="flex flex-col w-full md:w-5/12 gap-3">
        <h3 className="text-xl sm:text-2xl font-TextFontMedium text-gray-800">
          {name || "No name available"}
        </h3>
        <p className="text-base sm:text-lg text-gray-600 font-TextFontRegular line-clamp-3">
          {description || "No description available."}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-lg sm:text-xl font-TextFontSemiBold text-mainColor">
            {productPrice} {t("EGP")}
          </span>
          {/* Product Count Display */}
          {count && (
            <span className="px-3 py-1 text-sm font-TextFontMedium bg-gray-200 rounded-full">
              {t("quantity")} : {count}
            </span>
          )}
        </div>
      </div>

      {/* Cart Actions */}
      <div className="h-full flex items-end justify-end w-full md:w-4/12">
        <button
          className="w-full md:absolute md:right-0 md:bottom-10  px-6 py-2 text-white transition-all duration-300 ease-in-out border-2 sm:w-auto sm:text-lg lg:text-xl bg-mainColor rounded-2xl hover:bg-transparent hover:text-mainColor border-mainColor"
          onClick={() => handleOpenNote(suppId)}
        >
          {t("AddNote")}
        </button>
        {openNote === suppId && (
          <Dialog
            open={true}
            onClose={handleCloseNote}
            className="relative z-10"
            aria-labelledby="dialog-title"
          >
            <DialogBackdrop className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen">
                <DialogPanel className="relative bg-white shadow-xl rounded-2xl sm:w-10/12 sm:max-w-lg">
                  <div className="px-4 sm:p-6">
                    <h2
                      id="dialog-title"
                      className="sm:text-2xl xl:text-3xl font-TextFontMedium text-mainColor"
                    >
                      {t("AddYourNote")}
                    </h2>
                    <InputTextarea
                      placeholder="Note ..."
                      rows={4}
                      cols={30}
                      className="w-full p-2 mt-2 text-xl border-2 outline-none border-secoundColor rounded-xl focus:border-mainColor text-secoundColor sm:font-TextFontRegular xl:font-TextFontMedium"
                      unstyled
                      value={note || noteDes}
                      onChange={(e) => setNoteDes(e.target.value)}
                    />
                  </div>
                  <div className="px-4 pb-3 sm:flex sm:flex-row-reverse gap-x-4">
                    <button
                      type="button"
                      onClick={handleCloseNote}
                      className="px-4 py-2 mt-3 text-sm bg-white border-2 rounded-md sm:mt-0 sm:w-auto border-secoundColor font-TextFontMedium text-secoundColor hover:bg-gray-50"
                    >
                      {t("Close")}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNote}
                      className="px-4 py-2 mt-3 text-sm text-white transition-all duration-300 border-2 rounded-md sm:mt-0 sm:w-auto border-mainColor font-TextFontMedium bg-mainColor hover:bg-white hover:text-mainColor"
                    >
                      {t("Add")}
                    </button>
                  </div>
                </DialogPanel>
              </div>
            </div>
          </Dialog>
        )}
      </div>

      {/* Delete Icon */}
      <div
        className={`absolute ${dirc === "rtl" ? "left-0" : "right-0"}  cursor-pointer top-3`}
        onClick={() => onDelete(suppId)}
      >
        <DeleteIcon width={40} height={40} />
      </div>
      {taxType === "excluded" && tax && (
        <div className="absolute right-0 flex items-center px-4 py-1 top-20 rounded-tl-2xl rounded-bl-2xl bg-mainColor ">
          <span className="text-white sm:text-xl lg:text-2xl font-TextFontMedium">
            {t("Tax")}:{" "}
            {tax.type === "precentage" ? `${tax.amount}%` : `${tax.amount} EGP`}
          </span>
        </div>
      )}
    </div>
  );
};

export default Cart;
