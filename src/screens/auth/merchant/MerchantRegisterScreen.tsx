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
import { useDispatch } from 'react-redux';
import { registerSuccess } from '../../../redux/actions/authActions';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS, COMMON_STYLES } from '../../../constants/theme';
import Input from '../../../components/shared/Input';
import Button from '../../../components/shared/Button';
import StepIndicator from '../../../components/shared/StepIndicator';

const STEPS = ['Người đại diện', 'Cửa hàng', 'Thuế & Payout', 'Tài liệu'];

const FOOD_CATEGORIES = ['Cơm', 'Bún/Phở', 'Ăn vặt', 'Đồ uống/Trà sữa', 'Món Hàn/Nhật', 'Đồ Chay'];

export default function MerchantRegisterScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Owner Info
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerId, setOwnerId] = useState('');

  // Step 2: Store Info
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [operatingHours, setOperatingHours] = useState('08:00 - 22:00');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Step 3: Tax & Bank
  const [taxCode, setTaxCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // Step 4: Documents Upload Status
  const [docs, setDocs] = useState({
    storeFront: false,
    menuPhoto: false,
    hygieneCert: false,
  });

  const handleNext = () => {
    if (currentStep === 1) {
      if (!ownerName || !ownerPhone || !ownerEmail || !ownerId) {
        Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin người đại diện');
        return;
      }
      if (!ownerEmail.includes('@')) {
        Alert.alert('Thông báo', 'Email không hợp lệ');
        return;
      }
    } else if (currentStep === 2) {
      if (!storeName || !storeAddress || !operatingHours) {
        Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin cửa hàng');
        return;
      }
      if (selectedCategories.length === 0) {
        Alert.alert('Thông báo', 'Vui lòng chọn ít nhất 1 danh mục ẩm thực');
        return;
      }
    } else if (currentStep === 3) {
      if (!bankName || !accountNumber || !accountHolder) {
        Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin thanh toán');
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
      navigation.goBack();
    }
  };

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((item) => item !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
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
      Alert.alert('Thông báo', 'Vui lòng tải lên đầy đủ hình ảnh và giấy tờ kinh doanh');
      return;
    }

    // Đăng ký thành công giả lập
    dispatch(
      registerSuccess(
        'mock_token_merchant_pending_123',
        {
          id: 'mer_' + Date.now(),
          name: storeName,
          owner: ownerName,
          phone: ownerPhone,
          email: ownerEmail,
          role: 'merchant',
          status: 'pending',
          address: storeAddress,
          categories: selectedCategories,
        },
        'merchant'
      )
    );
  };

  // Render Step Content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Thông tin người đại diện quán</Text>
            <Input
              label="Họ tên người đại diện pháp lý"
              placeholder="Ví dụ: NGUYỄN VĂN B"
              value={ownerName}
              onChangeText={setOwnerName}
            />
            <Input
              label="Số điện thoại liên hệ"
              placeholder="Nhập số điện thoại liên lạc"
              value={ownerPhone}
              onChangeText={setOwnerPhone}
              keyboardType="phone-pad"
            />
            <Input
              label="Email nhận thông tin"
              placeholder="chuquan@email.com"
              value={ownerEmail}
              onChangeText={setOwnerEmail}
              keyboardType="email-address"
            />
            <Input
              label="Số CMND/CCCD chủ quán"
              placeholder="Nhập số CMND hoặc CCCD 12 số"
              value={ownerId}
              onChangeText={setOwnerId}
              keyboardType="numeric"
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Thông tin Cửa hàng / Quán ăn</Text>
            
            <Input
              label="Tên cửa hàng (Hiển thị trên App khách hàng)"
              placeholder="Ví dụ: Ikigai Sushi & Sashimi - Cầu Giấy"
              value={storeName}
              onChangeText={setStoreName}
            />
            <Input
              label="Địa chỉ chính xác của quán"
              placeholder="Số nhà, Tên đường, Phường, Quận, Thành phố"
              value={storeAddress}
              onChangeText={setStoreAddress}
            />
            <Input
              label="Thời gian hoạt động cửa hàng"
              placeholder="Mặc định: 08:00 - 22:00"
              value={operatingHours}
              onChangeText={setOperatingHours}
            />

            <Text style={styles.label}>Danh mục món ăn kinh doanh</Text>
            <View style={styles.categoryContainer}>
              {FOOD_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.8}
                    style={[
                      styles.categoryTag,
                      isSelected && {
                        backgroundColor: COLORS.merchantLight,
                        borderColor: COLORS.merchant,
                      },
                    ]}
                    onPress={() => toggleCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryTagText,
                        isSelected && { color: COLORS.merchant, fontWeight: 'bold' },
                      ]}
                    >
                      {isSelected ? `✓ ${cat}` : `+ ${cat}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Mã số thuế & Tài khoản Payout</Text>
            <Text style={styles.sectionSub}>Điền mã số thuế hộ kinh doanh/doanh nghiệp và thông tin ngân hàng thụ hưởng doanh thu.</Text>
            
            <Input
              label="Mã số thuế (MST)"
              placeholder="Nhập mã số thuế (hoặc để trống nếu chưa có)"
              value={taxCode}
              onChangeText={setTaxCode}
              keyboardType="numeric"
            />
            <Input
              label="Tên ngân hàng nhận doanh thu"
              placeholder="Ví dụ: Vietcombank, MB Bank..."
              value={bankName}
              onChangeText={setBankName}
            />
            <Input
              label="Số tài khoản ngân hàng thụ hưởng"
              placeholder="Nhập số tài khoản"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
            />
            <Input
              label="Tên chủ tài khoản ngân hàng (Viết hoa không dấu)"
              placeholder="Ví dụ: NGUYEN VAN B"
              value={accountHolder}
              onChangeText={setAccountHolder}
            />
          </View>
        );
      case 4:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Hình ảnh thực tế & Giấy tờ kinh doanh</Text>
            <Text style={styles.sectionSub}>Tải lên hình ảnh rõ nét để đội ngũ kiểm duyệt có thể xác thực quán ăn hoạt động thực tế.</Text>

            <View style={styles.uploadList}>
              {/* Store Front */}
              <TouchableOpacity
                style={[styles.uploadCard, docs.storeFront && styles.uploadCardActive]}
                onPress={() => toggleDoc('storeFront')}
              >
                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadTitle}>📸 Ảnh mặt tiền cửa hàng (Rõ biển hiệu)</Text>
                  <Text style={styles.uploadDesc}>{docs.storeFront ? 'Đã tải lên ảnh cửa hàng' : 'Nhấn để chụp/tải ảnh lên'}</Text>
                </View>
                <View style={[styles.statusBadge, docs.storeFront ? styles.badgeSuccess : styles.badgePending]}>
                  <Text style={styles.badgeText}>{docs.storeFront ? '✓ XONG' : '+ TẢI LÊN'}</Text>
                </View>
              </TouchableOpacity>

              {/* Menu Photo */}
              <TouchableOpacity
                style={[styles.uploadCard, docs.menuPhoto && styles.uploadCardActive]}
                onPress={() => toggleDoc('menuPhoto')}
              >
                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadTitle}>📄 Ảnh thực đơn / Danh sách món ăn</Text>
                  <Text style={styles.uploadDesc}>{docs.menuPhoto ? 'Đã tải lên ảnh thực đơn' : 'Nhấn để chụp/tải ảnh lên'}</Text>
                </View>
                <View style={[styles.statusBadge, docs.menuPhoto ? styles.badgeSuccess : styles.badgePending]}>
                  <Text style={styles.badgeText}>{docs.menuPhoto ? '✓ XONG' : '+ TẢI LÊN'}</Text>
                </View>
              </TouchableOpacity>

              {/* Hygiene Certificate */}
              <TouchableOpacity
                style={[styles.uploadCard, docs.hygieneCert && styles.uploadCardActive]}
                onPress={() => toggleDoc('hygieneCert')}
              >
                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadTitle}>🛡️ Giấy phép VSATTP hoặc CCCD đại diện</Text>
                  <Text style={styles.uploadDesc}>{docs.hygieneCert ? 'Đã tải lên tài liệu' : 'Nhấn để chụp/tải ảnh lên'}</Text>
                </View>
                <View style={[styles.statusBadge, docs.hygieneCert ? styles.badgeSuccess : styles.badgePending]}>
                  <Text style={styles.badgeText}>{docs.hygieneCert ? '✓ XONG' : '+ TẢI LÊN'}</Text>
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
        <Text style={styles.headerTitle}>Đăng ký Đối tác Nhà hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <StepIndicator currentStep={currentStep} steps={STEPS} role="merchant" />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep < 4 ? (
          <Button title="Tiếp tục" onPress={handleNext} variant="merchant" />
        ) : (
          <Button title="Hoàn tất đăng ký" onPress={handleRegister} variant="merchant" />
        )}
        <Text style={styles.termsText}>
          Bằng việc liên kết, bạn đồng ý với Điều khoản hợp tác kinh doanh của Ikigai Food.
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
    marginTop: SPACING.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  categoryTag: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  categoryTagText: {
    fontSize: SIZES.caption + 2,
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
    borderColor: COLORS.merchantLight,
    backgroundColor: '#FFF7ED',
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
    backgroundColor: COLORS.merchant,
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
