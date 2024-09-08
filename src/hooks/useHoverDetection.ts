import { useEffect, useState } from "react";

export function useHoverDetection() {
  const [isHoverDevice, setIsHoverDevice] = useState(false);

  useEffect(() => {
    setIsHoverDevice(window.matchMedia("(hover: hover)").matches);
  }, []);

  return { isHoverDevice };
}
