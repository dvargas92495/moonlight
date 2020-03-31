import React, { useCallback, useState } from "react";
import {
  UploaderComponent,
  FilesPropModel,
  ProgressEventArgs,
} from "@syncfusion/ej2-react-inputs";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-react-inputs/styles/material.css";
import styled from "styled-components";
import { CONTENT_COLOR } from "../../styles/colors";
import api from "../../hooks/apiClient";
import { BsTrashFill } from "react-icons/bs";

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

const uploaderTemplate = (
  progress: number,
  fileUploading: string,
  onDelete: (name: string) => void
) => ({ name, size }: FilesPropModel) => (
  <FileContainer>
    <FileTopLine>
      <FileContent>{`${name} - ${Math.floor(
        (size || 0) / 1024
      )}KB`}</FileContent>
      <FileDelete onClick={() => onDelete(name || "")} />
    </FileTopLine>
    <div>
      {fileUploading === name ? (
        <progress value={progress} max="100" />
      ) : (
        <>
          <span>{`fileUploading ${fileUploading}`}</span>
          <span>{`name ${name}`}</span>
        </>
      )}
    </div>
  </FileContainer>
);

const FileInput = ({
  browseButtonText,
  url,
  onUploadSuccess,
  onDeleteSuccess,
  files,
}: {
  browseButtonText: string;
  url: string;
  onUploadSuccess: (f: FilesPropModel) => void;
  onDeleteSuccess: (name: string) => void;
  files: FilesPropModel[];
}) => {
  const wrappedUrl = `${process.env.REACT_APP_API_GATEWAY_INVOKE_URL}${url}`;
  const [progress, setProgress] = useState(0);
  const [fileUploading, setFileUploading] = useState("");
  const onSuccess = useCallback(
    ({ operation, file }) => {
      if (operation === "upload") {
        const { name = "", type = "", size }: FilesPropModel = file;
        const nameWithoutExtension = name.substring(
          0,
          name.length - type.length - 1
        );
        const fullType = `.${type}`;
        onUploadSuccess({ name: nameWithoutExtension, type: fullType, size });
        setFileUploading("");
      } else {
        console.log(`Unexpected Success operation: ${operation}`);
      }
    },
    [onUploadSuccess]
  );
  const onDelete = (name: string) =>
    api.delete(`${url}/${name}`).then(() => onDeleteSuccess(name));
  return (
    <UploaderComponent
      asyncSettings={{
        saveUrl: wrappedUrl,
      }}
      buttons={{ browse: browseButtonText }}
      success={onSuccess}
      files={files}
      progress={(data) => {
        const { e, file } = data as ProgressEventArgs;
        const { loaded, total } = e as ProgressEvent;
        setProgress(Math.round((loaded / total) * 100));
        setFileUploading(file?.name || "");
      }}
      template={uploaderTemplate(progress, fileUploading, onDelete)}
    />
  );
};

export default FileInput;
