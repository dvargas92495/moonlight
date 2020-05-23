import React from "react";
import { BsTrashFill } from "react-icons/bs";
import { map } from "lodash";
import styled from "styled-components";
import { CONTENT_COLOR } from "../../styles/colors";
import { useApiDelete } from "../../hooks/apiClient";
import RequestFeedback from "../RequestFeedback";
import FileInput, { FileProps } from "./FileInput";

const FilesContainer = styled.ul`
  padding: 4px;
  margin: 0;
`;

const FileContainer = styled.div`
  padding: 4px;
`;

const FileTopLine = styled.div`
  display: flex;
  justify-content: space-between;
`;

const FileContent = styled.span`
  color: ${CONTENT_COLOR};
`;

const FileDelete = styled(BsTrashFill)`
  color: ${CONTENT_COLOR};
  cursor: pointer;
`;

const FileItem = ({
  item: { name, size },
  patientId,
  onDelete,
}: {
  item: FileProps;
  onDelete: (name: string) => void;
  patientId: number;
}) => {
  const {
    loading,
    error,
    handleSubmit,
  } = useApiDelete(`/patients/${patientId}/form`, () => onDelete(name));
  return (
    <FileContainer>
      <FileTopLine>
        <FileContent>{`${name} - ${((size || 0) / 1024).toFixed(
          2
        )}KB`}</FileContent>
        <RequestFeedback loading={loading} error={error} />
        <FileDelete onClick={() => handleSubmit(name)} />
      </FileTopLine>
    </FileContainer>
  );
};

const PatientFormInput = ({
  patientId,
  onUploadSuccess,
  onDeleteSuccess,
  files,
}: {
  patientId: number;
  onUploadSuccess: (f: FileProps) => void;
  onDeleteSuccess: (name: string) => void;
  files: FileProps[];
}) => (
  <FileInput
    browseButtonText={"Add Patient Form..."}
    url={`patients/${patientId}/form`}
    onUploadSuccess={onUploadSuccess}
  >
    <FilesContainer>
      {map(files, (f) => (
        <FileItem
          key={f.name}
          item={f}
          onDelete={onDeleteSuccess}
          patientId={patientId}
        />
      ))}
    </FilesContainer>
  </FileInput>
);

export default PatientFormInput;
