import React, { useCallback, useState } from 'react';
import { useInputState } from '../hooks';
import { signIn } from '../awsClients/cognitoIdentityServiceProvider';
import Input from './Input';
import PageLink from './PageLink';

type DentistPageProps = {
    globalUuid: string,
    setGlobalUuid: (uuid: string) => void,
};

const DentistPage = ({ globalUuid, setGlobalUuid } : DentistPageProps) => {
    const {value: username, setValue: setUsername} = useInputState('');
    const {value: password, setValue: setPassword} = useInputState('');
    const [error, setError] = useState('');
    const signInCallback = useCallback(() => 
        signIn(username, password)
            .then(({ uuid }) => {
                setError('');
                setGlobalUuid(uuid);
            })
            .catch(e => setError(e.message))
        , [username, password, setError, setGlobalUuid]
    );
    return (
        <>
            <PageLink label='Home' path='/'/>
            {globalUuid ? (
                <div>
                    {`What Service would you like to offer your patients, ${globalUuid}?`}
                </div>
            ) : (
                <>
                    <Input onChange={setUsername} label='Username'/>
                    <Input onChange={setPassword} label='Password' hideText/>
                    <div>
                        <button onClick={signInCallback}>LOG IN</button>
                    </div>
                    {error && (<div>{error}</div>)}
                </>        
            )}
        </>
    );
}

export default DentistPage;