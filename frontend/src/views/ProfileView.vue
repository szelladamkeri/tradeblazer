<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'
import HeaderLink from '@/components/HeaderLink.vue'
import { useUserStore } from '@/stores/userStore'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FadeIn from '@/components/FadeIn.vue'

const userStore = useUserStore()
const router = useRouter()

onMounted(async () => {
    if (!userStore.isAuthenticated) {
        router.push('/login')
    } else {
        avatarAvailable.value = await avatarExists();
    }
})
const avatarAvailable = ref(false);

const avatarExists = async (): Promise<boolean> => {
    try {
        const response = await fetch('http://localhost:3000/api/checkfile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                purpose: 'avatarCheck',
                username: userStore.user?.username,
            }),
        })

        const data = await response.json()
        return data.hasAvatar
    } catch (error) {
        return false
    }
}
</script>

<template>
    <PageHeader />
    <PageMain class="w-full bg-black bg-opacity-70 backdrop-blur-xl rounded-xl max-w-7xl mx-auto">
        <FadeIn>
            <div class="w-full max-w-2xl mx-auto p-6 sm:p-8">
                <div v-if="userStore.user" class="space-y-8">
                    <div class="text-center">
                        <div class="w-24 h-24 mx-auto bg-green-600 rounded-full flex items-center justify-center mb-4"
                            v-if="!avatarAvailable">
                            <span class="text-3xl font-bold text-white">
                                {{ userStore.user.username[0].toUpperCase() }}
                            </span>
                        </div>
                        <div class="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
                            v-if="avatarAvailable">
                            <img :src="'/src/assets/avatars/' + userStore.user.username + '.jpg'" alt=""
                                class="rounded-full">
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">
                            {{ userStore.user.username }}
                        </h2>
                        <p class="text-gray-400">{{ userStore.user.email }}</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="bg-white/10 p-4 rounded-xl">
                            <h3 class="text-white text-lg font-semibold mb-2">Account Status</h3>
                            <p class="text-green-400">Active</p>
                        </div>
                        <div class="bg-white/10 p-4 rounded-xl">
                            <h3 class="text-white text-lg font-semibold mb-2">Member Since</h3>
                            <p class="text-gray-300">{{ new Date().toLocaleDateString() }}</p>
                        </div>
                    </div>

                    <div class="flex gap-4 justify-center">
                        <button @click="router.push('/edit-profile')"
                            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </FadeIn>
    </PageMain>
</template>

<style scoped>
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
