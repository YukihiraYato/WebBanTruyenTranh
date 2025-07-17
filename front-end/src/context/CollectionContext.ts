import React, { createContext, useContext, useState, ReactNode } from "react";

interface CollectionContextType {
  draggingChild: boolean;
  setDraggingChild: (value: boolean) => void;
  allowSwipe: boolean;
  setAllowSwipe: (value: boolean) => void;
}

export const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const SwipeProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
  const [draggingChild, setDraggingChild] = useState(false);
  const [allowSwipe, setAllowSwipe] = useState(true);

  return (
    React.createElement(CollectionContext.Provider, {
      value: {
        draggingChild: draggingChild,
        setDraggingChild: setDraggingChild,
        allowSwipe: allowSwipe,
        setAllowSwipe: setAllowSwipe,
      }
    }, children)
  );
};

export const useSwipe = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error("useSwipe must be used within a SwipeProvider");
  }
  return context;
};