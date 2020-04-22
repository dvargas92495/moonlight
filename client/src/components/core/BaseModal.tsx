import React, { useState, useCallback, ReactNode } from "react";
import Modal from "react-modal";
import Button from "./Button";
import {
  PRIMARY_BACKGROUND_COLOR,
  THREE_QUARTER_OPAQUE,
  CONTENT_COLOR,
  SECONDARY_BACKGROUND_COLOR,
} from "../../styles/colors";
import { ROOT } from "../../hooks/constants";

export type BaseModalProps = {
  openModalText: string;
};

const BaseModal = ({
  openModalText,
  children,
}: BaseModalProps & { children: (closeModal: () => void) => ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = useCallback(() => setIsOpen(true), [setIsOpen]);
  const closeModal = useCallback(() => setIsOpen(false), [setIsOpen]);
  return (
    <>
      <Button onClick={openModal}>{openModalText}</Button>
      <Modal
        isOpen={isOpen}
        style={{
          overlay: {
            backgroundColor: `${PRIMARY_BACKGROUND_COLOR}${THREE_QUARTER_OPAQUE}`,
          },
          content: {
            position: "absolute",
            top: "35%",
            left: "35%",
            bottom: undefined,
            right: undefined,
            border: `1px solid ${CONTENT_COLOR}`,
            background: SECONDARY_BACKGROUND_COLOR,
            color: CONTENT_COLOR,
            borderRadius: "4px",
            outline: "none",
            padding: "16px",
            minWidth: "320px",
            minHeight: "120px",
          },
        }}
        appElement={document.querySelector(`#${ROOT}`) as HTMLElement}
      >
        {children(closeModal)}
        <Button isPrimary onClick={closeModal}>
          Cancel
        </Button>
      </Modal>
    </>
  );
};

export default BaseModal;
