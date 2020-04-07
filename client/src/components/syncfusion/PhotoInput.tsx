import React, { useEffect, useState } from "react";
import { useUserId } from "../../hooks/router";
import FileInput, { FileProps } from "./FileInput";
import api from "../../hooks/apiClient";
import defaultProfilePhoto from "../../images/defaultProfilePhoto.jpg";

const PhotoInput = () => {
  const userId = useUserId();
  const [src, setSrc] = useState("");
  useEffect(() => {
    api
      .get(`/user/${userId}/photo`)
      .then((res) => {
        const blob = new Blob([res.data], {
          type: res.headers["content-type"],
        });
        setSrc(URL.createObjectURL(blob));
      })
      .catch(() => setSrc(defaultProfilePhoto));
  }, [setSrc, userId]);
  return (
    <FileInput
      browseButtonText={"Add Photo"}
      url={`/user/${userId}/photo`}
      onUploadSuccess={(f: FileProps) => {}}
      accept="image/*"
    >
      {src ? <img src={src} alt={"Failed to load"} /> : <div>Loading...</div>}
    </FileInput>
  );
};

export default PhotoInput;
