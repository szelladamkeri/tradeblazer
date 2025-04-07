<template>
  <div class="animated-background">
    <!-- Deep space backdrop with proper dark matter gradient -->
    <div class="space-gradient"></div>
    
    <!-- Multiple star layers with parallax for depth perception -->
    <div class="star-layer distant-stars"></div>
    <div class="star-layer mid-stars"></div>
    <div class="star-layer near-stars"></div>
    
    <!-- Cosmic dust clouds in blue-green -->
    <div class="dust-cloud dust1"></div>
    <div class="dust-cloud dust2"></div>
    
    <!-- Galaxies in blue-green theme -->
    <div class="galaxy blue-galaxy"></div>
    <div class="galaxy green-galaxy"></div>
    
    <!-- Nebulae with theme-matching glow -->
    <div class="nebula blue-nebula"></div>
    <div class="nebula green-nebula"></div>
    
    <!-- Meteor streaks with proper physics -->
    <div class="meteor-container">
      <div class="meteor m1"></div>
      <div class="meteor m2"></div>
      <div class="meteor m3"></div>
    </div>
    
    <!-- Theme-colored star glimmers -->
    <div class="star-glimmer blue-star"></div>
    <div class="star-glimmer green-star"></div>
    <div class="star-glimmer white-star"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

// Performance optimization
const handleVisibilityChange = () => {
  const background = document.querySelector('.animated-background');
  if (background) {
    background.classList.toggle('paused', document.hidden);
  }
};

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Randomly generate meteors
  setInterval(() => {
    if (document.hidden) return;
    
    const meteors = document.querySelectorAll('.meteor');
    const randomMeteor = meteors[Math.floor(Math.random() * meteors.length)];
    
    // Reset meteor position and make it visible
    randomMeteor.style.opacity = '0';
    randomMeteor.style.transform = `translateX(0) rotate(${-15 + Math.random() * 30}deg)`;
    
    // Trigger meteor animation
    setTimeout(() => {
      randomMeteor.style.opacity = '1';
      randomMeteor.style.transform = `translateX(calc(100vw + 200px)) rotate(${-15 + Math.random() * 30}deg)`;
      
      // Hide meteor after animation
      setTimeout(() => {
        randomMeteor.style.opacity = '0';
      }, 2000);
    }, 10);
  }, 8000); // Random meteor every 8 seconds
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style scoped>
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* Ensure background stays behind all content */
  overflow: hidden;
  pointer-events: none;
}

/* Pause all animations when tab not visible */
.animated-background.paused * {
  animation-play-state: paused !important;
  transition: none !important;
}

/* Blue-green themed space gradient background */
.space-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, 
    #061625 0%, 
    #0a192f 25%, 
    #091b26 50%, 
    #061521 75%, 
    #051017 100%);
  opacity: 1;
}

/* Realistic star layers with parallax */
.star-layer {
  position: absolute;
  inset: 0;
  background-repeat: repeat;
  transform-style: preserve-3d;
}

