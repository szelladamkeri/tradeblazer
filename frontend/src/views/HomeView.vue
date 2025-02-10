<script setup lang="ts">
    import PageHeader from '@/components/PageHeader.vue'
    import PageMain from '@/components/PageMain.vue'
    import HeaderLink from '@/components/HeaderLink.vue'
    import { ref, onMounted } from 'vue';

    interface Asset {
        id: number;
        name: string;
        type: string; //using /api/types
        symbol: string;
        price: number;
    }

    const assets = ref<Asset[]>([]);
    const types = ref<string[]>([]);
    const loading = ref(true);
    const error = ref<string | null>(null);

    const fetchData = async (): Promise<void> => {
        try {
            loading.value = true;
            const [assetsResponse, typesResponse] = await Promise.all([
                fetch('http://localhost:3000/api/data'),
                fetch('http://localhost:3000/api/types')
            ]);

            if (!assetsResponse.ok) {
                throw new Error(`Server returned ${assetsResponse.status}: ${await assetsResponse.text()}`);
            }
            if (!typesResponse.ok) {
                throw new Error(`Server returned ${typesResponse.status}: ${await typesResponse.text()}`);
            }

            const assetsData = await assetsResponse.json();
            const typesData = await typesResponse.json();
            assets.value = assetsData;
            types.value = typesData;
        } catch (err) {
            if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                error.value = 'Error fetching data: Server is not running';
            } else {
                error.value = `Error fetching data: ${err instanceof Error ? err.message : 'Unknown error'}`;
            }
            console.error('Fetch error:', err);
        } finally {
            loading.value = false;
        }
    };

    const getTrendingAsset = () => {
        if (assets.value.length === 0) return null; //ha nincs asset akkor nullot return
        return assets.value[0]; // egyenlőre az első assetet
    };

    onMounted(() => {
        fetchData();
    });
</script>

<template>
    <PageHeader class="w-full flex flex-wrap h-auto bg-black bg-opacity-70 backdrop-blur-xl rounded-xl 
                       items-center justify-center sm:justify-around max-w-7xl p-2 sm:p-4 mx-2 sm:mx-8 mb-2 gap-2">
        <HeaderLink class="w-[45%] sm:w-auto text-center">
            <template #icon>
            </template>
            <template #heading >
                <router-link to="/">Home</router-link>
            </template>
        </HeaderLink>

        <HeaderLink class="w-[45%] sm:w-auto text-center">
            <template #icon>
            </template>
            <template #heading >
                <router-link to="about">About</router-link>
            </template>
        </HeaderLink>
        <HeaderLink class="w-[45%] sm:w-auto text-center">
            <template #icon>
            </template>
            <template #heading >
                <router-link to="profile">Profile</router-link>
            </template>

        </HeaderLink>
        
        <HeaderLink class="w-[45%] sm:w-auto text-center">
            <template #icon>
            </template>
            <template #heading >
                <router-link to="login">Login</router-link>
            </template>

        </HeaderLink>
        <!-- valami ami kiszedi a routeekbol a navbart erdemlo vieweket es ide berakna automatikusan -->
    </PageHeader>
    <PageMain class="w-[95%] sm:w-full max-w-7xl flex flex-col h-full bg-black bg-opacity-70 backdrop-blur-xl 
                     rounded-xl items-center justify-start mx-auto sm:mx-8 overflow-hidden">
        <div class="w-full h-full p-2 sm:p-4 overflow-y-auto">
            <div v-if="loading" class="text-white text-center py-4">
                Loading assets...
            </div>
            <div v-else-if="error" class="text-red-500 text-center py-4">
                {{ error }}
            </div>
            <div v-else class="space-y-4">
                <!-- Trending Asset Section -->
                <div v-if="getTrendingAsset()" class="w-full mb-4">
                    <h2 class="text-white text-xl sm:text-2xl font-bold mb-2 px-1">Trending Now</h2>
                    <div class="bg-white bg-opacity-20 p-3 rounded-xl transform transition-all duration-300 
                              hover:bg-opacity-30 hover:shadow-2xl cursor-pointer w-full">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 class="text-white text-2xl sm:text-3xl font-bold">{{ getTrendingAsset()?.name }}</h3>
                                <span class="text-gray-300 text-lg sm:text-xl mt-1 sm:mt-2 block">{{ getTrendingAsset()?.symbol }}</span>
                                <span class="text-gray-400 uppercase text-base sm:text-lg mt-1 block">{{ getTrendingAsset()?.type }}</span>
                            </div>
                            <div class="w-full sm:w-auto text-left sm:text-right mt-4 sm:mt-0">
                                <span class="text-green-400 text-2xl sm:text-3xl font-bold block">${{ getTrendingAsset()?.price.toFixed(2) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Regular Assets Grid -->
                <div class="w-full">
                    <h2 class="text-white text-xl sm:text-2xl font-bold mb-2 px-1">All Assets</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                        <div v-for="asset in assets" 
                            :key="asset.id" 
                            class="bg-white bg-opacity-10 p-3 rounded-lg transform transition-all duration-300 
                                   hover:bg-opacity-20 hover:shadow-xl cursor-pointer
                                   break-words min-w-0 w-full">
                            <h3 class="text-white text-base sm:text-lg md:text-xl font-bold">{{ asset.name }}</h3>
                            <div class="mt-2 space-y-1 sm:space-y-2">
                                <span class="text-gray-300 block text-sm sm:text-base">{{ asset.symbol }}</span>
                                <span class="text-gray-400 block uppercase text-xs sm:text-sm">{{ asset.type }}</span>
                                <span class="text-green-400 text-base sm:text-lg font-bold block">${{ asset.price.toFixed(2) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </PageMain>
</template>

<style scoped>
/* Ensure scrollbar only shows when needed */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}
</style>
