<template>
  <div id="app">
    <el-menu :default-active="activeRoute" mode="horizontal" class="nav-menu" @select="handleSelect">
      <el-menu-item index="/">首页</el-menu-item>
    </el-menu>
    <router-view></router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElMenu, ElMenuItem } from 'element-plus';

const route = useRoute();
const activeRoute = computed(() => route.path);

const handleSelect = (key) => {};
</script>

<style scoped>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  padding: 20px;
}

.nav-menu {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  justify-content: center;
}

.nav-menu .el-menu-item {
  font-weight: 600;
  color: #2c3e50;
  padding: 0 20px;
}

.nav-menu .el-menu-item.is-active {
  color: #42b983;
  background: #e6f7f0;
  border-bottom: none;
}

.nav-menu .el-menu-item:hover {
  background: #f0f0f0;
}
</style>