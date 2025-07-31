import CircularProgress from "@mui/joy/CircularProgress";
import { Info } from "lucide-react";
import { useState } from "react";

interface InfoProfileIncompleteProps {
  className?: string;
  percentage: number;
}
const InfoProfileIncomplete = ({
  className,
  percentage,
}: InfoProfileIncompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`relative ${className}`}>
      <Info
        size={16}
        color={"#3A7CFF"}
        className="cursor-pointer"
        onClick={() => setIsOpen(true)}
      />
      {isOpen && (
        <div className="absolute top-5 left-0 z-40 p-2 bg-white border rounded shadow-lg">
          <CircularProgress determinate value={percentage} thickness={2}>
            {percentage}%
          </CircularProgress>
        </div>
      )}
      {isOpen && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-30 bg-black opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default InfoProfileIncomplete;
