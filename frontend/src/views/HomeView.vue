<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Asset {
    id: number;
    name: string;
    type: 'stock' | 'forex' | 'crypto';
    symbol: string;
    price: number;
}

const assets = ref<Asset[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchData = async (): Promise<void> => {
    try {
        loading.value = true;
        const response = await fetch('http://localhost:3000/api/data');
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${await response.text()}`);
        }
        
        const data = await response.json();
        assets.value = data;
    } catch (err) {
        error.value = `Error fetching data: ${err instanceof Error ? err.message : 'Unknown error'}`;
        console.error('Fetch error:', err);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchData();
});
</script>

<template>
    <main class="relative">
        <PageHeader :link-count="3">
        </PageHeader>

        <div class="w-[93.6rem] ml-[7.2rem] h-[46rem] bg-black bg-opacity-70 backdrop-blur-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div v-if="loading" class="text-white text-center py-8">
                Loading assets...
            </div>
            <div v-else-if="error" class="text-red-500 text-center py-8">
                {{ error }}
            </div>
            <div v-else class="grid grid-cols-3 gap-6 p-8">
                <div v-for="asset in assets" 
                     :key="asset.id" 
                     class="bg-white bg-opacity-10 p-4 rounded-lg">
                    <h3 class="text-white text-xl font-bold">{{ asset.name }}</h3>
                    <div class="mt-2 space-y-2">
                        <span class="text-gray-300 block">{{ asset.symbol }}</span>
                        <span class="text-gray-400 block uppercase text-sm">{{ asset.type }}</span>
                        <span class="text-green-400 text-lg font-bold block">${{ asset.price.toFixed(2) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <PageMain>
            <div class="zsirke">
                <!-- Remove the users loop since we're now displaying assets -->
            </div>
        </PageMain>
    </main>
</template>

<style scoped>
main {
    position: relative;
}
#trending {}
</style>
