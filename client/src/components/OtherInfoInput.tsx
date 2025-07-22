import { Icon } from "@iconify/react";
import CustomButton from "./CustomButton";

const OtherInfoInput = ({
  heading,
  closeModal,
  value,
  setValue,
  placeholder,
  addFunc,
}: {
  heading: string;
  closeModal: Function;
  value: string;
  placeholder: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  addFunc: Function;
}) => {
  const maxChars=60;
  return (
    <div className="w-full h-fit flex flex-col flex-1 rounded-lg bg-whiteBG px-4 py-5 space-y-3">
      <div className="flex items-center justify-between text-darkBg font-medium">
        <div></div>
        <p>{heading}</p>
        <Icon
          onClick={() => closeModal()}
          icon={"material-symbols:close-rounded"}
        />
      </div>

      <div className="flex flex-col py-3 relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0,maxChars))}
          placeholder={placeholder}
          className="w-full p-4 border bg-transparent border-[#E1E1E1] placeholder:text-[#7D7D7D] text-darkBg font-medium rounded-md resize-none"
        ></textarea>
        <p className="text-right absolute bottom-4 right-2 text-[#7D7D7D] text-xs">
          Max {maxChars} chars
        </p>
      </div>

      <div className="flex flex-col space-y-3">
        <CustomButton
          text="Add"
          onClick={() => {
            addFunc();
            closeModal();
          }}
          width="100%"
        />
        <CustomButton
          text="Cancel"
          onClick={() => {
            closeModal();
            setValue("");
          }}
          width="100%"
          type="outlined"
        />
      </div>
    </div>
  );
};

export default OtherInfoInput;
