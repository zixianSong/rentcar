<script setup>
import {ref, onMounted} from 'vue'
import axios from 'axios'
import {ElMessage} from 'element-plus'

const orderList = ref([])
const loading = ref(false)

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/orders') // 请根据实际端口修改
    orderList.value = res.data
  } catch (error) {
    console.error('订单获取失败:', error)
    ElMessage.error('订单列表加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="order-list">
    <el-card>
      <h2 style="margin-bottom: 20px;">订单列表</h2>

      <el-table
          :data="orderList"
          style="width: 100%"
          v-loading="loading"
          border
          height="600"
      >
        <el-table-column prop="order_id" label="订单编号" width="100"/>
        <el-table-column prop="vehicle_id" label="车辆ID" width="100"/>
        <el-table-column prop="user_id" label="用户ID" width="100"/>

        <el-table-column label="起始日期">
          <template #default="{ row }">
            {{ new Date(row.start_date).toLocaleDateString() }}
          </template>
        </el-table-column>

        <el-table-column prop="start_time" label="起始时间"/>

        <el-table-column label="结束日期">
          <template #default="{ row }">
            {{ new Date(row.end_date).toLocaleDateString() }}
          </template>
        </el-table-column>

        <el-table-column prop="end_time" label="结束时间"/>
        <el-table-column prop="pickup_location" label="取车点"/>
        <el-table-column prop="return_location" label="还车点"/>

        <el-table-column prop="total_amount" label="总金额"/>
        <el-table-column prop="discount_amount" label="优惠金额"/>
        <el-table-column prop="actual_payment" label="实付金额"/>

        <el-table-column prop="order_status" label="订单状态"/>
        <el-table-column prop="settlement_terms" label="结算方式"/>

        <el-table-column label="更新时间">
          <template #default="{ row }">
            {{ new Date(row.last_updated).toLocaleString() }}
          </template>
        </el-table-column>

        <el-table-column prop="cancel_reason" label="取消原因"/>
        <el-table-column prop="remarks" label="备注"/>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.order-list {
  padding: 20px;
}
</style>
