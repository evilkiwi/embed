<template>
    <div class="col">
        <h1>Parent Content 1</h1>
        <p>Last dummy text: {{ lastDummy1 }}</p>
        <iframe
            src="http://localhost:8001#1"
            ref="iframe1"
            sandbox="allow-scripts"
        />
        <p v-if="countdown1 > 0">Waiting to response... {{ countdown1 }}s</p>
    </div>
    <div class="col">
        <h1>Parent Content 2</h1>
        <p>Last dummy text: {{ lastDummy2 }}</p>
        <iframe
            src="http://localhost:8001#2"
            ref="iframe2"
            sandbox="allow-scripts"
        />
        <p v-if="countdown2 > 0">Waiting to response... {{ countdown2 }}s</p>
    </div>
</template>

<script lang="ts" setup>
    import { useEmbed } from '@/../../..';
    import { ref } from 'vue';

    let interval1: number|undefined;
    let interval2: number|undefined;

    const iframe1 = ref<InstanceType<typeof HTMLIFrameElement>>();
    const iframe2 = ref<InstanceType<typeof HTMLIFrameElement>>();
    const countdown1 = ref(0);
    const countdown2 = ref(0);
    const lastDummy1 = ref('');
    const lastDummy2 = ref('');

    const { handle: handle1, events: events1 } = useEmbed<{
        dummy: (num: number) => void;
    }>('host', {
        id: 'shared-id-1',
        iframe: iframe1,
        remote: 'http://localhost:8001',
    });

    const { handle: handle2, events: events2 } = useEmbed<{
        dummy: (num: number) => void;
    }>('host', {
        id: 'shared-id-2',
        iframe: iframe2,
        remote: 'http://localhost:8001',
    });

    events1.on('dummy', (num) => {
        lastDummy1.value = `${num}`;
    });

    events2.on('dummy', (num) => {
        lastDummy2.value = `${num}`;
    });

    handle1<{ dummy: string }>('async', async (payload) => {
        lastDummy1.value = payload.dummy;
        countdown1.value = 5;

        return new Promise<string>((resolve, reject) => {
            interval1 = setInterval(() => {
                countdown1.value -= 1;

                if (countdown1.value === 0) {
                    clearInterval(interval1);
                    resolve('Hello world!');
                }
            }, 1000);
        });
    });

    handle2<{ dummy: string }>('async', async (payload) => {
        lastDummy2.value = payload.dummy;
        countdown2.value = 5;

        return new Promise<string>((resolve, reject) => {
            interval2 = setInterval(() => {
                countdown2.value -= 1;

                if (countdown2.value === 0) {
                    clearInterval(interval2);
                    resolve('Hello world!');
                }
            }, 1000);
        });
    });
</script>

<style>
    #app {
        display: flex;
        flex-direction: row;
    }

    .col {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: 0;
        margin-left: 20px;
    }

    .col:first-child {
        margin-left: 0;
    }
</style>
