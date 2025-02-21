import { useMemo, useState, useCallback } from 'react';

export type UseTabsReturn = {
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    onChange: (event: React.SyntheticEvent, newValue: string) => void;
}

export function useTabs(initialValue: string): UseTabsReturn {
    const [value, setValue] = useState<string>(initialValue);

    const onChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    }, []);

    return useMemo(() => ({ value, setValue, onChange }), [value, onChange]);
}
