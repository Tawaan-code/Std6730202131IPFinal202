import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  RefreshControl,
  KeyboardAvoidingView,
} from 'react-native';

// กำหนด URL ของ Backend API
// หากทดสอบบนโทรศัพท์มือถือจริง ให้เปลี่ยน 'localhost' เป็น IP ของคอมพิวเตอร์ (เช่น 'http://192.168.1.xxx:3000/api')
const API_URL = 'http://localhost:3000/api';

export default function App() {
  // 1. Navigation State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  // 2. Login States
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 3. Employees CRUD States
  const [employees, setEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add Employee Form States
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // 4. K-Means Analytics States
  const [clusters, setClusters] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // โหลดข้อมูลพนักงานเมื่อเข้าสู่ระบบสำเร็จ
  useEffect(() => {
    if (isLoggedIn) {
      fetchEmployees();
    }
  }, [isLoggedIn]);

  // ==========================================
  // API Call: Authentication (Login / Logout)
  // ==========================================
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอก Username และ Password ให้ครบถ้วน');
      return;
    }

    try {
      setIsLoggingIn(true);
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAuthToken(data.token);
        setIsLoggedIn(true);
        // เคลียร์รหัสผ่านเพื่อความปลอดภัย
        setPassword('');
      } else {
        Alert.alert('เข้าสู่ระบบไม่สำเร็จ', data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'การเชื่อมต่อล้มเหลว',
        'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Backend กำลังรันอยู่ที่ ' + API_URL
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthToken(null);
    setEmployees([]);
    setClusters([]);
    setName('');
    setPosition('');
    setSalary('');
  };

  // ==========================================
  // API Call: Employee CRUD
  // ==========================================
  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      const response = await fetch(`${API_URL}/employees`);
      const data = await response.json();

      if (response.ok) {
        setEmployees(Array.isArray(data) ? data : []);
      } else {
        Alert.alert('ผิดพลาด', data.message || 'ไม่สามารถดึงข้อมูลพนักงานได้');
      }
    } catch (error) {
      console.error('Fetch employees error:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อดึงข้อมูลพนักงาน');
    } finally {
      setIsLoadingEmployees(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchEmployees();
  };

  // เพิ่มพนักงานใหม่ (พร้อม Client-side validation)
  const handleAddEmployee = async () => {
    // Client-side Validation: ตรวจสอบความถูกต้องก่อนยิง API
    if (!name.trim() || !position.trim() || !salary.trim()) {
      Alert.alert('กรอกข้อมูลไม่ครบ', 'กรุณากรอก Name, Position และ Salary ให้ครบถ้วน');
      return;
    }

    const numericSalary = Number(salary);
    if (isNaN(numericSalary) || numericSalary <= 0) {
      Alert.alert('ข้อมูลไม่ถูกต้อง', 'Salary ต้องเป็นตัวเลขจำนวนเต็มบวก');
      return;
    }

    try {
      setIsAdding(true);
      const response = await fetch(`${API_URL}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          position: position.trim(),
          salary: numericSalary,
          status: 'Active',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('สำเร็จ', 'เพิ่มพนักงานใหม่เรียบร้อยแล้ว');
        // ล้างช่อง input
        setName('');
        setPosition('');
        setSalary('');
        // รีเฟรชรายการพนักงาน
        fetchEmployees();
      } else {
        Alert.alert('ผิดพลาด', data.message || 'ไม่สามารถเพิ่มพนักงานได้');
      }
    } catch (error) {
      console.error('Add employee error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อเพิ่มพนักงาน');
    } finally {
      setIsAdding(false);
    }
  };

  // สลับสถานะพนักงาน (Active <-> On Leave)
  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${API_URL}/employees/${id}/status`, {
        method: 'PUT',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // อัปเดตใน state โดยตรงเพื่อให้ UI อัปเดตทันที
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === id ? { ...emp, status: data.status } : emp))
        );
      } else {
        Alert.alert('ผิดพลาด', data.message || 'ไม่สามารถเปลี่ยนสถานะได้');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อเปลี่ยนสถานะ');
    }
  };

  // ลบพนักงาน (มี Alert.alert ยืนยันก่อนเสมอ)
  const confirmDelete = (id, employeeName) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete "${employeeName}"?`);
      if (confirmed) {
        executeDelete(id);
      }
    } else {
      Alert.alert(
        'Are you sure?',
        `ต้องการลบข้อมูลพนักงาน "${employeeName}" ใช่หรือไม่?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => executeDelete(id),
          },
        ]
      );
    }
  };

  const executeDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/employees/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('สำเร็จ', 'ลบข้อมูลพนักงานเรียบร้อยแล้ว');
        // นำออกจาก state
        setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      } else {
        Alert.alert('ผิดพลาด', data.message || 'ไม่สามารถลบข้อมูลพนักงานได้');
      }
    } catch (error) {
      console.error('Delete employee error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อลบข้อมูล');
    }
  };

  // ==========================================
  // API Call: K-Means Analytics (Phase 2)
  // ==========================================
  const handleAnalyzeSalary = async () => {
    try {
      setIsAnalyzing(true);
      const response = await fetch(`${API_URL}/employees/salary-clusters`);
      const data = await response.json();

      if (response.ok && data.success) {
        setClusters(data.clusters || []);
      } else {
        Alert.alert('วิเคราะห์ไม่สำเร็จ', data.message || 'ไม่สามารถวิเคราะห์ข้อมูลได้');
      }
    } catch (error) {
      console.error('Analyze salary error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อวิเคราะห์เงินเดือน');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ==========================================
  // 1. หน้า LoginScreen
  // ==========================================
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.loginContent}
        >
          <View style={styles.loginCard}>
            <View style={styles.loginHeader}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>HR</Text>
              </View>
              <Text style={styles.loginTitle}>HR Management</Text>
              <Text style={styles.loginSubtitle}>ระบบบริหารจัดการพนักงานและวิเคราะห์เงินเดือน</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="กรอก username (admin)"
                placeholderTextColor="#94a3b8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="กรอก password (password123)"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isLoggingIn && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoggingIn}
              activeOpacity={0.8}
            >
              {isLoggingIn ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginHint}>
              <Text style={styles.hintText}>ทดสอบด้วย: admin / password123</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // 2. หน้า DashboardScreen
  // ==========================================
  return (
    <SafeAreaView style={styles.dashboardContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <View>
          <Text style={styles.navTitle}>Employee Dashboard</Text>
          <Text style={styles.navSubtitle}>จัดการข้อมูลพนักงานและผลวิเคราะห์</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {/* ส่วนที่ 1: ฟอร์มเพิ่มพนักงาน (Add Employee) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>+ เพิ่มพนักงานใหม่</Text>

          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.inputLabel}>ชื่อ-นามสกุล (Name) *</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น สมชาย ใจดี"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.inputLabel}>ตำแหน่ง (Position) *</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น Frontend Dev"
                placeholderTextColor="#94a3b8"
                value={position}
                onChangeText={setPosition}
              />
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.inputLabel}>เงินเดือน (Salary) *</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น 45000"
              placeholderTextColor="#94a3b8"
              value={salary}
              onChangeText={setSalary}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[styles.addButton, isAdding && styles.buttonDisabled]}
            onPress={handleAddEmployee}
            disabled={isAdding}
            activeOpacity={0.8}
          >
            {isAdding ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.addButtonText}>บันทึกข้อมูลพนักงาน</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ส่วนที่ 2: K-Means Analytics Section (Phase 2) */}
        <View style={styles.sectionCard}>
          <View style={styles.analyticsHeader}>
            <View>
              <Text style={styles.sectionTitle}>Salary Structure Analytics</Text>
              <Text style={styles.sectionSubtitle}>จัดกลุ่มฐานเงินเดือนด้วย 1D K-Means (k=3)</Text>
            </View>

            <TouchableOpacity
              style={[styles.analyticsButton, isAnalyzing && styles.buttonDisabled]}
              onPress={handleAnalyzeSalary}
              disabled={isAnalyzing}
              activeOpacity={0.8}
            >
              {isAnalyzing ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.analyticsButtonText}>Analyze Salary Structure</Text>
              )}
            </TouchableOpacity>
          </View>

          {isAnalyzing && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text style={styles.loadingText}>กำลังคำนวณโมเดล K-Means...</Text>
            </View>
          )}

          {clusters.length > 0 && !isAnalyzing && (
            <View style={styles.clustersGrid}>
              {clusters.map((cluster, index) => {
                const badgeColor =
                  index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : '#10b981';
                return (
                  <View key={index} style={[styles.clusterCard, { borderTopColor: badgeColor }]}>
                    <View style={styles.clusterBadgeRow}>
                      <Text style={[styles.clusterGroupText, { color: badgeColor }]}>
                        {cluster.group}
                      </Text>
                      <View style={[styles.countBadge, { backgroundColor: badgeColor + '20' }]}>
                        <Text style={[styles.countBadgeText, { color: badgeColor }]}>
                          {cluster.count} คน
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.clusterLabel}>ฐานเงินเดือนเฉลี่ย (Centroid):</Text>
                    <Text style={styles.clusterCentroid}>
                      ฿{Number(cluster.centroid).toLocaleString()}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ส่วนที่ 3: รายชื่อพนักงาน (Employees List) */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            รายชื่อพนักงานทั้งหมด ({employees.length} คน)
          </Text>
          {isLoadingEmployees && <ActivityIndicator size="small" color="#4f46e5" />}
        </View>

        {employees.length === 0 && !isLoadingEmployees ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>ยังไม่มีข้อมูลพนักงานในระบบ</Text>
          </View>
        ) : (
          employees.map((item) => {
            const isActive = item.status === 'Active';
            return (
              <View key={item.id} style={styles.employeeCard}>
                <View style={styles.employeeHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.employeeName}>{item.name}</Text>
                    <Text style={styles.employeePosition}>{item.position}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      isActive ? styles.statusActive : styles.statusOnLeave,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isActive ? styles.statusTextActive : styles.statusTextOnLeave,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.salaryRow}>
                  <Text style={styles.salaryLabel}>เงินเดือน:</Text>
                  <Text style={styles.salaryValue}>
                    ฿{Number(item.salary).toLocaleString()}
                  </Text>
                </View>

                {/* ปุ่ม Action (Toggle Status & Delete) */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.toggleBtn]}
                    onPress={() => handleToggleStatus(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.toggleBtnText}>
                      {isActive ? 'ตั้งค่าเป็น On Leave' : 'ตั้งค่าเป็น Active'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => confirmDelete(item.id, item.name)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteBtnText}>ลบ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// Stylesheet
// ==========================================
const styles = StyleSheet.create({
  // Login Styles
  loginContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
  },
  loginContent: {
    padding: 24,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoBadgeText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  loginSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#1e293b',
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  loginHint: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#64748b',
  },

  // Dashboard Styles
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  navBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  navSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  logoutButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  formField: {
    flex: 1,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },

  // Analytics Section
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analyticsButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  analyticsButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748b',
  },
  clustersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  clusterCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderTopWidth: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clusterBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clusterGroupText: {
    fontSize: 15,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  clusterLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  clusterCentroid: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },

  // Employees List
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  employeeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  employeePosition: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusOnLeave: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#15803d',
  },
  statusTextOnLeave: {
    color: '#b45309',
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    marginBottom: 12,
  },
  salaryLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  salaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleBtn: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  deleteBtn: {
    flex: 0.4,
    backgroundColor: '#fee2e2',
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
});
