import { useCallback, useRef, useState } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

export function useLongPress({ onLongPress, onClick, delay = 1000 }: UseLongPressOptions) {
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const start = useCallback(() => {
    isLongPress.current = false;
    setIsPressing(true);
    
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
      setIsPressing(false);
    }, delay);
  }, [onLongPress, delay]);

  const end = useCallback(() => {
    setIsPressing(false);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // If it wasn't a long press, treat it as a click
    if (!isLongPress.current && onClick) {
      onClick();
    }
  }, [onClick]);

  const cancel = useCallback(() => {
    setIsPressing(false);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    handlers: {
      onMouseDown: start,
      onMouseUp: end,
      onMouseLeave: cancel,
      onTouchStart: start,
      onTouchEnd: end,
      onTouchMove: cancel,
    },
    isPressing,
  };
}
