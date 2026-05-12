import { useState } from 'react';

export function usePagination(pageSize: number = 10) {
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  const handleNext = (nextCursor: string | undefined) => {
    if (nextCursor) {
      setCursorHistory((prev) => [...prev, currentCursor || '']);
      setCurrentCursor(nextCursor);
    }
  };

  const handleBack = () => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const prevCursor = newHistory.pop();
      setCursorHistory(newHistory);
      setCurrentCursor(prevCursor || undefined);
    }
  };

  const resetPagination = () => {
    setCurrentCursor(undefined);
    setCursorHistory([]);
  };

  return {
    currentCursor,
    cursorHistory,
    pageSize,
    handleNext,
    handleBack,
    resetPagination,
    pageNumber: cursorHistory.length + 1,
  };
}
