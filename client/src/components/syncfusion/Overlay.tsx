import React, { useEffect, useCallback, useRef, RefObject } from "react";
import { Portal } from "react-portal";
import { some } from "lodash";

const OverlayPortal = ({
  closePortal,
  parents = [],
  children,
}: {
  closePortal: () => void;
  parents?: RefObject<Element>[];
  children: React.ReactNode;
}) => {
  const portalRef = useRef<any>(null);
  const handleOutsideMouseClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        some(parents, (p) => p?.current?.contains(target)) ||
        portalRef?.current?.defaultNode.contains(target) ||
        (e.button && e.button !== 0)
      ) {
        return;
      }
      closePortal();
    },
    [closePortal, portalRef, parents]
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
  parents,
  children,
}: {
  isOpen: boolean;
  closePortal: () => void;
  parents?: RefObject<Element>[];
  children: React.ReactNode;
}) => {
  return isOpen ? (
    <OverlayPortal closePortal={closePortal} parents={parents}>
      {children}
    </OverlayPortal>
  ) : (
    <></>
  );
};

export default Overlay;
