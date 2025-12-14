<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- Left: Input area -->
      <div class="login-left">
        <div class="login-content">

          <LoginForm />
        </div>
      </div>

      <!-- Right: Display area -->
      <div class="login-right">
        <div class="display-content">
          <!-- Use image or display slogan -->
          <div class="display-slogan">
            <h2 class="slogan-line1">Your Space. Simply Yours.</h2>
            <h2 class="slogan-line2">Seamlessly Safe.</h2>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from './LoginForm.vue'
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px; /* 20px * 0.75 = 15px */
}

.login-wrapper {
  width: 100%;
  max-width: 900px; /* 1200px * 0.75 = 900px */
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background: white;
  border-radius: 9px; /* 12px * 0.75 = 9px */
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Left: Input area */
.login-left {
  padding: 36px 37.5px; /* Height reduced to 60%: 60px * 0.6 = 36px, width reduced to 75%: 50px * 0.75 = 37.5px */
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.login-content {
  width: 100%;
  max-width: 300px; /* 400px * 0.75 = 300px */
}

/* Right: Display area */
.login-right {
  /* Support background image (PNG supports transparency), if no image then use gradient background */
  background: 
    url('@/assets/images/login-bg.png') center/cover no-repeat,
    linear-gradient(180deg, #87ceeb 0%, #4682b4 100%);
  /* Fallback color (if image fails to load) */
  background-color: #87ceeb;
  padding: 36px 37.5px; /* Height reduced to 60%: 60px * 0.6 = 36px, width reduced to 75%: 50px * 0.75 = 37.5px */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.display-content {
  width: 100%;
  max-width: 300px; /* 400px * 0.75 = 300px */
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.display-slogan {
  text-align: center;
  z-index: 1;
}

.slogan-line1,
.slogan-line2 {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  font-size: 45px; /* 60px * 0.75 = 45px */
  font-weight: 400;
  color: #1a202c;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -1px;
}

.slogan-line1 {
  margin-bottom: 9.6px; /* 16px * 0.6 = 9.6px */
}

.slogan-line2 {
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 968px) {
  .login-wrapper {
    grid-template-columns: 1fr;
  }

  .login-right {
    display: none;
  }

  .login-left {
    padding: 40px 30px;
  }
}

@media (max-width: 640px) {
  .login-left {
    padding: 30px 20px;
  }

  .slogan-line1,
  .slogan-line2 {
    font-size: 32px;
  }
}
</style>
