import React from 'react';


const DownloadLink = ({ href, children }: {href: string, children: React.ReactNode}) => /*(
    <a href={`${process.env.REACT_APP_API_GATEWAY_INVOKE_URL}${href}`} download>{children}</a>
);*/(
    <span id={href}>{children}</span>
);

export default DownloadLink;