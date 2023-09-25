import { SetStateAction, useState } from 'react';

type NotFunction<T> = T extends (...args: unknown[]) => unknown ? never : T;

export type UseStateObjectResult<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends Record<string, NotFunction<any>>
> = [
        Partial<T>,
        {
            set: <K extends keyof T>(
                key: K,
                value: SetStateAction<T[K] | undefined>
            ) => void;
            done: () => void;
            isDirty: boolean;
            hasDirty: <K extends keyof T>(key: K) => boolean;
        }
    ];

export default function useStateObject<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends Record<string, NotFunction<any>>
>(initialState?: Partial<T> | (() => Partial<T>)): UseStateObjectResult<T> {
    const [store, setStore] = useState(() => {
        return {
            original:
                (typeof initialState === 'function' ? initialState() : initialState) ??
                ({} as Partial<T>),
            newAttributes: {} as Partial<T>,
        };
    });

    function set<K extends keyof T>(
        key: K,
        value: SetStateAction<T[K] | undefined>
    ) {
        setStore((old) => {
            const newAttributes = {
                ...old.newAttributes,
            };

            const newValue =
                typeof value === 'function'
                    ? (value as (prevState: T[K] | undefined) => T[K])(
                        newAttributes[key] ?? old.original[key]
                    )
                    : value;

            const attributeIsDirty = newValue !== old.original[key];

            if (attributeIsDirty) {
                newAttributes[key] = newValue;
            } else {
                delete newAttributes[key];
            }

            return {
                original: old.original,
                newAttributes,
            };
        });
    }

    return [
        {
            ...store.original,
            ...store.newAttributes,
        },
        {
            set,
            done: () =>
                setStore((old) => ({
                    original: {
                        ...old.original,
                        ...old.newAttributes,
                    },
                    newAttributes: {},
                })),
            isDirty: Object.keys(store.newAttributes).length > 0,
            // eslint-disable-next-line no-prototype-builtins
            hasDirty: (key) => store.newAttributes.hasOwnProperty(key),
        },
    ];
}

