<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import AvailableVehicles from './AvailableVehicles.vue'; // 导入组件

// 保留 HelloWorld 的 props
defineProps({
  msg: {
    type: String,
    required: true,
  },
});
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
          >
            <el-sub-menu index="1">
              <template #title>
                <el-icon><DataLine /></el-icon>
                <span>数据看板</span>
              </template>
              <el-menu-item index="1-1">运营概览</el-menu-item>
              <el-menu-item index="1-2">车辆分析</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="2">
              <template #title>
                <el-icon><Van /></el-icon>
                <span>车辆管理</span>
              </template>
              <el-menu-item index="2-1">车辆列表</el-menu-item>
              <el-menu-item index="2-2">车辆调度</el-menu-item>
              <el-menu-item index="2-3">维护记录</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="3">
              <template #title>
                <el-icon><Document /></el-icon>
                <span>订单管理</span>
              </template>
              <el-menu-item index="3-1">订单列表</el-menu-item>
              <el-menu-item index="3-2">订单统计</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>

        <!-- 主内容区 -->
        <el-container class="main-container">
          <el-main class="app-main">
            <div class="page-container">
              <h1 class="page-title">{{ msg }}</h1>
              <div class="content-box">
                <AvailableVehicles /> <!-- 嵌入可租车辆组件 -->
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
  overflow: hidden;
}

.layout-container {
  height: 100%;
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
  height: 100%;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

/* 主内容区样式 */
.main-container {
  flex-direction: column;
}

.app-main {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 100px);
}

.page-container {
  background: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.page-title {
  font-size: 20px;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.content-box {
  min-height: 500px;
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
</style>