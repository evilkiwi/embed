<template>
    <h1>Parent Content</h1>
    <p>Last dummy text: {{ lastDummy }}</p>
    <iframe
        src="http://localhost:8001"
        ref="iframe"
        sandbox="allow-scripts"
    />
    <p v-if="countdown > 0">Waiting to response... {{ countdown }}s</p>
</template>

<script lang="ts" setup>
    import { useEmbed } from '@/../../..';
    import { ref } from 'vue';

    let interval: number|undefined;

    const iframe = ref<InstanceType<typeof HTMLIFrameElement>>();
    const countdown = ref(0);
    const lastDummy = ref('');

    const { handle, events } = useEmbed<{
        dummy: (num: number) => void;
    }>('host', {
        id: 'shared-id',
        iframe,
        remote: 'http://localhost:8001',
    });

    events.on('dummy', (num) => {
        lastDummy.value = `${num}`;
    });

    handle<{ dummy: string }>('async', async (payload) => {
        lastDummy.value = payload.dummy;
        countdown.value = 5;

        return new Promise<string>((resolve, reject) => {
            interval = setInterval(() => {
                countdown.value -= 1;

                if (countdown.value === 0) {
                    clearInterval(interval);
                    resolve('Hello world!');
                }
            }, 1000);
        });
    });
</script>
