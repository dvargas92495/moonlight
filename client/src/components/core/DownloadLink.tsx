import React, { useCallback, useRef, useState } from "react";
import api from "../../hooks/apiClient";
import styled from "styled-components";
import Icon from "./Icon";
import RequestFeedback from "../RequestFeedback";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const onClick = useCallback(() => {
    setLoading(true);
    setError("");
    return api({
      url: href,
      headers: {
        accept: "*/*",
      },
      method: "GET",
    })
      .then((res) => {
        if (aref.current) {
          aref.current.href = `data:${res.headers["content-type"]}; base64, ${res.data}`;
          const contentDispositionParts = res.headers[
            "content-disposition"
          ].split("filename=");
          aref.current.download = contentDispositionParts[1];
          aref.current.click();
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [aref, href]);
  return (
    <div>
      {children}
      <Icon type={"DOWNLOAD"} onClick={onClick} />
      <Downloader ref={aref} href="">
        Download...
      </Downloader>
      <RequestFeedback loading={loading} error={error} />
    </div>
  );
};

export default DownloadLink;
