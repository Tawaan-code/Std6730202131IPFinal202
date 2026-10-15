const mysql = require('mysql2/promise');

// สร้าง Connection Pool ไปยัง MySQL Database
const pool = mysql.createPool({
  host: '119.59.102.161',
  user: 'std6730202131',
  password: 'A2r!yHp0',
  database: 'ip_std6730202131',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 3000, // ลด Timeout เหลือ 3 วินาที เพื่อไม่ให้เซิร์ฟเวอร์ค้างนาน
});

module.exports = pool;
