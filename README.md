<div align="center">
  <a href="https://www.npmjs.com/package/@evilkiwi/embed" target="_blank">
    <img src="https://img.shields.io/npm/v/@evilkiwi/embed?style=flat-square" alt="NPM" />
  </a>
  <a href="https://discord.gg/3S6AKZ2GR9" target="_blank">
    <img src="https://img.shields.io/discord/1000565079789535324?color=7289DA&label=discord&logo=discord&logoColor=FFFFFF&style=flat-square" alt="Discord" />
  </a>
  <img src="https://img.shields.io/npm/l/@evilkiwi/embed?style=flat-square" alt="GPL-3.0-only" />
  <h3>Embedded iFrame IPC for Vue 3</h3>
</div>

`@evilkiwi/embed` provides a single Vue 3 hook which can be used to communicate between an iFrame and its parent via `postMessage` IPC.

- `sync`/`async` messaging/responses
- Configurable timeouts
- Bi-directional communication
- Cross-origin support
- Same usage/API for both Host & Client
- Support for enforcing origins for increased security
- No limit to number of instances you can use/create at any given time
- TypeScript
- Tiny (1.73kb)

## Installation

This package is available via NPM:

```bash
yarn add @evilkiwi/embed

# or

npm install @evilkiwi/embed
```

## Usage

For this example, we'll assume the `host` is a webpage (`example.com`) and the `client` is a webpage embedded in an iFrame (`frame.example.com`). The only difference between a `host` and a `client` is that the `host` requires an iFrame `ref` for binding and sending the messages.

```vue
/**
 * Host
 */
<template>
  <iframe
    src="https://frame.example.com"
    ref="iframe"
    sandbox="allow-scripts"
  />
</template>

<script lang="ts" setup>
  import { useEmbed } from '@evilkiwi/embed';
  import { ref, onMounted } from 'vue';

  const iframe = ref<InstanceType<typeof HTMLIFrame>>();

  const { send, events } = useEmbed('host', {
    id: 'shared-id',
    iframe,
    remote: 'https://frame.example.com',
  });

  // Listen for any synchronous events being emitted over IPC
  events.on('yay', payload => {
    console.log(payload);
  });

  onMounted(async () => {
    // Send an event to the iFrame and wait for a response.
    const response = await send('hello-world', {
      hello: 'world',
    });
  });
</script>

/**
 * Client
 */
<template>
  <button @click.prevent="submit">Click me!</button>
</template>

<script lang="ts" setup>
  import { useEmbed } from '@evilkiwi/embed';

  const { handle, post } = useEmbed('client', {
    id: 'shared-id',
    remote: 'https://example.com',
  });

  // Resolves incoming (a)synchronous operations.
  handle('hello-world', async (payload) => {
    if (payload.hello === 'world') {
      return 'hey';
    }

    return 'go away';
  });

  const submit = () => {
    // Send a synchronous event to the host
    post('yay', { test: 123 });
  };
</script>
```

This example shows:

- Initializing the Host and Client
- Sending and waiting for asynchronous events
- Sending and receiving synchronous events

Since communication is bi-directional, you can use **any of the methods on either Host or Client**. For example, asynchronous operations aren't limited to Host -> Client, the Client can also call asynchronous operations and the Host can register handlers/resolvers.

**Option**|**Default**|**Type**|**Description**
-----|-----|-----|-----
`id`|**[Required]**|`string`|The Host and Client that you want to talk to each other should share the \_same\_ ID.
`timeout`|`15000`|`number`|Configures the global timeout for all asynchronous operations against this ID pair.
`iframe`|**[Required for Host]**|`Ref<InstanceType<typeof HTMLIFrame>>`|A Vue 3 `ref` for a Template reference.
`remote`|`*`|`string`|A remote URL to limit who can recieve/process Events over this Host/Client pair.
`debug`|`false`|`boolean`|Whether to print Debug messages to the console, providing an overview of the IPC process.

### Security Note

By default, if you don't supply a `remote`, the library will process **all** incoming messages and send events that **any** party can recieve. By setting this to a URL (See above example), you can limit this and hugely reduce the impact it has on security.

## To-do

- Add a test suite
