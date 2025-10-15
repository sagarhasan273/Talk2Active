import { useMemo, useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export type UseCounterReturn = {
  value: number;
  maxValue: number;
  onIncrement: () => void;
  onDecrement: () => void;
  setValue: React.Dispatch<React.SetStateAction<number>>;
};

export function useCounter(maxValue: number = 10, defaultValue: number = 0): UseCounterReturn {
  const [value, setValue] = useState(defaultValue);

  const onIncrement = useCallback(() => {
    setValue((prev) => Math.min(prev + 1, maxValue));
  }, [maxValue]);

  const onDecrement = useCallback(() => {
    setValue((prev) => Math.max(prev - 1, 0));
  }, []);

  const memoizedValue = useMemo(
    () => ({
      value,
      maxValue,
      onIncrement,
      onDecrement,
      setValue,
    }),
    [value, maxValue, onIncrement, onDecrement, setValue]
  );

  return memoizedValue;
}
