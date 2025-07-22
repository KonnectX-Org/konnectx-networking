const SplashScreen = () => {
  return (
    <div
      className="w-full bg-primary  flex items-center justify-center absolute top-0 left-0 z-50"
      style={{
        height: innerHeight,
      }}
    >
      <p className="text-3xl text-center font-extrabold text-white">
        Network Like a
        <br />
        <span className=" text-4xl">PRO</span>
      </p>

      <div className="text-white absolute bottom-8 text-center text-[10px] font-light">
        <p>All rights reserved @ Creative Upaay</p>
        <p>(Brand owned by Cinnovate Solutions (OPC) Pvt Ltd)</p>
      </div>
    </div>
  );
};

export default SplashScreen;