/* Distant stars - many small, dim stars */
.distant-stars {
  background-image: 
    radial-gradient(0.5px 0.5px at 50px 160px, rgba(255, 255, 255, 0.4) 50%, transparent 100%),
    radial-gradient(0.5px 0.5px at 100px 280px, rgba(255, 255, 255, 0.3) 50%, transparent 100%),
    radial-gradient(0.5px 0.5px at 180px 50px, rgba(255, 255, 255, 0.4) 50%, transparent 100%),
    radial-gradient(0.5px 0.5px at 220px 350px, rgba(255, 255, 255, 0.4) 50%, transparent 100%),
    radial-gradient(0.5px 0.5px at 350px 200px, rgba(255, 255, 255, 0.5) 50%, transparent 100%),
    radial-gradient(0.5px 0.5px at 400px 100px, rgba(255, 255, 255, 0.4) 50%, transparent 100%),
    radial-gradient(0.5px 0.5px at 500px 300px, rgba(255, 255, 255, 0.3) 50%, transparent 100%),
    radial-gradient(0.5px 0.5px at 560px 150px, rgba(255, 255, 255, 0.4) 50%, transparent 100%),
    radial-gradient(0.5px 0.5px at 620px 280px, rgba(255, 255, 255, 0.5) 50%, transparent 100%),
    radial-gradient(0.5px 0.5px at 720px 120px, rgba(255, 255, 255, 0.3) 50%, transparent 100%),
    radial-gradient(0.5px 0.5px at 800px 320px, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
  background-size: 900px 400px;
  opacity: 0.8;
  animation: driftSlow 120s linear infinite alternate;
}

/* Mid-distance stars - some with blue-green tint */
.mid-stars {
  background-image: 
    radial-gradient(1px 1px at 120px 80px, rgba(255, 255, 255, 0.8) 50%, transparent 100%),
    radial-gradient(1px 1px at 300px 200px, rgba(255, 255, 255, 0.8) 50%, transparent 100%),
    radial-gradient(1px 1px at 480px 120px, rgba(255, 255, 255, 0.7) 50%, transparent 100%),
    radial-gradient(1px 1px at 580px 350px, rgba(255, 255, 255, 0.8) 50%, transparent 100%),
    radial-gradient(1px 1px at 650px 180px, rgba(255, 255, 255, 0.8) 50%, transparent 100%),
    radial-gradient(1.5px 1.5px at 220px 320px, rgba(220, 255, 240, 0.9) 50%, transparent 100%), /* Green-tinted star */
    radial-gradient(1px 1px at 400px 280px, rgba(255, 255, 255, 0.7) 50%, transparent 100%),
    radial-gradient(1.5px 1.5px at 520px 50px, rgba(220, 240, 255, 0.9) 50%, transparent 100%), /* Blue-tinted star */
    radial-gradient(1px 1px at 720px 320px, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
  background-size: 850px 400px;
  opacity: 0.85;
  animation: driftMedium 100s linear infinite reverse;
}

/* Near stars - brightest with blue and green tints */
.near-stars {
  background-image: 
    radial-gradient(1.5px 1.5px at 180px 150px, rgba(255, 255, 255, 1) 50%, transparent 100%),
    radial-gradient(2px 2px at 320px 250px, rgba(220, 240, 255, 1) 50%, transparent 100%), /* Blue-tinted star */
    radial-gradient(1.5px 1.5px at 460px 180px, rgba(255, 255, 255, 1) 50%, transparent 100%),
    radial-gradient(2px 2px at 600px 280px, rgba(230, 255, 240, 1) 50%, transparent 100%), /* Green-tinted star */
    radial-gradient(2.5px 2.5px at 720px 130px, rgba(200, 250, 255, 1) 50%, transparent 100%), /* Cyan star */
    radial-gradient(1.5px 1.5px at 800px 220px, rgba(210, 255, 230, 1) 50%, transparent 100%); /* Light green star */
  background-size: 900px 350px;
  opacity: 0.9;
  animation: driftFast 80s linear infinite;
}

/* Blue-green themed cosmic dust clouds */
.dust-cloud {
  position: absolute;
  border-radius: 50%;
  filter: blur(25px);
  opacity: 0.05;
  mix-blend-mode: screen;
  background-size: cover;
  animation: cloudDrift 120s linear infinite alternate;
}

.dust1 {
  top: 15%;
  left: 10%;
  width: 40%;
  height: 25%;
  background: radial-gradient(ellipse at center, 
    rgba(34, 211, 238, 0.2) 0%, 
    rgba(20, 184, 166, 0.15) 30%, 
    rgba(6, 95, 70, 0.1) 60%, 
    transparent 100%);
  transform: rotate(-15deg) scale(1.5);
}

.dust2 {
  bottom: 10%;
  right: 15%;
  width: 35%;
  height: 30%;
  background: radial-gradient(ellipse at center, 
    rgba(56, 189, 248, 0.15) 0%, 
    rgba(14, 165, 233, 0.1) 40%, 
    rgba(3, 105, 161, 0.05) 70%, 
    transparent 100%);
  transform: rotate(20deg) scale(1.8);
  animation-delay: -30s;
}

/* Blue-green themed galaxies */
.galaxy {
  position: absolute;
  filter: blur(5px);
  opacity: 0.15;
  mix-blend-mode: screen;
  animation: galaxyRotate 150s linear infinite;
}

.blue-galaxy {
  top: 30%;
  right: 25%;
  width: 300px;
  height: 300px;
  background: radial-gradient(ellipse at center, 
    rgba(56, 189, 248, 0.4) 0%, 
    rgba(14, 165, 233, 0.3) 10%, 
    rgba(3, 105, 161, 0.2) 20%,
    rgba(2, 132, 199, 0.15) 30%, 
    rgba(7, 89, 133, 0.1) 40%, 
    transparent 70%);
  box-shadow: 0 0 30px rgba(56, 189, 248, 0.2);
  transform: rotate(45deg) scale(1);
}

.green-galaxy {
  bottom: 35%;
  left: 20%;
  width: 250px;
  height: 150px;
  background: radial-gradient(ellipse at center, 
    rgba(52, 211, 153, 0.3) 0%, 
    rgba(16, 185, 129, 0.25) 20%, 
    rgba(5, 150, 105, 0.2) 40%, 
    rgba(6, 95, 70, 0.15) 60%, 
    transparent 80%);
  box-shadow: 0 0 25px rgba(52, 211, 153, 0.15);
  transform: rotate(-30deg) scale(1);
  animation-direction: reverse;
}

/* Blue-green themed nebulae */
.nebula {
  position: absolute;
  filter: blur(15px);
  mix-blend-mode: screen;
  opacity: 0.1;
  background-size: cover;
  animation: nebulaPulse 80s ease-in-out infinite alternate;
}

.blue-nebula {
  top: 5%;
  left: 15%;
  width: 450px;
  height: 250px;
  background: radial-gradient(ellipse at center, 
    rgba(56, 189, 248, 0.3) 0%, 
    rgba(14, 165, 233, 0.2) 30%, 
    rgba(3, 105, 161, 0.15) 50%, 
    rgba(1, 65, 105, 0.1) 70%, 
    transparent 100%);
  transform: rotate(15deg) scale(1);
}

.green-nebula {
  bottom: 15%;
  right: 10%;
  width: 350px;
  height: 200px;
  background: radial-gradient(ellipse at center, 
    rgba(52, 211, 153, 0.3) 0%, 
    rgba(16, 185, 129, 0.2) 30%, 
    rgba(5, 150, 105, 0.15) 50%, 
    rgba(6, 95, 70, 0.1) 70%, 
    transparent 100%);
  transform: rotate(-10deg) scale(1);
  animation-delay: -40s;
}

/* Meteor container to control meteor positions */
.meteor-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

/* Realistic meteors with blue-green trails */
.meteor {
  position: absolute;
  width: 200px;
  height: 1px;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0) 0%,
    rgba(220, 252, 231, 0.3) 50%,
    rgba(255, 255, 255, 0.8) 80%,
    rgba(255, 255, 255, 1) 100%);
  opacity: 0;
  filter: drop-shadow(0 0 3px #a5f3fc);
  transition: opacity 0.3s ease-out, transform 2s cubic-bezier(0.13, 0.79, 0.84, 0.96);
}

.m1 {
  top: 15%;
  left: -200px;
}

.m2 {
  top: 40%;
  left: -200px;
}

.m3 {
  top: 65%;
  left: -200px;
}

/* Theme-colored star glimmers */
.star-glimmer {
  position: absolute;
  border-radius: 50%;
  animation: starPulse 5s ease-in-out infinite alternate;
}

.blue-star {
  top: 25%;
  left: 30%;
  width: 3px;
  height: 3px;
  background: radial-gradient(circle at center, 
    rgba(56, 189, 248, 0.9) 0%, 
    rgba(14, 165, 233, 0.4) 20%, 
    rgba(3, 105, 161, 0.1) 40%, 
    transparent 70%);
  animation-delay: -1s;
}

.green-star {
  top: 60%;
  right: 25%;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle at center, 
    rgba(52, 211, 153, 0.9) 0%, 
    rgba(16, 185, 129, 0.4) 20%, 
    rgba(5, 150, 105, 0.1) 40%, 
    transparent 70%);
  animation-delay: -3s;
}

