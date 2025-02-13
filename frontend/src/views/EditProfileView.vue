<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const error = ref<string | null>(null)
const username = ref('')
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

onMounted(() => {
    if (!userStore.isAuthenticated) {
        router.push('/login')
        return
    }
    if (userStore.user) {
        username.value = userStore.user.username
        email.value = userStore.user.email
        avatar.value = userStore.user.avatar
    }
})

const handleSubmit = async (e: Event) => {
    e.preventDefault()
    loading.value = true
    error.value = null

    try {
        const response = await fetch('http://localhost:3000/api/user/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: userStore.user?.id,
                username: username.value,
                email: email.value,
                currentPassword: currentPassword.value,
                newPassword: newPassword.value || undefined,
                avatar: avatar.value || undefined
            }),
        })

        console.log('Response:', response.status)
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile')
        }

        userStore.setUser(data.user)
        router.push('/profile')
    } catch (err) {
        console.error('Update error:', err)
        error.value = err instanceof Error ? err.message : 'Failed to update profile'
    } finally {
        loading.value = false
    }
}

function onChangeFileUpload() {
    this.file = ref(["file"]).value;
}
</script>

<template>
    <PageHeader
        class="w-full flex flex-wrap h-16 bg-black bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-center sm:justify-around max-w-7xl p-2 sm:p-4 mx-2 sm:mx-8 mb-2 gap-2" />

    <PageMain
        class="w-full flex flex-col h-full bg-black bg-opacity-70 backdrop-blur-xl rounded-xl items-center justify-start max-w-7xl mx-2 sm:mx-8 overflow-hidden">
        <div class="w-full max-w-2xl mx-auto p-6 sm:p-8">
            <div class="space-y-8">
                <div class="text-center sm:text-left">
                    <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Edit Profile</h2>
                    <p class="text-gray-400">Update your account information</p>
                </div>

                <form @submit="handleSubmit" class="space-y-6">
                    <div v-if="error" class="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded-lg">
                        {{ error }}
                    </div>

                    <div class="space-y-4">
                        <div class="space-y-2">
                            <label class="block text-gray-200 text-sm font-medium">Username</label>
                            <input v-model="username" type="text" required
                                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-green-500" />
                        </div>

                        <div class="space-y-2">
                            <label class="block text-gray-200 text-sm font-medium">Email</label>
                            <input v-model="email" type="email" required
                                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-green-500" />
                        </div>

                        <div class="space-y-2">
                            <label class="block text-gray-200 text-sm font-medium">Current Password</label>
                            <input v-model="currentPassword" type="password" required
                                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-green-500" />
                        </div>

                        <div class="space-y-2">
                            <label class="block text-gray-200 text-sm font-medium">New Password (optional)</label>
                            <input v-model="newPassword" type="password"
                                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-green-500" />
                        </div>

                        <div v-if="newPassword && newPassword.length > 0" class="space-y-2">
                            <label class="block text-gray-200 text-sm font-medium">Confirm New Password</label>
                            <input v-model="confirmPassword" type="password" required
                                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-green-500" />
                        </div>

                        <div class="space-y-2">
                            <label class="block text-gray-200 text-sm font-medium">Avatar (max 2MB .jpg or .jpeg
                                only)</label>

                            <!-- <input v-model="avatar" type="file" accept="image/*" v-on:change="onChangeFileUpload"
                                class="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-green-500" /> -->
                            <SingleFileUpload v-model="avatar">

                            </SingleFileUpload>
                        </div>
                    </div>

                    <div class="flex gap-4 justify-end">
                        <button type="button" @click="router.push('/profile')"
                            class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" :disabled="loading"
                            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            {{ loading ? 'Saving...' : 'Save Changes' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
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
