const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 设置宽松 CSP（开发环境）
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: http://localhost:3000; connect-src 'self' http://localhost:3000; object-src 'none';");
    next();
});

// 数据库连接配置
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Tnm123*',
    database: 'rental_platform'
};

// API：获取可用车辆
app.get('/available-vehicles', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const { startDate, endDate } = req.query;

        const query = `
                 SELECT 
                     v.vehicle_id,
                     v.model,
                     v.license_plate,
                     v.seat_count,
                     v.transmission_type,
                     i.status,
                     l.province,
                     l.city,
                     l.district,
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
                                 (ro.start_date < i.end_date AND ro.end_date > i.start_date)
                                 OR (ro.start_date <= ? AND ro.end_date >= ?)
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

// API：获取所有地点
app.get('/locations', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT location_id, province, city, district, detailed_address FROM location');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API：车辆调度
app.post('/vehicles/schedule', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();

        const { vehicleId, startDate, startTime, endDate, endTime, locationId, status } = req.body;

        const startDateTime = `${startDate} ${startTime}`;
        const endDateTime = `${endDate} ${endTime}`;

        const conflictQuery = `
                 SELECT 1
                 FROM inventory i
                 WHERE i.vehicle_id = ?
                 AND (
                     (i.start_date < ? AND i.end_date > ?)
                     OR EXISTS (
                         SELECT 1 FROM rental_order ro
                         WHERE ro.vehicle_id = i.vehicle_id
                         AND ro.order_status IN ('Pending', 'Confirmed')
                         AND (
                             (ro.start_date < ? AND ro.end_date > ?)
                             OR (ro.start_date <= ? AND ro.end_date >= ?)
                         )
                     )
                 ) AND i.status != 'Available';
             `;
        const [conflict] = await connection.execute(conflictQuery, [vehicleId, endDateTime, startDateTime, endDateTime, startDateTime, endDateTime, startDateTime]);

        if (conflict.length > 0) {
            throw new Error('该时间段内车辆已被占用或调度');
        }

        const updateQuery = `
                 UPDATE inventory 
                 SET status = ?, start_date = ?, end_date = ?, start_time = ?, end_time = ?, location_id = ?
                 WHERE vehicle_id = ? AND status = 'Available';
             `;
        const [updateResult] = await connection.execute(updateQuery, [status, startDate, endDate, startTime, endTime, locationId, vehicleId]);

        if (updateResult.affectedRows === 0) {
            throw new Error('车辆不可用或更新失败');
        }

        const logQuery = `
                 INSERT INTO schedule_log (vehicle_id, location_id, start_date, end_date, status, scheduled_by)
                 VALUES (?, ?, ?, ?, ?, 1);
             `;
        await connection.execute(logQuery, [vehicleId, locationId, startDate, endDate, status]);

        await connection.commit();
        res.json({ success: true, message: '车辆调度成功' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error scheduling vehicle:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});