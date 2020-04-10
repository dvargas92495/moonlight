import React, { useEffect, useState, useCallback } from "react";
import { useUserId } from "../../hooks/router";
import FileInput, { FileProps } from "./FileInput";
import api from "../../hooks/apiClient";
import defaultProfilePhoto from "../../images/defaultProfilePhoto.jpg";

const PhotoInput = () => {
  const userId = useUserId();
  const [src, setSrc] = useState("");
  const setData = useCallback(
    (data: string, contentType: string) =>
      setSrc(`data:${contentType}; base64, ${data}`),
    [setSrc]
  );
  useEffect(() => {
    api
      .get(`/user/${userId}/photo`)
      .then((res) => setData(res.data, res.headers["content-type"]))
      .catch(() => setSrc(defaultProfilePhoto));
  }, [setData, userId]);
  return (
    <FileInput
      browseButtonText={"Add Photo"}
      url={`/user/${userId}/photo`}
      onUploadSuccess={(f: FileProps) => setData(f.file, f.contentType)}
      accept="image/*"
    >
      {src ? (
        <img src={src} alt={"Failed to load"} width={320} height={320} />
      ) : (
        <div>Loading...</div>
      )}
    </FileInput>
  );
};

export default PhotoInput;
