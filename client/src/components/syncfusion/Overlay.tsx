import React, { useEffect, useCallback, useRef } from "react";
import { Portal } from "react-portal";

// temporary since syncfusion is not actually in react -.-
const isOrphaned = (e: HTMLElement) => {
  let current: HTMLElement | null = e;
  while (current !== document.body) {
    current = current.parentElement;
    if (current == null) {
      return true;
    }
  }
  return false;
};

const Overlay = ({
  isOpen,
  closePortal,
  children,
}: {
  isOpen: true;
  closePortal: () => void;
  children: React.ReactNode;
}) => {
  const portalRef = useRef<any>(null);
  const handleOutsideMouseClick = useCallback(
    (e: MouseEvent) => {
      const root = portalRef.current?.defaultNode;
      if (
        !root ||
        root.contains(e.target) ||
        isOrphaned(e.target as HTMLElement) ||
        (e.button && e.button !== 0)
      ) {
        return;
      }
      closePortal();
    },
    [closePortal]
  );
  useEffect(() => {
    document.addEventListener("click", handleOutsideMouseClick);
    return () => document.removeEventListener("click", handleOutsideMouseClick);
  }, [handleOutsideMouseClick]);
  return isOpen && <Portal ref={portalRef}>{children}</Portal>;
};

export default Overlay;
