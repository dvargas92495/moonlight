import React, { useState, useCallback, ReactNode } from "react";
import { DialogComponent } from "@syncfusion/ej2-react-popups";

const Dialog = ({
  openText,
  children
}: {
  openText: string;
  children: (close: () => void) => ReactNode;
}) => {
  const [visible, setVisible] = useState(false);
  const close = useCallback(() => setVisible(false), [setVisible]);
  return (
    <div>
      <button className="e-btn e-primary" onClick={() => setVisible(!visible)}>
        {openText}
      </button>
      <DialogComponent
        width="400px"
        visible={visible}
        close={close}
        overlayClick={close}
        isModal={true}
      >
        {children(close)}
      </DialogComponent>
    </div>
  );
};

export default Dialog;
