# Employee Management & Salary Analytics System (IP Final Project)

ระบบบริหารจัดการพนักงานและวิเคราะห์โครงสร้างเงินเดือน (Full-Stack MVC Web & Mobile Application)
พัฒนาด้วย **Node.js (Express.js)**, **MySQL** และ **React Native (Expo)**

---

## 📌 จุดเด่นและฟังก์ชันการทำงานหลัก

1. **ระบบยืนยันตัวตน (Authentication):**
   - รองรับการเข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบ (`admin` / `password123`)
   - ออก Mock JWT Token และป้องกันการเข้าถึงด้วย Status 401 เมื่อรหัสผ่านไม่ถูกต้อง

2. **ระบบจัดการข้อมูลพนักงาน (Employee CRUD):**
   - **Read:** แสดงรายชื่อพนักงานทั้งหมด ระบุชื่อ ตำแหน่ง สถานะการทำงาน และเงินเดือน
   - **Create:** ฟอร์มเพิ่มพนักงานใหม่ พร้อมระบบ **Client-side & Server-side Validation** (ตรวจสอบความถูกต้องและค่าว่าง ป้องกันการส่งข้อมูลผิดพลาด)
   - **Update (Status):** สลับสถานะพนักงานระหว่าง `Active` $\leftrightarrow$ `On Leave` ได้ทันที
   - **Delete:** ลบพนักงานออกจากระบบ โดยมีหน้าต่างยืนยันความปลอดภัย (**Confirmation Alert: "Are you sure?"**) ก่อนทำรายการเสมอ

3. **ระบบวิเคราะห์ฐานเงินเดือน (K-Means Salary Analytics):**
   - ใช้อัลกอริทึม **1D K-Means Clustering ($k=3$)** ประมวลผลจากฐานข้อมูลจริง
   - จัดกลุ่มพนักงานออกเป็น 3 ระดับ (**Tier 1, Tier 2, Tier 3**)
   - แสดงฐานเงินเดือนเฉลี่ย (Centroid) และจำนวนพนักงานในแต่ละคลัสเตอร์
   - มีระบบดักจับข้อผิดพลาด (ป้องกันเซิร์ฟเวอร์แครชหากข้อมูลพนักงานน้อยกว่า 3 คน)

4. **สถาปัตยกรรมแบบ MVC และระบบ Auto-Fallback:**
   - โครงสร้างโค้ด Backend แยกสัดส่วนชัดเจนตามมาตรฐาน MVC (`models`, `controllers`, `routes`)
   - มีระบบ **Graceful Fallback Mode** สลับไปใช้ In-Memory Mock Data ชั่วคราวอัตโนมัติ หากเครือข่ายบล็อกพอร์ตฐานข้อมูล MySQL (3306) เพื่อให้สามารถทดสอบระบบฝั่ง Frontend ได้อย่างราบรื่น

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
Std6730202131IPFinal2026/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # จัดการระบบ Login
│   │   └── employeeController.js   # จัดการ CRUD พนักงาน และ 1D K-Means Analytics
│   ├── models/
│   │   └── db.js                   # MySQL Connection Pool (mysql2/promise)
│   ├── routes/
│   │   └── api.js                  # กำหนดเส้นทาง API Endpoint ทั้งหมด
│   ├── package.json
│   └── server.js                   # จุดเริ่มต้น Backend Server (Express & CORS)
├── frontend/
│   ├── src/                        # โครงสร้างสำหรับ Expo Router
│   ├── App.js                      # UI & Logic ทั้งหมดของ React Native App
│   ├── app.json                    # การตั้งค่า Expo Application
│   └── package.json
├── .gitignore                      # กำหนดข้อยกเว้นไฟล์ที่ไม่ต้องการขึ้น Git
└── README.md                       # เอกสารแนะนำและคู่มือการใช้งาน
```

---

## 🚀 คู่มือการติดตั้งและเริ่มต้นใช้งาน

### สิ่งที่ต้องเตรียม (Prerequisites)
- [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป)
- npm (มาพร้อมกับ Node.js)
- แอปพลิเคชัน **Expo Go** บนสมาร์ตโฟน (หากต้องการทดสอบบนมือถือจริง)

---

### ขั้นตอนที่ 1: รัน Backend Server

1. เปิด Terminal หน้าต่างที่ 1 แล้วเข้าไปที่โฟลเดอร์ `backend`:
   ```bash
   cd backend
   ```
2. ติดตั้ง Dependencies (หากรันครั้งแรก):
   ```bash
   npm install
   ```
3. เริ่มต้นรันเซิร์ฟเวอร์:
   ```bash
   npm start
   ```
   *เซิร์ฟเวอร์จะเปิดทำงานที่ `http://localhost:3000`*

---

### ขั้นตอนที่ 2: รัน Frontend Application (React Native / Expo)

1. เปิด Terminal หน้าต่างที่ 2 แล้วเข้าไปที่โฟลเดอร์ `frontend`:
   ```bash
   cd frontend
   ```
2. ติดตั้ง Dependencies (หากรันครั้งแรก):
   ```bash
   npm install
   ```
3. เริ่มต้นรันแอป Expo:
   ```bash
   npm start
   ```
4. เลือกช่องทางการทดสอบ:
   - **ทดสอบบน Web Browser:** กดปุ่ม `w` บนคีย์บอร์ดใน Terminal
   - **ทดสอบบนโทรศัพท์มือถือจริง:** เปิดแอป **Expo Go** แล้วสแกน QR Code ที่แสดงบนหน้าจอ

> **💡 หมายเหตุสำหรับการทดสอบบนโทรศัพท์มือถือจริง:**  
> กรุณาแก้ไขบรรทัดที่ 20 ในไฟล์ `frontend/App.js` จาก `localhost` เป็น IPv4 ของคอมพิวเตอร์คุณ เช่น:
> ```javascript
> const API_URL = 'http://192.168.1.xxx:3000/api';
> ```
> *(คอมพิวเตอร์และโทรศัพท์มือถือต้องเชื่อมต่อ Wi-Fi เครือข่ายเดียวกัน)*

---

## 🔑 ข้อมูลสำหรับเข้าสู่ระบบ (Testing Credentials)

| รายการ | ค่าที่ใช้ทดสอบ |
| :--- | :--- |
| **Username** | `admin` |
| **Password** | `password123` |

---

## 📡 รายละเอียด API Endpoints

| Method | Path | หน้าที่การทำงาน | สถานะตอบกลับ (Status Code) |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/login` | เข้าสู่ระบบ | `200 OK` (สำเร็จ), `401 Unauthorized` (รหัสผ่านผิด) |
| **GET** | `/api/employees` | ดึงรายชื่อพนักงานทั้งหมด | `200 OK` |
| **POST** | `/api/employees` | เพิ่มพนักงานใหม่ | `201 Created`, `400 Bad Request` (ข้อมูลไม่ครบ) |
| **PUT** | `/api/employees/:id/status` | สลับสถานะ Active $\leftrightarrow$ On Leave | `200 OK`, `404 Not Found` |
| **DELETE** | `/api/employees/:id` | ลบพนักงาน | `200 OK`, `404 Not Found` |
| **GET** | `/api/employees/salary-clusters` | ประมวลผล K-Means วิเคราะห์เงินเดือน ($k=3$) | `200 OK`, `400 Bad Request` (คนน้อยกว่า 3) |

---

## 🛠️ ข้อมูลการเชื่อมต่อฐานข้อมูล (Database Configuration)

- **Database Type:** MySQL
- **Host:** `119.59.102.161` (Port: 3306)
- **Database:** `ip_std6730202131`
- **User:** `std6730202131`
