<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface User {
    id: number;
    name: string;
}

const users = ref<User[]>([]);

const fetchData = async (): Promise<void> => {
    try {
        const response = await fetch('http://localhost:3000/api/data');
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
    <main class="relative">
        <div>
            <ul>
                <li v-for="user in users" :key="user.id">{{ user.name }}</li>
            </ul>
        </div>
    </main>
</template>

<style>
main {
    position: relative;
}
</style>
