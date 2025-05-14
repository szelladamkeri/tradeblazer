<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import PageMain from '@/components/PageMain.vue'

const { t } = useI18n()

// Add mouse move tracking for the gradient effect
const handleMouseMove = (event: MouseEvent) => {
  const main = event.currentTarget as HTMLElement;
  const rect = main.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  
  main.style.setProperty('--mouse-x', `${x}%`);
  main.style.setProperty('--mouse-y', `${y}%`);
};
</script>

<template>
  <div class="about-view view-container">
    <PageHeader @mousemove="handleMouseMove" class="custom-header" />
    <PageMain @mousemove="handleMouseMove">
      <div class="w-full max-w-7xl mx-auto p-8">
        <!-- Main About Content -->
        <div class="mb-16">
          <!-- Hero Section -->
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-white mb-4">About TradeBlazer</h1>
            <p class="text-xl text-gray-300 max-w-3xl mx-auto">
              Your trusted partner in the world of trading, providing cutting-edge tools and education since 2025.
            </p>
          </div>

          <!-- Mission & Vision -->
          <div class="grid md:grid-cols-2 gap-8 mb-12">
            <div class="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-green-500/30 transition-all">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <font-awesome-icon icon="bullseye" class="text-2xl text-green-400" />
                </div>
                <h2 class="text-2xl font-bold text-white">Our Mission</h2>
              </div>
              <p class="text-gray-300">To democratize trading by providing accessible, educational, and powerful tools that help individuals achieve their financial goals.</p>
            </div>
            <div class="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-green-500/30 transition-all">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <font-awesome-icon icon="eye" class="text-2xl text-green-400" />
                </div>
                <h2 class="text-2xl font-bold text-white">Our Vision</h2>
              </div>
              <p class="text-gray-300">To become the world's most trusted and innovative trading platform, where every trader can thrive regardless of their experience level.</p>
            </div>
          </div>

          <!-- Key Features -->
          <div class="mb-12">
            <h2 class="text-3xl font-bold text-white mb-8 text-center">Why Choose TradeBlazer</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-green-500/30 transition-all">
                <font-awesome-icon icon="shield-halved" class="text-3xl text-green-400 mb-4" />
                <h3 class="text-xl font-semibold text-white mb-2">Security First</h3>
                <p class="text-gray-300">Your security and privacy are our top priorities. We employ state-of-the-art protection measures.</p>
              </div>
              <div class="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-green-500/30 transition-all">
                <font-awesome-icon icon="graduation-cap" class="text-3xl text-green-400 mb-4" />
                <h3 class="text-xl font-semibold text-white mb-2">Education</h3>
                <p class="text-gray-300">We believe in empowering traders through comprehensive educational resources and tools.</p>
              </div>
              <div class="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-green-500/30 transition-all">
                <font-awesome-icon icon="handshake" class="text-3xl text-green-400 mb-4" />
                <h3 class="text-xl font-semibold text-white mb-2">Transparency</h3>
                <p class="text-gray-300">We maintain complete transparency in our operations and fee structure.</p>
              </div>
            </div>
          </div>

          <!-- Team Section -->
          <div>
            <h2 class="text-3xl font-bold text-white mb-8 text-center">Our Team</h2>
            <div class="grid md:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="w-24 h-24 rounded-full bg-white/10 mx-auto mb-4"></div>
                <h3 class="text-lg font-semibold text-white">John Doe</h3>
                <p class="text-gray-400">CEO & Founder</p>
              </div>
              <div class="text-center">
                <div class="w-24 h-24 rounded-full bg-white/10 mx-auto mb-4"></div>
                <h3 class="text-lg font-semibold text-white">Jane Smith</h3>
                <p class="text-gray-400">CEO & Founder</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Content (Existing) -->
        <div class="border-t border-white/10 pt-8">
          <!-- Company & Links Grid -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <!-- Company Info -->
            <div class="md:col-span-2 space-y-4">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <font-awesome-icon icon="chart-line" class="text-2xl text-green-400" />
                </div>
                <h1 class="text-2xl font-bold text-white">TradeBlazer</h1>
              </div>
              <p class="text-gray-300">Empowering traders with cutting-edge tools and education since 2025.</p>
              <div class="flex items-center gap-2 text-gray-400">
                <font-awesome-icon icon="location-dot" />
                <span>Budapest, Hungary</span>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="space-y-4">
              <h2 class="text-lg font-bold text-white">Quick Links</h2>
              <ul class="space-y-2">
                <li><router-link to="/markets" class="text-gray-400 hover:text-green-400">Markets</router-link></li>
                <li><router-link to="/tutorial" class="text-gray-400 hover:text-green-400">Tutorial</router-link></li>
                <li><a href="#" class="text-gray-400 hover:text-green-400">Terms of Service</a></li>
                <li><a href="#" class="text-gray-400 hover:text-green-400">Privacy Policy</a></li>
              </ul>
            </div>

            <!-- Contact -->
            <div class="space-y-4">
              <h2 class="text-lg font-bold text-white">Contact</h2>
              <div class="space-y-2">
                <a href="mailto:support@tradeblazer.com" class="flex items-center gap-2 text-gray-400 hover:text-green-400">
                  <font-awesome-icon icon="envelope" />
                  <span>support@tradeblazer.com</span>
                </a>
                <div class="flex items-center gap-2 text-gray-400">
                  <font-awesome-icon icon="phone" />
                  <span>+36 1 234 5678</span>
                </div>
                <div class="flex gap-4 mt-4">
                  <a href="#" class="text-gray-400 hover:text-green-400">
                    <font-awesome-icon :icon="['fab', 'facebook']" size="lg" />
                  </a>
                  <a href="#" class="text-gray-400 hover:text-green-400">
                    <font-awesome-icon :icon="['fab', 'twitter']" size="lg" />
                  </a>
                  <a href="#" class="text-gray-400 hover:text-green-400">
                    <font-awesome-icon :icon="['fab', 'linkedin']" size="lg" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Copyright -->
          <div class="border-t border-white/10 pt-8 text-center">
            <p class="text-gray-400">&copy; 2025 TradeBlazer. All rights reserved.</p>
          </div>
        </div>
      </div>
    </PageMain>
  </div>
</template>

<style scoped>
/* Add interactive gradient effect */
:deep(.page-main)::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(74, 222, 128, 0.08) 0%,
    transparent 60%
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease;
  z-index: 1;
  border-radius: 0.75rem;
}

:deep(.page-main):hover::after {
  opacity: 1;
}

/* Ensure consistent styling with other views */
.about-view {
  height: auto !important;
  min-height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
  padding-top: 0 !important;
}

/* Add consistent responsiveness */
@media (max-width: 1400px) {
  :deep(.page-header), :deep(.page-main) {
    width: 95vw !important;
    max-width: 95vw !important;
  }
}

@media (max-width: 1100px) {
  :deep(.page-header), :deep(.page-main) {
    width: 95vw !important;
    max-width: 95vw !important;
  }
}

@media (max-width: 640px) {
  :deep(.page-header), :deep(.page-main) {
    width: calc(100vw - 2rem) !important;
    max-width: calc(100vw - 2rem) !important;
  }
}

/* Fix prose styling for dark theme */
.prose {
  color: rgba(255, 255, 255, 0.7);
}

.prose p {
  margin-bottom: 1.5rem;
}
</style>
