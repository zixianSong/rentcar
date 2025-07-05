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
    password: '123456',
    database: 'rental platform'
};

// API：获取可用车辆
app.get('/available-vehicles', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const { startDate, endDate } = req.query;

        // 使用当前日期作为默认值
        const currentDate = new Date().toISOString().split('T')[0];
        const defaultStartDate = startDate || currentDate;
        const defaultEndDate = endDate || currentDate;

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
                AND ? BETWEEN i.start_date AND i.end_date
                AND ? BETWEEN i.start_date AND i.end_date
                AND NOT EXISTS (
                    SELECT 1
                    FROM rental_order ro
                    WHERE 
                        ro.vehicle_id = v.vehicle_id
                        AND ro.order_status IN ('Pending', 'Confirmed')
                        AND (
                            (ro.start_date < ? AND ro.end_date > ?) OR
                            (ro.start_date <= ? AND ro.end_date >= ?)
                        )
                );
        `;

        const [rows] = await connection.execute(query, [
            defaultStartDate, defaultEndDate,
            defaultEndDate, defaultStartDate,
            defaultEndDate, defaultStartDate
        ]);

        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//获取车辆总数
app.get('/total-vehicles', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT COUNT(*) as total FROM vehicle_info');
        await connection.end();
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching total vehicles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//获取可用车辆数
app.get('/available-vehicles-count', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT COUNT(*) as available FROM inventory WHERE status = "Available"');
        await connection.end();
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching available vehicles count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// API：获取订单列表
app.get('/orders', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM rental_order');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//获取订单总数
app.get('/total-orders', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT COUNT(*) as total FROM rental_order');
        await connection.end();
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching total orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//获取总收入
app.get('/total-revenue', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT SUM(actual_payment) as total_revenue FROM rental_order WHERE order_status = \'Completed\'');
        await connection.end();
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching total vehicles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//添加车辆
app.post('/vehicles', async (req, res) => {
    const { model, license_plate, seat_count, transmission_type, location_id, daily_rate, hourly_rate, image_url } = req.body;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();
        const [result] = await connection.execute(
            'INSERT INTO vehicle_info (model, license_plate, seat_count, transmission_type) VALUES (?, ?, ?, ?)',
            [model, license_plate, seat_count, transmission_type]
        );
        const vehicle_id = result.insertId;
        await connection.execute(
            'INSERT INTO inventory (vehicle_id, location_id, status) VALUES (?, ?, ?)',
            [vehicle_id, location_id, 'Available']
        );
        await connection.execute(
            'INSERT INTO vehicle_price (vehicle_id, daily_rate, hourly_rate) VALUES (?, ?, ?)',
            [vehicle_id, daily_rate, hourly_rate]
        );
        if (image_url) {
            await connection.execute(
                'INSERT INTO vehicle_image (vehicle_id, image_url) VALUES (?, ?)',
                [vehicle_id, image_url]
            );
        }
        await connection.commit();
        res.status(201).json({ message: 'Vehicle added successfully', vehicle_id });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error adding vehicle:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) await connection.end();
    }
});
// API：获取所有地点
app.get('/locations', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT location_id, province, city, district, detailed_address,longitude, latitude FROM location');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API：车辆调度（使用存储过程）
app.post('/vehicles/schedule', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // 从请求体中获取参数
        const {
            vehicleId,
            startDate, startTime,
            endDate, endTime,
            locationId,
            status
        } = req.body;

        // 获取当前用户ID（根据您的认证系统调整）
        const scheduledBy = req.user?.id || 1;

        // 调用存储过程
        const [result] = await connection.execute(
            `CALL sp_schedule_vehicle(?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                vehicleId,
                startDate, startTime,
                endDate, endTime,
                locationId,
                status,
                scheduledBy
            ]
        );

        // 存储过程成功执行后返回的消息
        const message = result[0][0]?.message || '车辆调度成功';

        res.json({
            success: true,
            message: message
        });

    } catch (error) {
        console.error('车辆调度失败:', error);

        // 分类处理不同的错误类型
        let statusCode = 500;
        let errorMessage = error.message;

        if (error.message.includes('找不到可用的车辆库存记录')) {
            statusCode = 404;
        } else if (error.message.includes('该时间段内车辆已被占用')) {
            statusCode = 409;
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    } finally {
        if (connection) await connection.end();
    }
});

// API：添加新地点
app.post('/locations', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();

        const { province, city, district, detailed_address, longitude, latitude } = req.body;

        const insertQuery = `
            INSERT INTO location (province, city, district, detailed_address, longitude, latitude)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.execute(insertQuery, [province, city, district, detailed_address, longitude, latitude]);

        await connection.commit();
        res.status(201).json({ success: true, message: '地点添加成功', location_id: result.insertId });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error adding location:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection) await connection.end();
    }
});

// 车辆状态分布
app.get('/vehicle-status-summary', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
      SELECT status, COUNT(*) AS count 
      FROM inventory 
      GROUP BY status
    `);
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching vehicle status summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 座位数分布
app.get('/seat-count-summary', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
      SELECT seat_count, COUNT(*) AS count 
      FROM vehicle_info 
      GROUP BY seat_count
    `);
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching seat count summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 变速器类型占比
app.get('/transmission-summary', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
      SELECT transmission_type, COUNT(*) AS count 
      FROM vehicle_info 
      GROUP BY transmission_type
    `);
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching transmission summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 各车型总收益（关联订单表）
app.get('/model-revenue-summary', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
      SELECT 
        vi.model,
        SUM(ro.actual_payment) AS total_revenue
      FROM 
        rental_order ro
        JOIN vehicle_info vi ON ro.vehicle_id = vi.vehicle_id
      WHERE 
        ro.order_status = 'Completed'
      GROUP BY 
        vi.model
      ORDER BY 
        total_revenue DESC
    `);
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching model revenue summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//获取库存表
app.get('/inventory', async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const { model, status, transmission, date_start, date_end } = req.query;
        let conditions = [];
        let values = [];

        if (model) {
            conditions.push('v.model = ?');
            values.push(model);
        }
        if (status) {
            conditions.push('i.status = ?');
            values.push(status);
        }
        if (transmission) {
            conditions.push('v.transmission_type = ?');
            values.push(transmission);
        }
        if (date_start && date_end) {
            conditions.push(`(
        STR_TO_DATE(CONCAT(i.start_date, ' ', i.start_time), '%Y-%m-%d %H:%i:%s') <= ?
        AND STR_TO_DATE(CONCAT(i.end_date, ' ', i.end_time), '%Y-%m-%d %H:%i:%s') >= ?
    )`);
            values.push(date_end, date_start);
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const [rows] = await connection.execute(`
            SELECT 
                i.inventory_id, i.vehicle_id, i.status,
                i.start_date, i.end_date, i.start_time, i.end_time,
                v.model, v.transmission_type,i.location_id
            FROM inventory i
            JOIN vehicle_info v ON i.vehicle_id = v.vehicle_id
            ${whereClause}
        `, values);

        res.json(rows);
    } catch (err) {
        console.error('获取库存数据失败:', err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await connection.end();
    }
});



// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);

});