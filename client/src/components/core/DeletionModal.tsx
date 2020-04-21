import React, { ReactNode } from "react";
import Button from "./Button";
import { useApiDelete } from "../../hooks/apiClient";
import RequestFeedback from "../RequestFeedback";
import BaseModal, { BaseModalProps } from "./BaseModal";

const DeletionModal = ({
  path,
  id,
  handleResponse,
  children,
  ...rest
}: {
  path: string;
  id: number;
  handleResponse: () => void;
  children: ReactNode;
} & BaseModalProps) => {
  const { loading, error, handleSubmit } = useApiDelete(path, handleResponse);
  return (
    <BaseModal {...rest}>
      {(closeModal) => (
        <>
          {children}
          <Button isPrimary onClick={() => handleSubmit(id).then(closeModal)}>
            Submit
          </Button>
          <RequestFeedback loading={loading} error={error} />
        </>
      )}
    </BaseModal>
  );
};

export default DeletionModal;
