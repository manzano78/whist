
import { Autocomplete, createFilterOptions, TextField } from '@mui/material';
import { useState } from 'react';

const filter = createFilterOptions<PlayerOptionType>();

interface PlayerInputProps {
  index: number;
  existingPlayers: string[];
  defaultPlayer?: string;
}

export function PlayerInput({ existingPlayers, defaultPlayer, index }: PlayerInputProps) {
  const [value, setValue] = useState<PlayerOptionType | null>(() => defaultPlayer ? ({ name: defaultPlayer }) : null);
  const options = existingPlayers.map((player): PlayerOptionType => ({ name: player }));

  return (
    <Autocomplete
      value={value}
      color="red"
      onChange={(_, newValue) => {
        if (typeof newValue === 'string') {
          setValue({
            name: newValue,
          });
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          setValue({
            name: newValue.inputValue,
          });
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some((option) => inputValue === option.name);
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            inputValue,
            name: `Ajouter « ${inputValue} »`,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={options}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.name;
      }}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            {option.name}
          </li>
        );
      }}
      sx={{ width: 300 }}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} required label={`Joueur ${index}${index === 1 ? ' (qui distribuera le premier)' : ''}`} name="player" />
      )}
    />
  );
}

interface PlayerOptionType {
  inputValue?: string;
  name: string;
}
