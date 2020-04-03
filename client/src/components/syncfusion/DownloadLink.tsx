import React, { useCallback, useRef } from "react";
import { BsDownload } from "react-icons/bs";
import api from "../../hooks/apiClient";
import Button from "./Button";

const DownloadLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const aref = useRef<HTMLAnchorElement>(null);
  const onClick = useCallback(() => {
    return api({
      url: href,
      headers: {
        accept: "*/*",
      },
      method: "GET",
    }).then((res) => {
      if (aref.current) {
        aref.current.href = `data:${res.headers["content-type"]};base64, ${btoa(
          encodeURI(res.data)
        )}`;
        const contentDispositionParts = res.headers[
          "content-disposition"
        ].split("filename=");
        aref.current.download = contentDispositionParts[1];
        aref.current.click();
      }
    });
  }, [aref]);
  return (
    <div>
      {children}
      <Button onClick={onClick}>
        <BsDownload />
      </Button>
      <a ref={aref}></a>
    </div>
  );
};

export default DownloadLink;
