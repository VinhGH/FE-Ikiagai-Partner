import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/useAuthStore';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';
import Input from '../../../components/shared/Input';
import Button from '../../../components/shared/Button';
import StepIndicator from '../../../components/shared/StepIndicator';
import { router } from 'expo-router';

const STEPS = ['Cá nhân', 'Phương tiện', 'Ngân hàng', 'Xác minh'];

export default function DriverRegisterScreen() {
  const registerSuccess = useAuthStore((state) => state.registerSuccess);
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Personal Info
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idNumber, setIdNumber] = useState('');

  // Step 2: Vehicle & License
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<'moto' | 'car'>('moto');
  const [licensePlate, setLicensePlate] = useState('');

  // Step 3: Bank Details
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // Step 4: Documents Upload Status (Simulated)
  const [docs, setDocs] = useState({
    portrait: false,
    idFront: false,
    idBack: false,
    licenseFront: false,
  });

  const handleNext = () => {
    if (currentStep === 1) {
      if (!fullName || !phone || !email || !idNumber) {
        Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin cá nhân');
        return;
      }
      if (!email.includes('@')) {
        Alert.alert('Thông báo', 'Email không hợp lệ');
        return;
      }
    } else if (currentStep === 2) {
      if (!licenseNumber || !licensePlate) {
        Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin bằng lái và phương tiện');
        return;
      }
    } else if (currentStep === 3) {
      if (!bankName || !accountNumber || !accountHolder) {
        Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin tài khoản ngân hàng');
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const toggleDoc = (key: keyof typeof docs) => {
    setDocs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleRegister = () => {
    const allUploaded = Object.values(docs).every((val) => val === true);
    if (!allUploaded) {
      Alert.alert('Thông báo', 'Vui lòng tải lên/xác thực đầy đủ hồ sơ giấy tờ');
      return;
    }

    // Đăng ký thành công giả lập
    registerSuccess(
      'mock_token_driver_pending_123',
      {
        id: 'drv_' + Date.now(),
        name: fullName,
        phone,
        email,
        role: 'driver',
        status: 'pending',
        vehicle: { type: vehicleType, plate: licensePlate },
      },
      'driver'
    );
  };

  // Render Step Content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân tài xế</Text>
            <Input
              label="Họ và tên (có dấu)"
              placeholder="Ví dụ: NGUYỄN VĂN A"
              value={fullName}
              onChangeText={setFullName}
            />
            <Input
              label="Số điện thoại di động"
              placeholder="Nhập số điện thoại đăng ký"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Input
              label="Địa chỉ Email"
              placeholder="vi-du@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Input
              label="Số CMND/CCCD"
              placeholder="Nhập số CMND hoặc CCCD 12 số"
              value={idNumber}
              onChangeText={setIdNumber}
              keyboardType="numeric"
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Giấy phép lái xe & Phương tiện</Text>
            
            <Input
              label="Số Giấy phép lái xe (GPLX)"
              placeholder="Nhập số bằng lái xe của bạn"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Loại phương tiện đăng ký</Text>
            <View style={styles.vehicleTypeContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.vehicleCard,
                  vehicleType === 'moto' && { borderColor: COLORS.driver, borderWidth: 2 },
                ]}
                onPress={() => setVehicleType('moto')}
              >
                <Text style={{ fontSize: 32 }}>🛵</Text>
                <Text style={[styles.vehicleCardTitle, vehicleType === 'moto' && { color: COLORS.driver }]}>
                  Xe máy (Moto)
                </Text>
                <Text style={styles.vehicleCardDesc}>GrabFood/ShopeeFood</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.vehicleCard,
                  vehicleType === 'car' && { borderColor: COLORS.driver, borderWidth: 2 },
                ]}
                onPress={() => setVehicleType('car')}
              >
                <Text style={{ fontSize: 32 }}>🚗</Text>
                <Text style={[styles.vehicleCardTitle, vehicleType === 'car' && { color: COLORS.driver }]}>
                  Ô tô (Car)
                </Text>
                <Text style={styles.vehicleCardDesc}>Giao hàng lớn/Xe tải nhỏ</Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Biển số xe đăng ký"
              placeholder="Ví dụ: 29A-123.45"
              value={licensePlate}
              onChangeText={setLicensePlate}
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Tài khoản liên kết ngân hàng</Text>
            <Text style={styles.sectionSub}>Tài khoản này dùng để rút ví thu nhập và nhận thưởng tự động từ hệ thống.</Text>
            
            <Input
              label="Tên ngân hàng thụ hưởng"
              placeholder="Ví dụ: Vietcombank, Techcombank..."
              value={bankName}
              onChangeText={setBankName}
            />
            <Input
              label="Số tài khoản ngân hàng"
              placeholder="Nhập số tài khoản thụ hưởng"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
            />
            <Input
              label="Tên chủ tài khoản (Viết hoa không dấu)"
              placeholder="Ví dụ: NGUYEN VAN A"
              value={accountHolder}
              onChangeText={setAccountHolder}
            />
          </View>
        );
      case 4:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Hồ sơ xác thực tài khoản</Text>
            <Text style={styles.sectionSub}>Vui lòng đính kèm ảnh chụp các giấy tờ gốc để admin xác minh thông tin đăng ký.</Text>

            <View style={styles.uploadList}>
              {/* Selfie */}
              <TouchableOpacity
                style={[styles.uploadCard, docs.portrait && styles.uploadCardActive]}
                onPress={() => toggleDoc('portrait')}
              >
                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadTitle}>👤 Ảnh chân dung chụp chính diện</Text>
                  <Text style={styles.uploadDesc}>{docs.portrait ? 'Đã đính kèm ảnh chụp' : 'Nhấn để chụp/tải ảnh lên'}</Text>
                </View>
                <View style={[styles.statusBadge, docs.portrait ? styles.badgeSuccess : styles.badgePending]}>
                  <Text style={styles.badgeText}>{docs.portrait ? '✓ XONG' : '+ TẢI LÊN'}</Text>
                </View>
              </TouchableOpacity>

              {/* CCCD Front */}
              <TouchableOpacity
                style={[styles.uploadCard, docs.idFront && styles.uploadCardActive]}
                onPress={() => toggleDoc('idFront')}
              >
                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadTitle}>💳 Mặt trước CCCD/CMND</Text>
                  <Text style={styles.uploadDesc}>{docs.idFront ? 'Đã đính kèm ảnh chụp' : 'Nhấn để chụp/tải ảnh lên'}</Text>
                </View>
                <View style={[styles.statusBadge, docs.idFront ? styles.badgeSuccess : styles.badgePending]}>
                  <Text style={styles.badgeText}>{docs.idFront ? '✓ XONG' : '+ TẢI LÊN'}</Text>
                </View>
              </TouchableOpacity>

              {/* CCCD Back */}
              <TouchableOpacity
                style={[styles.uploadCard, docs.idBack && styles.uploadCardActive]}
                onPress={() => toggleDoc('idBack')}
              >
                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadTitle}>💳 Mặt sau CCCD/CMND</Text>
                  <Text style={styles.uploadDesc}>{docs.idBack ? 'Đã đính kèm ảnh chụp' : 'Nhấn để chụp/tải ảnh lên'}</Text>
                </View>
                <View style={[styles.statusBadge, docs.idBack ? styles.badgeSuccess : styles.badgePending]}>
                  <Text style={styles.badgeText}>{docs.idBack ? '✓ XONG' : '+ TẢI LÊN'}</Text>
                </View>
              </TouchableOpacity>

              {/* License Front */}
              <TouchableOpacity
                style={[styles.uploadCard, docs.licenseFront && styles.uploadCardActive]}
                onPress={() => toggleDoc('licenseFront')}
              >
                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadTitle}>🪪 Mặt trước Bằng lái xe (GPLX)</Text>
                  <Text style={styles.uploadDesc}>{docs.licenseFront ? 'Đã đính kèm ảnh chụp' : 'Nhấn để chụp/tải ảnh lên'}</Text>
                </View>
                <View style={[styles.statusBadge, docs.licenseFront ? styles.badgeSuccess : styles.badgePending]}>
                  <Text style={styles.badgeText}>{docs.licenseFront ? '✓ XONG' : '+ TẢI LÊN'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký Đối tác Tài xế</Text>
        <View style={{ width: 40 }} />
      </View>

      <StepIndicator currentStep={currentStep} steps={STEPS} role="driver" />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep < 4 ? (
          <Button title="Tiếp tục" onPress={handleNext} variant="driver" />
        ) : (
          <Button title="Hoàn tất đăng ký" onPress={handleRegister} variant="driver" />
        )}
        <Text style={styles.termsText}>
          Bằng việc đăng ký, bạn đồng ý với Điều khoản sử dụng dịch vụ của Ikigai Food.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    padding: SPACING.sm,
    width: 40,
  },
  backBtnText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.md,
    ...SHADOWS.light,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: SIZES.h3 - 2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSub: {
    fontSize: SIZES.caption + 2,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  vehicleTypeContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  vehicleCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  vehicleCardTitle: {
    fontSize: SIZES.body - 1,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: 2,
  },
  vehicleCardDesc: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  uploadList: {
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: SPACING.md,
  },
  uploadCardActive: {
    borderColor: COLORS.driverLight,
    backgroundColor: '#F0FDF4',
  },
  uploadInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  uploadTitle: {
    fontSize: SIZES.body - 2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  uploadDesc: {
    fontSize: SIZES.caption + 1,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgePending: {
    backgroundColor: COLORS.border,
  },
  badgeSuccess: {
    backgroundColor: COLORS.driver,
  },
  badgeText: {
    fontSize: SIZES.caption,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  termsText: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 16,
  },
});
