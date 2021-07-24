<template>
    <h1>Child Content</h1>
    <p>Async result: {{ result }}</p>
    <button @click.prevent="async">
        Click for Async
    </button>
    <button @click.prevent="sync">
        Click for Sync
    </button>
</template>

<script lang="ts" setup>
    import { useEmbed } from '@/../../..';
    import { ref } from 'vue';
    import { rand } from './helpers';

    const id = window.location.hash.substr(1);

    const { send, post } = useEmbed('client', {
        id: `shared-id-${id}`,
        remote: 'http://localhost:8000',
    });

    const result = ref('');

    const async = async () => {
        try {
            const fetch = await send<string>('async', {
                dummy: 'lol 123',
            });

            result.value = fetch;
        } catch (e) {
            throw new Error(`Async fetch failed! ${e}`);
        }
    };

    const sync = () => {
        post('dummy', rand(1, 100000));
    };
</script>
