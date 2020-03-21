import React from 'react';
import { UploaderComponent } from '@syncfusion/ej2-react-inputs';
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-react-inputs/styles/material.css";
import { map } from 'lodash';

const FileInput = ({
    browseButtonText,
    files,
    url
} : {
    browseButtonText: string,
    files: string[],
    url: string
}) => {
  const wrappedUrl = `${process.env.REACT_APP_API_GATEWAY_INVOKE_URL}${url}`
  return (
    <UploaderComponent 
      asyncSettings={{
        removeUrl: wrappedUrl,
        saveUrl: wrappedUrl,
      }}
      buttons={{ browse: browseButtonText }}
      files={map(files, name => ({ name, size: 0 }))} 
    />
);
}

export default FileInput;