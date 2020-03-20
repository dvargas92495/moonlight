import React, { useState, useCallback, ReactNode } from "react";
import { DialogComponent } from "@syncfusion/ej2-react-popups";
import styled from "styled-components";

const StyledContainer = styled.div`
  padding-top: 16px;
`;

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
    <StyledContainer>
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
    </StyledContainer>
  );
};

export default Dialog;
