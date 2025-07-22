import { EastOutlined } from "@mui/icons-material";
import backLayer from "../../assets/formBackLayer.png";
import menImg from "../../assets/formIntroMen.png";

const FormSectionIntro = ({ nextForm }: { nextForm: Function }) => {
  return (
    <div
      className={`w-full h-full flex-shrink-0 bg-darkBg flex items-center justify-center relative`}
      // style={{
      //   height: innerHeight,
      // }}
    >
      <div className="w-[80%] flex flex-col items-center">
        <div className="relative">
          <img src={backLayer} alt="back layer image" />
          <div className="w-full flex justify-center absolute bottom-0 left-0">
            <img src={menImg} alt="men image" />
          </div>
        </div>

        <div className="text-center mt-8 space-y-3">
          <h1 className="text-[28px] font-semibold text-white leading-tight">
            Network in an event, The right way
          </h1>

          <p className="text-sm text-[#CFCFCF]">
            Tell us a little about yourself so we can help you connect with
            like-minded attendees in the event.
          </p>
        </div>
      </div>

      <div className="absolute bottom-5 left-0 w-full flex justify-center ">
        <button
          onClick={() => nextForm()}
          className="bg-primary mt-7 px-3 py-3 rounded-md w-[95%]  flex items-center justify-center"
        >
          <div className="flex items-center space-x-2 text-white text-xs font-bold">
            <p>Start networking</p>
            <EastOutlined fontSize="inherit" color="inherit" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default FormSectionIntro;
