<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const verified = ref(false)
const error = ref<string | null>(null)

// Add mouse move tracking for the gradient effect
const handleMouseMove = (event: MouseEvent) => {
    const main = event.currentTarget as HTMLElement;
    const rect = main.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    main.style.setProperty('--mouse-x', `${x}%`);
    main.style.setProperty('--mouse-y', `${y}%`);
};

const verifyAccount = async (token: string) => {
    try {
        const response = await fetch(`http://localhost:3000/api/verification/verify/${token}`);

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Verification failed');
        }

        const data = await response.json();
        verified.value = true;
    } catch (err) {
        console.error('Verification error:', err);
        error.value = err instanceof Error ? err.message : 'Failed to verify your account';
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    const token = route.query.token as string;

    if (!token) {
        error.value = 'Invalid verification link';
        loading.value = false;
        return;
    }

    verifyAccount(token);
});

const goToLogin = () => {
    router.push('/login');
};
</script>

<template>
    <div class="verify-view view-container">
        <PageHeader @mousemove="handleMouseMove" class="custom-header" />
        <PageMain @mousemove="handleMouseMove">
            <div class="w-full h-[calc(100vh-12rem)] flex items-center justify-center">
                <div
                    class="max-w-md w-full px-4 py-8 sm:px-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                    <!-- Loading State -->
                    <div v-if="loading" class="text-center py-8">
                        <div
                            class="inline-block animate-spin rounded-full border-t-2 border-green-500 border-r-2 border-white/20 h-12 w-12 mb-4">
                        </div>
                        <p class="text-white">Verifying your account...</p>
                    </div>

                    <!-- Success State -->
                    <div v-else-if="verified" class="text-center py-6">
                        <font-awesome-icon icon="check-circle" class="text-green-500 text-5xl mb-4" />
                        <h2 class="text-white text-2xl font-bold mb-4">Email Verified!</h2>
                        <p class="text-gray-300 mb-6">Your account has been successfully verified.</p>
                        <button @click="goToLogin"
                            class="w-full p-3 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700 transition-all duration-200">
                            Login to Your Account
                        </button>
                    </div>

                    <!-- Error State -->
                    <div v-else class="text-center py-6">
                        <font-awesome-icon icon="exclamation-circle" class="text-red-500 text-5xl mb-4" />
                        <h2 class="text-white text-2xl font-bold mb-4">Verification Failed</h2>
                        <p class="text-red-300 mb-6">{{ error || 'There was a problem verifying your account.' }}</p>
                        <p class="text-gray-400 text-sm mb-6">
                            The verification link may have expired or is invalid.
                            Please try again or request a new verification link.
                        </p>
                        <div class="flex space-x-4">
                            <button @click="goToLogin"
                                class="w-1/2 p-3 rounded-lg text-white font-medium bg-gray-600 hover:bg-gray-700 transition-all duration-200">
                                Go to Login
                            </button>
                            <router-link to="/register"
                                class="w-1/2 p-3 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700 transition-all duration-200 text-center">
                                Register Again
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </PageMain>
    </div>
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

/* Add interactive gradient effect */
:deep(.page-main)::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(74, 222, 128, 0.08) 0%,
            transparent 60%);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.6s ease;
    z-index: 1;
    border-radius: 0.75rem;
}

:deep(.page-main):hover::after {
    opacity: 1;
}
</style>
