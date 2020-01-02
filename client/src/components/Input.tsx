import React, { ChangeEvent } from 'react';

type InputProps = {
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
    hideText?: boolean,
    label?: string,
}

const Input = ({
    onChange,
    hideText = false,
    label,
} : InputProps) => (
    <div>
        {label && <span>{label}</span>}
        <input onChange={onChange} type={hideText ? 'password' : 'text'}/>
    </div>
);

export default Input;