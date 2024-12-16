import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "./utils";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onValueChange: (value: number) => void;
  className?: string;
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  className,
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      value={[value]}
      onValueChange={(values: number[]) => onValueChange(values[0])}
      max={max}
      min={min}
      step={step}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  );
}
