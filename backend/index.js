const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 数据库连接配置
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Tnm123*', // 替换为你的 MySQL 密码
    database: 'rental_platform'
};

// API：获取可用车辆
app.get('/api/available-vehicles', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const { startDate, endDate } = req.query; // 用户选择的租车时间

        const query = `
      SELECT 
        v.vehicle_id,
        v.model,
        v.license_plate,
        v.seat_count,
        v.transmission_type,
        i.status,
        l.city,
        l.detailed_address,
        p.daily_rate,
        p.hourly_rate,
        vi.image_url
      FROM 
        vehicle_info v
        INNER JOIN inventory i ON v.vehicle_id = i.vehicle_id
        INNER JOIN location l ON i.location_id = l.location_id
        INNER JOIN vehicle_price p ON v.vehicle_id = p.vehicle_id
        LEFT JOIN vehicle_image vi ON v.vehicle_id = vi.vehicle_id
      WHERE 
        i.status = 'Available'
        AND NOT EXISTS (
          SELECT 1
          FROM rental_order ro
          WHERE 
            ro.vehicle_id = v.vehicle_id
            AND ro.order_status IN ('Pending', 'Confirmed')
            AND (
              ro.start_date <= ? AND ro.end_date >= ?
            )
        );
    `;

        const [rows] = await connection.execute(query, [endDate || '2025-12-31', startDate || '2025-06-16']);
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});