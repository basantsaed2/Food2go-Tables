const TextInputNew = ({
  value,
  onChange,
  placeholder,
  backgound = "secoundBgColor",
  placeholderSize = false,
  borderColor = "none",
  paddinLeft = "pl-2",
  paddinRight = "pr-2",
  succ
}) => {
  return (
    <>
      <div className="w-full h-12 my-4">
        <input
          type="text"
          value={value}
          onChange={onChange}
          className={`w-full border-[1px] rounded-3xl 
            ${succ ? "" : "border-[#ADADAD]"}
                                   outline-none p-2 py-3  ${paddinLeft} ${paddinRight}
                                   ${placeholderSize ? "text-[16px]" : "text-[20px] "} 
                                   font-TextFontRegular  text-[16px]  lg:text-2xl text-black/70
                                   valueInput`}
          placeholder={placeholder}
        />
      </div>
    </>
  );
};

export default TextInputNew;
