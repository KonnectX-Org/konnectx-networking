import "./loading.css";

const LoadingComp = ({ color = "#424de4" }: { color?: string }) => {
  return (
    <div
      className="load"
      style={{
        borderColor: color,
        borderBottomColor: "transparent",
        borderRightColor: "transparent",
      }}
    ></div>
  );
};

export default LoadingComp;
