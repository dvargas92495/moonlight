import { ChangeEvent, useState } from "react"

export const useInputState = (initialValue: string) => {
    const [value, setValue] = useState(initialValue);
    return {value, setValue: (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
}