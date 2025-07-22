const CustomButton = ({
  text,
  onClick,
  width = "85%",
  type = "filled",
  bgColor = "#242424",
  opacity = "100%",
}: {
  text: string;
  onClick: Function;
  width?: string;
  type?: "outlined" | "filled";
  bgColor?: string;
  opacity?: string;
}) => {
  return (
    <button
      onClick={(e) => onClick(e)}
      className={`h-fit py-2 rounded-lg font-medium`}
      style={{
        width,
        backgroundColor: type == "filled" ? bgColor : "transparent",
        color: type == "filled" ? "#fff" : bgColor,
        border: type == "filled" ? "none" : `1px solid ${bgColor}`,
        opacity,
      }}
    >
      {text}
    </button>
  );
};

export default CustomButton;
