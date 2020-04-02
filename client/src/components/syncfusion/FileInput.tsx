import React, { useCallback, useState, useRef } from "react";
import { BsTrashFill } from "react-icons/bs";
import { map, reject, isEmpty } from "lodash";
import styled from "styled-components";
import { CONTENT_COLOR } from "../../styles/colors";
import api from "../../hooks/apiClient";
import Button from "./Button";

export type FileProps = {
  name: string;
  size: number;
};

const Container = styled.div<{ highlight: boolean }>`
  border: ${(props) =>
    `1px ${props.highlight ? "dashed" : "solid"} ${CONTENT_COLOR}`};
`;

const InputContainer = styled.div`
  padding: 4px;
`;

const InputFileType = styled.input`
  opacity: 0;
  width: 0;
`;

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
  onDelete,
}: {
  item: FileProps;
  onDelete: (name: string) => void;
}) => (
  <FileContainer>
    <FileTopLine>
      <FileContent>{`${name} - ${((size || 0) / 1024).toFixed(
        2
      )}KB`}</FileContent>
      <FileDelete onClick={() => onDelete(name)} />
    </FileTopLine>
  </FileContainer>
);

const FileInput = ({
  browseButtonText,
  url,
  onUploadSuccess,
  onDeleteSuccess,
  initialFiles,
}: {
  browseButtonText: string;
  url: string;
  onUploadSuccess: (f: FileProps) => void;
  onDeleteSuccess: (name: string) => void;
  initialFiles: FileProps[];
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState(initialFiles);
  const [highlight, setHighlight] = useState(false);
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
      api.post(url, data).then((res) => {
        const file = res.data as FileProps;
        onUploadSuccess(file);
        setFiles([...files, file]);
      });
    },
    [onUploadSuccess, files, setFiles, url]
  );
  const onChange = useCallback((e) => handleFiles(e.target.files), [
    handleFiles,
  ]);
  const onDelete = useCallback(
    (name: string) =>
      api.delete(`${url}/${name}`).then(() => {
        onDeleteSuccess(name);
        const rest = reject(files, { name });
        setFiles(rest);
      }),
    [setFiles, onDeleteSuccess, files, url]
  );
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
        />
        {"Or Drop Files Here"}
      </InputContainer>
      <FilesContainer>
        {map(files, (f) => (
          <FileItem key={f.name} item={f} onDelete={onDelete} />
        ))}
      </FilesContainer>
    </Container>
  );
};

export default FileInput;
