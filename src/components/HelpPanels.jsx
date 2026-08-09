import { Accordion, Code, List, Text } from '@mantine/core';

const EXAMPLE = `{
  "name": "My route",
  "pages": [
    {
      "label": "Fire Cavern",
      "target": "quistis",
      "base": 189,
      "groups": [
        {
          "label": "Ifrit",
          "fields": [
            { "label": "Squall attacks", "each": 2 },
            { "label": "Limits", "each": 1 },
            { "label": "Camera", "choose": [
              { "label": "1 character", "value": 2 },
              { "label": "2 characters", "value": 3 }
            ]}
          ]
        }
      ]
    }
  ]
}`;

const BRANCHING = `"toggles": [
  { "id": "redSoldier", "label": "Fought the red soldier", "default": false },
  { "id": "branch", "label": "Cavern fight", "default": "buel",
    "choose": [
      { "value": "buel", "label": "Buel" },
      { "value": "redBat", "label": "2x Red Bats" }
    ]}
],
"pages": [{
  "label": "Dollet", "target": "zell", "base": 0,
  "groups": [
    { "label": "Buel", "when": { "toggle": "branch", "is": "buel" },
      "fields": [{ "label": "Base", "fixed": 11 }] },
    { "label": "Red soldier", "when": { "toggle": "redSoldier", "is": true },
      "fields": [{ "label": "Base", "fixed": 13 }] }
  ]
}]`;

export default function HelpPanels() {
  return (
    <Accordion variant="contained">
      <Accordion.Item value="how-to">
        <Accordion.Control>How to use this tool</Accordion.Control>
        <Accordion.Panel>
          <List type="ordered" size="sm" spacing="xs">
            <List.Item>Pick the route you&apos;re running, or upload your own strat file.</List.Item>
            <List.Item>
              As you play, log what happened in each fight - every physical attack, limit, and camera angle moves the
              RNG.
            </List.Item>
            <List.Item>
              The counts update as you go. When you reach a card battle, the panel tells you whether to mash straight
              away or how long to wait.
            </List.Item>
            <List.Item>
              If something happened the route didn&apos;t plan for, put the difference in the offset box rather than
              fighting the form.
            </List.Item>
          </List>
          <Text size="sm" mt="md">
            Your progress and any uploaded routes are kept in this browser only - nothing is uploaded anywhere.
          </Text>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="format">
        <Accordion.Control>Writing your own strat file</Accordion.Control>
        <Accordion.Panel>
          <Text size="sm" mb="sm">
            Files from the Card_Manip tool work as-is. For a route of your own there&apos;s a shorter format:
          </Text>
          <Code block>{EXAMPLE}</Code>

          <Text size="sm" fw={600} mt="md" mb={4}>
            Fields
          </Text>
          <List size="sm" spacing={4}>
            <List.Item>
              <Code>each</Code> - an action worth that much RNG every time it happens, shown as a counter. Add{' '}
              <Code>default</Code> if it always happens a set number of times.
            </List.Item>
            <List.Item>
              <Code>fixed</Code> - a flat amount with nothing to answer, for encounters the route always passes through.
            </List.Item>
            <List.Item>
              <Code>choose</Code> - one of several alternatives.
            </List.Item>
            <List.Item>
              <Code>any</Code> - several independent things, added together.
            </List.Item>
            <List.Item>
              <Code>repeat</Code> with <Code>choose</Code> - the same question a set number of times.
            </List.Item>
          </List>

          <Text size="sm" fw={600} mt="md" mb={4}>
            Pages and groups
          </Text>
          <List size="sm" spacing={4}>
            <List.Item>
              <Code>target</Code> is <Code>quistis</Code> or <Code>zell</Code>. Leave <Code>base</Code> off and set{' '}
              <Code>continuesFrom</Code> to another page&apos;s label to carry its count forward.
            </List.Item>
            <List.Item>
              <Code>repeatable: true</Code> on a group lets you add and remove copies of that encounter as you go - use
              it for world map fights. <Code>repeatLabel</Code> and <Code>defaultInstances</Code> tune it.
            </List.Item>
          </List>

          <Text size="sm" fw={600} mt="md" mb={4}>
            Branching
          </Text>
          <Text size="sm" mb="sm">
            Declare <Code>toggles</Code> at the top level, then gate any group on one with <Code>when</Code> - that way
            a single file covers route variations instead of needing one file each.
          </Text>
          <Code block>{BRANCHING}</Code>
          <Text size="sm" mt="sm">
            The built-in Standard route is written this way, so it needs no file at all - the branches are just
            switches.
          </Text>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
