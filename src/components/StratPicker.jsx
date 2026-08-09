import { ActionIcon, Button, Group, Select, Tooltip } from '@mantine/core';
import { useFileDialog } from '@mantine/hooks';
import { IconTrash, IconUpload } from '@tabler/icons-react';

/**
 * Route selection: the bundled strats, plus anything the runner has uploaded.
 *
 * Uploads are read in the browser and kept in localStorage - nothing is sent
 * anywhere, so a custom route stays private to that machine.
 */
export default function StratPicker({ options, value, onChange, onUpload, onDelete, uploadedIds }) {
  const fileDialog = useFileDialog({
    accept: 'application/json,.json',
    multiple: false,
    // So picking the same filename again still counts as a change.
    resetOnOpen: true,
    onChange: (files) => {
      const file = files?.[0];
      if (file) onUpload(file);
    },
  });

  const canDelete = uploadedIds.includes(value);

  return (
    <Group align="flex-end" gap="xs" wrap="nowrap">
      <Select
        label="Route"
        placeholder="Pick a route"
        data={options}
        value={value}
        onChange={onChange}
        searchable
        style={{ flex: 1 }}
        allowDeselect={false}
      />

      <Button variant="default" leftSection={<IconUpload size={16} />} onClick={fileDialog.open}>
        Upload
      </Button>

      {canDelete && (
        <Tooltip label="Remove this uploaded route from this browser">
          <ActionIcon variant="default" size="lg" color="red" onClick={() => onDelete(value)} aria-label="Remove uploaded route">
            <IconTrash size={16} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}
