import React, { useCallback, useState, useRef } from "react";
import { isEmpty } from "lodash";
import styled from "styled-components";
import { CONTENT_COLOR } from "../../styles/colors";
import api from "../../hooks/apiClient";
import Button from "./Button";
import RequestFeedback from "../RequestFeedback";

export type FileProps = {
  name: string;
  size: number;
  contentType: string;
  file: string;
};

const Container = styled.div<{ highlight: boolean }>`
  border: ${(props) =>
    `1px ${props.highlight ? "dashed" : "solid"} ${CONTENT_COLOR}`};
`;

const InputContainer = styled.div`
  padding: 4px;
  color: ${CONTENT_COLOR};
`;

const InputFileType = styled.input`
  opacity: 0;
  width: 0;
`;

const FileInput = ({
  browseButtonText,
  url,
  onUploadSuccess,
  accept = "*/*",
  children,
}: {
  browseButtonText: string;
  url: string;
  onUploadSuccess: (f: FileProps) => void;
  accept?: string;
  children: React.ReactNode;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [highlight, setHighlight] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const onClick = useCallback(() => fileInputRef?.current?.click(), [
    fileInputRef,
  ]);
  const handleFiles = useCallback(
    (uploadFiles) => {
      if (isEmpty(uploadFiles)) {
        return;
      }
      const data = new FormData();
      data.append("UploadFiles", uploadFiles[0]);
      setLoading(true);
      setError("");
      api
        .post(url, data)
        .then((res) => {
          const file = res.data as FileProps;
          onUploadSuccess(file);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    },
    [onUploadSuccess, url, setError, setLoading]
  );
  const onChange = useCallback((e) => handleFiles(e.target.files), [
    handleFiles,
  ]);
  const onDragEnter = useCallback(
    (e) => {
      setHighlight(true);
      e.preventDefault();
      e.stopPropagation();
    },
    [setHighlight]
  );
  const onDragLeave = useCallback(
    (e) => {
      setHighlight(false);
      e.preventDefault();
      e.stopPropagation();
    },
    [setHighlight]
  );
  const onDrop = useCallback(
    (e) => {
      onDragLeave(e);
      handleFiles(e.dataTransfer.files);
    },
    [onDragLeave, handleFiles]
  );
  return (
    <Container
      highlight={highlight}
      onDragEnter={onDragEnter}
      onDragOver={onDragEnter}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
    >
      <InputContainer>
        <Button onClick={onClick}>{browseButtonText}</Button>
        <InputFileType
          ref={fileInputRef}
          type="file"
          name="UploadFiles"
          onChange={onChange}
          accept={accept}
        />
        {"Or Drop Files Here"}
        <RequestFeedback loading={loading} error={error} />
      </InputContainer>
      {children}
    </Container>
  );
};

export default FileInput;
