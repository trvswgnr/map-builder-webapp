// components/Slider.tsx
import { useTheme } from "@/hooks/useTheme";
import { Range, getTrackBackground } from "react-range";

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
  const { theme } = useTheme();
  const trackColors =
    theme === "dark" ? ["#E5E7EB", "#4B5563"] : ["#1F2937", "#d5d9e0"];
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
        renderTrack={({ props, children }) => (
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
        )}
        renderThumb={({ props, isDragged }) => (
          <div
            {...props}
            key={props.key}
            style={props.style}
            className="outline-none"
          >
            <div
              style={{
                transition: "transform 0.1s",
                transform: isDragged
                  ? "scale(1.2) translateY(-5px)"
                  : "scale(1)",
              }}
              className={`h-6 w-6 bg-white flex justify-center items-center border ${
                isDragged ? "border-[#4B5563]" : "border-gray-300"
              }`}
            >
              <div
                className={`h-3 w-1 ${
                  isDragged ? "bg-[#4B5563]" : "bg-gray-300"
                }`}
              />
            </div>
          </div>
        )}
      />
    </div>
  );
}