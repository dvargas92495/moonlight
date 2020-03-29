import React, { useCallback } from "react";
import {
  UploaderComponent,
  FileInfo,
  FilesPropModel,
} from "@syncfusion/ej2-react-inputs";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-react-inputs/styles/material.css";
import { noop } from "lodash";

const FileInput = ({
  browseButtonText,
  url,
  onUploadSuccess,
  onDeleteSuccess = noop,
  files,
}: {
  browseButtonText: string;
  url: string;
  onUploadSuccess: (f: FilesPropModel) => void;
  onDeleteSuccess?: () => void;
  files: FilesPropModel[];
}) => {
  const wrappedUrl = `${process.env.REACT_APP_API_GATEWAY_INVOKE_URL}${url}`;
  const onSuccess = useCallback(
    ({ operation, file }) => {
      if (operation === "remove") {
        onDeleteSuccess();
      } else if (operation === "upload") {
        const { name, type, size }: FileInfo = file;
        const nameWithoutExtension = name.substring(
          0,
          name.length - type.length - 1
        );
        const fullType = `.${type}`;
        onUploadSuccess({ name: nameWithoutExtension, type: fullType, size });
      } else {
        console.log(`Unexpected Success operation: ${operation}`);
      }
    },
    [onUploadSuccess, onDeleteSuccess]
  );
  return (
    <UploaderComponent
      asyncSettings={{
        removeUrl: wrappedUrl,
        saveUrl: wrappedUrl,
      }}
      buttons={{ browse: browseButtonText }}
      success={onSuccess}
      files={files}
    />
  );
};

export default FileInput;
