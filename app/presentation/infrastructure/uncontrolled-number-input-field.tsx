import { TextField, type TextFieldProps } from '@mui/material';
import { type ChangeEvent, type ChangeEventHandler, type KeyboardEventHandler, useRef } from 'react';

type UncontrolledNumberInputField = Omit<TextFieldProps, 'type' | 'value' | 'defaultValue'> & {
  defaultValue?: string;
}

export function UncontrolledNumberInputField(
  {
    defaultValue = '',
    onChange,
    onKeyDown,
    ...baseProps
  }: UncontrolledNumberInputField
) {
  const lastValidValueRef = useRef(defaultValue);
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event: ChangeEvent<HTMLInputElement>) => {
    const { value: rawValue } = event.currentTarget;

    if (rawValue === '') {
      lastValidValueRef.current = rawValue;
    } else {
      const numberValue = Number(event.currentTarget.value);

      if (isNaN(numberValue) || !Number.isSafeInteger(numberValue) || numberValue < 0) {
        event.currentTarget.value = lastValidValueRef.current;
      } else {
        const prettifiedValue = String(numberValue);

        event.currentTarget.value = prettifiedValue;
        lastValidValueRef.current = prettifiedValue;
      }
    }

    onChange?.(event);
  };

  return (
    <TextField
      {...baseProps}
      type="text"
      defaultValue={defaultValue}
      onChange={handleChange}
      slotProps={{
        ...baseProps.slotProps,
        htmlInput: {
          ...baseProps.slotProps?.htmlInput,
          inputMode: 'numeric',
        }
      }}
    />
  );
}