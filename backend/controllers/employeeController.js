const db = require('../models/db');

// In-Memory Fallback Data (ใช้สำรองกรณีเครือข่ายบล็อกพอร์ต 3306 หรือยังไม่ได้ต่อ VPN มหาวิทยาลัย)
let mockEmployees = [
  { id: '1', name: 'Somchai Prasert', position: 'Frontend Developer', status: 'Active', salary: 45000 },
  { id: '2', name: 'Wipawan Srichan', position: 'UI/UX Designer', status: 'Active', salary: 50000 },
  { id: '3', name: 'Kittisak Sukjai', position: 'Backend Developer', status: 'On Leave', salary: 55000 },
  { id: '4', name: 'Thanaporn Wongsuwan', position: 'Project Manager', status: 'Active', salary: 70000 },
  { id: '5', name: 'Chatchai Bunrod', position: 'DevOps Engineer', status: 'On Leave', salary: 60000 },
];
let nextMockId = 6;

const isDbConnectionError = (error) => {
  return (
    error &&
    (error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'PROTOCOL_CONNECTION_LOST' ||
      (typeof error.message === 'string' && error.message.includes('ETIMEDOUT')))
  );
};

// ฟังก์ชันคำนวณ 1D K-Means (k=3)
function kMeans1D(values, k = 3, maxIterations = 100) {
  if (values.length < k) {
    throw new Error('Not enough data points for K-Means');
  }

  // เรียงข้อมูลเพื่อกำหนด initial centroids เริ่มต้นแบบกระจายตาม percentile
  const sorted = [...values].sort((a, b) => a - b);
  let centroids = [];
  for (let i = 0; i < k; i++) {
    const idx = Math.floor((i / (k - 1)) * (sorted.length - 1));
    centroids.push(sorted[idx]);
  }

  let clusters = Array.from({ length: k }, () => []);

  for (let iter = 0; iter < maxIterations; iter++) {
    clusters = Array.from({ length: k }, () => []);

    // กำหนดแต่ละจุดข้อมูลไปยัง centroid ที่ใกล้ที่สุด
    for (const val of values) {
      let minDistance = Infinity;
      let clusterIndex = 0;
      for (let j = 0; j < k; j++) {
        const dist = Math.abs(val - centroids[j]);
        if (dist < minDistance) {
          minDistance = dist;
          clusterIndex = j;
        }
      }
      clusters[clusterIndex].push(val);
    }

    // คำนวณ centroids ใหม่จากค่าเฉลี่ยของแต่ละคลัสเตอร์
    let converged = true;
    const newCentroids = [];
    for (let j = 0; j < k; j++) {
      if (clusters[j].length > 0) {
        const sum = clusters[j].reduce((acc, curr) => acc + curr, 0);
        const mean = sum / clusters[j].length;
        if (Math.abs(mean - centroids[j]) > 0.001) {
          converged = false;
        }
        newCentroids.push(mean);
      } else {
        newCentroids.push(centroids[j]);
      }
    }

    centroids = newCentroids;
    if (converged) break;
  }

  // นำผลลัพธ์มาเรียงตาม centroid จากน้อยไปมาก แล้วจัดกลุ่ม Tier 1, Tier 2, Tier 3
  const clusterData = centroids.map((c, idx) => ({
    centroid: c,
    count: clusters[idx].length,
  }));

  clusterData.sort((a, b) => a.centroid - b.centroid);

  return clusterData.map((item, idx) => ({
    group: `Tier ${idx + 1}`,
    centroid: Math.round(item.centroid * 100) / 100,
    count: item.count,
  }));
}

// 1. [GET] /api/employees - ดึงข้อมูลพนักงานทั้งหมด
const getAllEmployees = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('getAllEmployees DB error:', error.message);

    // กรณีเชื่อมต่อ MySQL ล้มเหลว (เช่น ETIMEDOUT เพราะเครือข่ายบล็อกพอร์ต 3306)
    // สลับมาใช้ In-Memory Mock Data เพื่อให้ Frontend ไม่พัง
    if (isDbConnectionError(error)) {
      console.warn('⚠️ [Fallback] ใช้ข้อมูลสำรอง In-Memory Mock Employees แทน');
      return res.status(200).json(mockEmployees);
    }

    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน',
      error: error.message,
    });
  }
};

