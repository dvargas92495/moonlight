import React, { ReactNode } from "react";
import BaseModal, { BaseModalProps } from "./BaseModal";
import Form, { Field } from "./Form";

const FormModal = React.forwardRef<
  HTMLDivElement,
  {
    path: string;
    handleResponse: (response: any) => void;
    children: ReactNode;
    fields: Field[];
  } & BaseModalProps
>(({ path, handleResponse, children, fields, ...rest }, ref) => (
  <BaseModal {...rest}>
    {(closeModal) => (
      <div ref={ref}>
        {children}
        <Form
          fields={fields}
          path={path}
          handleResponse={(response) => {
            handleResponse(response);
            closeModal();
          }}
        />
      </div>
    )}
  </BaseModal>
));

export default FormModal;
