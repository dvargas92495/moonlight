import React, { useCallback } from "react";
import DeletionModal from "./DeletionModal";
import { clearAuth } from "../../hooks/apiClient";
import { useHistory } from "react-router-dom";
import { useUserId } from "../../hooks/router";
import styled from "styled-components";

const DeleteUserContainer = styled.div`
  display: flex;
`;

const DeleteUserModal = () => {
  const userId = useUserId();
  const history = useHistory();
  const handleResponse = useCallback(() => {
    clearAuth();
    history.push("/", {
      userId: 0,
    });
  }, [history]);
  return (
    <DeleteUserContainer>
      <DeletionModal
        openModalText={"Delete Account"}
        path={"user"}
        handleResponse={handleResponse}
        id={userId}
      >
        <div>
          Are you sure you want to delete your user account? Note that all data
          associated with the account will be <b>permanently</b> deleted.
        </div>
      </DeletionModal>
    </DeleteUserContainer>
  );
};

export default DeleteUserModal;
