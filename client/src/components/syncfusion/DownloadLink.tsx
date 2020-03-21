import React from 'react';


const DownloadLink = ({ href, children }: {href: string, children: React.ReactNode}) => (
    <a href={`${process.env.REACT_APP_API_GATEWAY_INVOKE_URL}${href}`} download>{children}</a>
);
/*
const DownloadLink = ({ href, children }: {href: string, children: React.ReactNode}) => {
    getFile() and then ^?
return (
    <div>
        <span>{children}</span> 
        <button className="e-icons e-download"/>
    </div>
);
}
*/

export default DownloadLink;