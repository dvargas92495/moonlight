import React, { useCallback, useRef } from "react";
import { BsDownload } from "react-icons/bs";
import api from "../../hooks/apiClient";
import Button from "./Button";
import styled from "styled-components";

const Downloader = styled.a`
  opacity: 0;
`;

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
        const blob = new Blob([res.data], {
          type: res.headers["content-type"],
        });
        aref.current.href = URL.createObjectURL(blob);
        const contentDispositionParts = res.headers[
          "content-disposition"
        ].split("filename=");
        aref.current.download = contentDispositionParts[1];
        aref.current.click();
      }
    });
  }, [aref, href]);
  return (
    <div>
      {children}
      <Button onClick={onClick}>
        <BsDownload />
      </Button>
      <Downloader ref={aref} href="">
        Download...
      </Downloader>
    </div>
  );
};

export default DownloadLink;
