<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router'; // 用于路由判断

// 保留 HelloWorld 的 props
defineProps({
  msg: {
    type: String,
    required: true,
  },
});

const route = useRoute();
</script>

<template>
  <div class="app-container">
    <el-container class="layout-container">
      <!-- 顶部导航栏 -->
      <el-header class="app-header">
        <div class="header-left">
          <div class="logo">
            <span class="logo-text">企业租车平台</span>
            <span class="version">v2.0</span>
          </div>
        </div>
        <div class="header-right">
          <div class="user-info">
            <el-icon class="notification-icon"><Bell /></el-icon>
            <el-avatar :size="36" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <span class="username">管理员</span>
          </div>
        </div>
      </el-header>

      <el-container class="content-container">
        <!-- 侧边菜单 -->
        <el-aside width="220px" class="app-sidebar">
          <el-menu
              active-text-color="#409EFF"
              background-color="#304156"
              text-color="#bfcbd9"
              class="sidebar-menu"
              :default-active="route.path"
          >
            <el-sub-menu index="1">
              <template #title>
                <el-icon><DataLine /></el-icon>
                <span>数据看板</span>
              </template>
              <el-menu-item index="/dashboard/1-1">运营概览</el-menu-item>
              <el-menu-item index="/dashboard/1-2">车辆分析</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="2">
              <template #title>
                <el-icon><Van /></el-icon>
                <span>车辆管理</span>
              </template>
              <el-menu-item index="/">车辆列表</el-menu-item>
              <el-menu-item index="/schedule">车辆调度</el-menu-item>
              <el-menu-item index="/maintenance">维护记录</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="3">
              <template #title>
                <el-icon><Document /></el-icon>
                <span>订单管理</span>
              </template>
              <el-menu-item index="/orders">订单列表</el-menu-item>
              <el-menu-item index="/order-stats">订单统计</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>

        <!-- 主内容区 -->
        <el-container class="main-container">
          <el-main class="app-main">
            <div class="page-container">
              <h1 class="page-title">{{ msg }}</h1>
              <div class="content-box">
                <router-view /> <!-- 动态渲染子组件 -->
              </div>
            </div>
          </el-main>
          <el-footer class="app-footer">
            <div class="footer-content">
              © 2023 企业租车平台 - 技术支持
            </div>
          </el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
/* 基础布局样式 */
.app-container {
  height: 100vh;
  width: 100vw; /* 确保宽度铺满 */
  overflow: hidden;
}

.layout-container {
  height: 100%;
  display: flex;
  flex-direction: column; /* 垂直排列子元素 */
}

/* 顶部导航栏样式 */
.app-header {
  height: 60px;
  background-color: #2d3a4b;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: baseline;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  margin-right: 10px;
}

.version {
  font-size: 12px;
  color: #909399;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.notification-icon {
  font-size: 18px;
  margin-right: 20px;
  color: #bfcbd9;
}

.username {
  margin-left: 10px;
  font-size: 14px;
}

/* 侧边栏样式 */
.app-sidebar {
  background-color: #304156;
  transition: width 0.3s;
  min-height: 0;
  flex: 0 0 220px;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

/* 主内容区样式 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.app-main {
  padding: 20px;
  background-color: #f0f2f5;
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.page-container {
  background: white;
  border-radius: 4px;
  padding: 20px;
  height: 100%;
}

.page-title {
  font-size: 20px;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.content-box {
  min-height: 100%;
  height: auto;
}

/* 页脚样式 */
.app-footer {
  height: 40px;
  background-color: white;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-top: 1px solid #e6e6e6;
  flex-shrink: 0;
}

.footer-content {
  display: flex;
  align-items: center;
}

/* 图标大小统一控制 */
.el-icon {
  font-size: 16px;
  vertical-align: middle;
  margin-right: 8px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .app-sidebar {
    width: 64px !important;
  }

  .logo-text {
    display: none;
  }

  .version {
    display: none;
  }
}

@media (max-width: 768px) {
  .app-header {
    height: 50px;
    padding: 0 10px;
  }

  .app-main {
    padding: 10px;
  }

  .page-container {
    padding: 10px;
  }

  .username {
    display: none;
  }
}
</style>