.white-star {
  bottom: 30%;
  left: 40%;
  width: 3px;
  height: 3px;
  background: radial-gradient(circle at center, 
    rgba(255, 255, 255, 0.9) 0%, 
    rgba(255, 255, 255, 0.4) 20%, 
    rgba(255, 255, 255, 0.1) 40%, 
    transparent 70%);
  animation-delay: -2s;
}

/* Realistic space animations */
@keyframes driftSlow {
  0% { transform: translateY(0) translateX(0); }
  100% { transform: translateY(-20px) translateX(20px); }
}

@keyframes driftMedium {
  0% { transform: translateY(0) translateX(0); }
  100% { transform: translateY(-30px) translateX(-30px); }
}

@keyframes driftFast {
  0% { transform: translateY(0) translateX(0); }
  100% { transform: translateY(-40px) translateX(40px); }
}

@keyframes cloudDrift {
  0% { transform: translateX(0) scale(1); opacity: 0.05; }
  50% { opacity: 0.08; }
  100% { transform: translateX(40px) scale(1.1); opacity: 0.05; }
}

@keyframes galaxyRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes nebulaPulse {
  0%, 100% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.15; transform: scale(1.05); }
}

@keyframes starPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); filter: blur(0px); }
  50% { opacity: 1; transform: scale(1.5); filter: blur(1px); }
}

/* Optimize for mobile */
@media (max-width: 768px) {
  .galaxy, .nebula, .dust-cloud {
    opacity: 0.05 !important;
    animation-duration: 240s !important;
  }
  
  .star-layer {
    opacity: 0.5 !important;
  }
  
  .star-glimmer {
    display: none;
  }
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion) {
  .star-layer, .galaxy, .nebula, .dust-cloud, .star-glimmer {
    animation: none !important;
  }
  
  .meteor {
    display: none !important;
  }
}
</style>