// 2. [POST] /api/employees - เพิ่มพนักงานใหม่ (เช็ค !name || !position || !salary)
const addEmployee = async (req, res) => {
  try {
    const { name, position, salary, status } = req.body || {};

    const isNameEmpty = !name || typeof name !== 'string' || name.trim() === '';
    const isPositionEmpty = !position || typeof position !== 'string' || position.trim() === '';
    const isSalaryEmpty =
      salary === undefined ||
      salary === null ||
      salary === '' ||
      isNaN(Number(salary)) ||
      Number(salary) <= 0;

    if (isNameEmpty || isPositionEmpty || isSalaryEmpty) {
      return res.status(400).json({
        success: false,
        message: 'name, position และ salary จำเป็นต้องกรอกและห้ามเว้นว่าง (salary ต้องเป็นตัวเลขบวก)',
      });
    }

    const employeeStatus = status === 'On Leave' ? 'On Leave' : 'Active';

    try {
      const [result] = await db.query(
        'INSERT INTO employees (name, position, salary, status) VALUES (?, ?, ?, ?)',
        [String(name).trim(), String(position).trim(), Number(salary), employeeStatus]
      );

      return res.status(201).json({
        success: true,
        message: 'เพิ่มข้อมูลพนักงานสำเร็จ',
        id: result.insertId,
        employee: {
          id: result.insertId,
          name: String(name).trim(),
          position: String(position).trim(),
          salary: Number(salary),
          status: employeeStatus,
        },
      });
    } catch (dbError) {
      if (isDbConnectionError(dbError)) {
        console.warn('⚠️ [Fallback] เพิ่มข้อมูลลงใน In-Memory Mock Employees');
        const newMock = {
          id: String(nextMockId++),
          name: String(name).trim(),
          position: String(position).trim(),
          salary: Number(salary),
          status: employeeStatus,
        };
        mockEmployees.push(newMock);
        return res.status(201).json({
          success: true,
          message: 'เพิ่มข้อมูลพนักงานสำเร็จ (Mock Mode)',
          id: newMock.id,
          employee: newMock,
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('addEmployee error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มพนักงาน',
      error: error.message,
    });
  }
};

// 3. [PUT] /api/employees/:id/status - สลับสถานะพนักงาน (Active <-> On Leave)
const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      // SELECT ดู status เดิมก่อน
      const [rows] = await db.query('SELECT status FROM employees WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `ไม่พบพนักงานรหัส ${id}`,
        });
      }

      const currentStatus = rows[0].status;
      const newStatus = currentStatus === 'Active' ? 'On Leave' : 'Active';

      // UPDATE สถานะใหม่
      await db.query('UPDATE employees SET status = ? WHERE id = ?', [newStatus, id]);

      return res.status(200).json({
        success: true,
        message: 'สลับสถานะพนักงานสำเร็จ',
        id,
        previousStatus: currentStatus,
        status: newStatus,
      });
    } catch (dbError) {
      if (isDbConnectionError(dbError)) {
        console.warn('⚠️ [Fallback] สลับสถานะใน In-Memory Mock Employees');
        const emp = mockEmployees.find((e) => String(e.id) === String(id));
        if (!emp) {
          return res.status(404).json({ success: false, message: `ไม่พบพนักงานรหัส ${id}` });
        }
        emp.status = emp.status === 'Active' ? 'On Leave' : 'Active';
        return res.status(200).json({
          success: true,
          message: 'สลับสถานะพนักงานสำเร็จ (Mock Mode)',
          id,
          status: emp.status,
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('toggleStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสลับสถานะพนักงาน',
      error: error.message,
    });
  }
};

// 4. [DELETE] /api/employees/:id - ลบพนักงาน
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const [result] = await db.query('DELETE FROM employees WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: `ไม่พบพนักงานรหัส ${id}`,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'ลบข้อมูลพนักงานสำเร็จ',
        id,
      });
    } catch (dbError) {
      if (isDbConnectionError(dbError)) {
        console.warn('⚠️ [Fallback] ลบข้อมูลใน In-Memory Mock Employees');
        const index = mockEmployees.findIndex((e) => String(e.id) === String(id));
        if (index === -1) {
          return res.status(404).json({ success: false, message: `ไม่พบพนักงานรหัส ${id}` });
        }
        mockEmployees.splice(index, 1);
        return res.status(200).json({
          success: true,
          message: 'ลบข้อมูลพนักงานสำเร็จ (Mock Mode)',
          id,
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('deleteEmployee error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบพนักงาน',
      error: error.message,
    });
  }
};

// 5. [GET] /api/employees/salary-clusters - คำนวณ 1D K-Means (k=3)
const getSalaryClusters = async (req, res) => {
  try {
    let salaries = [];

    try {
      const [rows] = await db.query('SELECT salary FROM employees');
      salaries = rows.map((r) => Number(r.salary)).filter((s) => !isNaN(s));
    } catch (dbError) {
      if (isDbConnectionError(dbError)) {
        console.warn('⚠️ [Fallback] คำนวณ K-Means จาก In-Memory Mock Employees');
        salaries = mockEmployees.map((e) => Number(e.salary)).filter((s) => !isNaN(s));
      } else {
        throw dbError;
      }
    }

    // ดักจับ error กรณีพนักงานน้อยกว่า 3 คน
    if (salaries.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'จำนวนพนักงานต้องมีอย่างน้อย 3 คนเพื่อจัดกลุ่ม K-Means',
      });
    }

    const clusters = kMeans1D(salaries, 3);

    return res.status(200).json({
      success: true,
      clusters,
    });
  } catch (error) {
    console.error('getSalaryClusters error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการคำนวณ K-Means',
      error: error.message,
    });
  }
};

module.exports = {
  getAllEmployees,
  addEmployee,
  toggleStatus,
  deleteEmployee,
  getSalaryClusters,
};
