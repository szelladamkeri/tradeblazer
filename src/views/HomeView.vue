<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface User {
    id: number;
    name: string;
}

const users = ref<User[]>([]);

const fetchData = async (): Promise<void> => {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: User[] = await response.json();
        users.value = data;
        console.log(data); // Do something with the data
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

onMounted(() => {
    fetchData();
});
</script>

<template>

    <!-- <PageHeader :link-count="3" class="">
    </PageHeader>
    <PageMain class="">
        <div class="w-[75%] ml-[7.2rem] h-[80%] bg-black bg-opacity-70 backdrop-blur-xl 
                    absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                    flex items-center justify-center">
            <div class="">

            </div>
        </div>
    </PageMain> -->

    <div class=" w-full h-full">

        <PageHeader :link-count="3" class=""></PageHeader>
        <PageMain></PageMain>

        <!-- <PageMain class="flex-grow bg-black bg-opacity-70 backdrop-blur-xl">
            <div class="w-full h-full flex items-center justify-center">
                <div class="text-white">
                    Content
                </div>
            </div>
        </PageMain> -->
    </div>

</template>

<style>
main {
    position: relative;
}

#trending {}
</style>
<main class="relative">
        <PageHeader :link-count="3">
        </PageHeader>

        <div class="w-[93.6rem] ml-[7.2rem] h-[46rem] bg-black bg-opacity-70 backdrop-blur-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>

        <PageMain>
            <div class="zsirke">
                <ul>
                    <li v-for="user in users" :key="user.id">{{ user.name }}</li>
                </ul>
            </div>
        </PageMain>
    </main>
</template>
