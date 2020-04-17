import React, { useEffect, useCallback, useRef, RefObject } from "react";
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

const OverlayPortal = ({
  closePortal,
  parent,
  children,
}: {
  closePortal: () => void;
  parent?: RefObject<Element>;
  children: React.ReactNode;
}) => {
  const portalRef = useRef<any>(null);
  const handleOutsideMouseClick = useCallback(
    (e: MouseEvent) => {
      const root = parent?.current;
      const target = e.target as HTMLElement;
      if (
        !root ||
        root.contains(target) ||
        isOrphaned(target) ||
        portalRef?.current?.defaultNode.contains(target) ||
        (e.button && e.button !== 0)
      ) {
        return;
      }
      closePortal();
    },
    [closePortal, portalRef, parent]
  );
  useEffect(() => {
    document.addEventListener("click", handleOutsideMouseClick);
    return () => document.removeEventListener("click", handleOutsideMouseClick);
  }, [handleOutsideMouseClick]);
  return <Portal ref={portalRef}>{children}</Portal>;
};

const Overlay = ({
  isOpen,
  closePortal,
  parent,
  children,
}: {
  isOpen: boolean;
  closePortal: () => void;
  parent?: RefObject<Element>;
  children: React.ReactNode;
}) => {
  return isOpen ? (
    <OverlayPortal closePortal={closePortal} parent={parent}>
      {children}
    </OverlayPortal>
  ) : (
    <></>
  );
};

export default Overlay;
