import React, { useState, useCallback, ReactNode } from "react";
import { DialogComponent } from "@syncfusion/ej2-react-popups";

const Dialog = ({
  openText,
  children
}: {
  openText: string;
  children: ReactNode;
}) => {
  const [visible, setVisible] = useState(false);
  const close = useCallback(() => setVisible(false), [setVisible]);
  return (
    <div>
      <button className="e-btn e-primary" onClick={() => setVisible(!visible)}>
        {openText}
      </button>
      <DialogComponent
        width="250px"
        visible={visible}
        close={close}
        overlayClick={close}
        isModal={true}
      >
        {children}
      </DialogComponent>
    </div>
  );
};

export default Dialog;
