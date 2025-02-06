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
    
    <PageHeader class="w-full flex h-auto bg-black bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-around max-w-7xl p-4 mx-8 mb-2">
        <HeaderLink>
            <template #icon>
            </template>
            <template #heading >
                <router-link to="/">Home</router-link>
            </template>
        </HeaderLink>

        <HeaderLink>
            <template #icon>
            </template>
            <template #heading >
                <router-link to="about">About</router-link>
            </template>
        </HeaderLink>
        <HeaderLink>
            <template #icon>
            </template>
            <template #heading >
                <router-link to="profile">Profile</router-link>
            </template>

        </HeaderLink>
        
        <HeaderLink>
            <template #icon>
            </template>
            <template #heading >
                <router-link to="login">Login</router-link>
            </template>

        </HeaderLink>
        <!-- valami ami kiszedi a routeekbol a navbart erdemlo vieweket es ide berakna automatikusan -->
    </PageHeader>
    <PageMain class="w-full flex h-full bg-black bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-center max-w-7xl p-4 mx-8">
        <div class="w-full max-w-7xl mx-auto p-8 md:p-12 lg:p-16 xl:p-16">
            <div v-if="loading" class="text-white text-center py-8">
                Loading assets...
            </div>
            <div v-else-if="error" class="text-red-500 text-center py-8">
                {{ error }}
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                <div v-for="asset in assets" 
                    :key="asset.id" 
                    class="bg-white bg-opacity-10 p-4 rounded-lg transform transition-all duration-300 
                            hover:scale-105 hover:bg-opacity-20 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                    <h3 class="text-white text-lg md:text-xl font-bold">{{ asset.name }}</h3>
                    <div class="mt-2 space-y-2">
                        <span class="text-gray-300 block">{{ asset.symbol }}</span>
                        <span class="text-gray-400 block uppercase text-sm">{{ asset.type }}</span>
                        <span class="text-green-400 text-lg font-bold block">${{ asset.price.toFixed(2) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </PageMain>
</template>

<style scoped>

</style>
