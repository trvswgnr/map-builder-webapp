// components/Slider.tsx
import { useTheme } from "@/hooks/useTheme";
import { Range, getTrackBackground } from "react-range";
import { IRenderThumbParams, IRenderTrackParams } from "react-range/lib/types";

interface SliderProps {
  values: number[];
  min: number;
  max: number;
  step: number;
  label: string;
  onChange: (values: number[]) => void;
  onFinalChange: (values: number[]) => void;
}

export function Slider({
  values,
  min,
  max,
  step,
  label,
  onChange,
  onFinalChange,
}: SliderProps) {
  return (
    <div className="flex justify-center flex-wrap">
      <Range
        label={label}
        values={values}
        step={step}
        min={min}
        max={max}
        rtl={false}
        onChange={onChange}
        onFinalChange={onFinalChange}
        renderTrack={(params) => (
          <Track
            {...params}
            values={values}
            min={min}
            max={max}
          />
        )}
        renderThumb={Thumb}
      />
    </div>
  );
}

interface TrackParams extends IRenderTrackParams {
  values: number[];
  min: number;
  max: number;
}

function Track({ props, children, values, min, max }: TrackParams) {
  const { theme } = useTheme();
  const trackColors =
    theme === "dark" ? ["#E5E7EB", "#4B5563"] : ["#1F2937", "#d5d9e0"];
  return (
    <div
      onMouseDown={props.onMouseDown}
      onTouchStart={props.onTouchStart}
      style={{
        ...props.style,
        height: "36px",
        display: "flex",
        width: "100%",
      }}
    >
      <div
        ref={props.ref}
        className="h-1 w-full"
        style={{
          background: getTrackBackground({
            values,
            colors: trackColors,
            min,
            max,
            rtl: false,
          }),
          alignSelf: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Thumb({ props, isDragged }: IRenderThumbParams): React.ReactNode {
  return (
    <div
      {...props}
      key={props.key}
      style={props.style}
      className="outline-none"
    >
      <div
        style={{
          transition: "transform 0.1s",
          transform: isDragged ? "scale(1.2) translateY(-5px)" : "scale(1)",
        }}
        className={`h-6 w-6 bg-white flex justify-center items-center border ${
          isDragged ? "border-ring" : "border-gray-300"
        }`}
      >
        <div
          className={`h-3 w-1 bg-[#4B5563]`}
        />
      </div>
    </div>
  );
}
