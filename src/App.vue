<template>
  <div id="app">
    <!-- 导航菜单 -->
    <el-menu :default-active="activeRoute" mode="horizontal" class="nav-menu" @select="handleSelect">
      <el-menu-item index="/vehicles">可用车辆</el-menu-item>
      <el-menu-item index="/test">ECharts 测试</el-menu-item>
    </el-menu>

    <!-- 路由视图容器 -->
    <router-view></router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElMenu, ElMenuItem } from 'element-plus';

// 获取当前路由以高亮导航
const route = useRoute();
const activeRoute = computed(() => route.path);

// 导航选择处理（可选）
const handleSelect = (key) => {
  // 路由跳转由 vue-router 自动处理
};
</script>

<style scoped>
/* 基础样式 */
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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