import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity,
  TextInput, Alert, FlatList, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type AvailabilityStatus = 'available' | 'off_today' | 'off_permanent';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  availability: AvailabilityStatus;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const INITIAL_MENU: MenuItem[] = [
  { id: 'm1', name: 'Cơm gà xối mỡ đặc biệt',   price: 55000, description: 'Cơm đảo lòng đỏ trứng gà, đùi gà chiên giòn rụm kèm canh và dưa leo.', availability: 'available', category: 'Cơm' },
  { id: 'm2', name: 'Cơm gà sốt Teriyaki',        price: 75000, description: 'Cơm trắng hạt dẻo thơm, má đùi gà sốt Teriyaki đậm đà chuẩn vị Nhật.', availability: 'available', category: 'Cơm' },
  { id: 'm3', name: 'Cơm sườn bì chả nướng',      price: 48000, description: 'Sườn cốt lết nướng than hồng thơm ngọt, bì heo giòn dai và chả trứng.',  availability: 'off_today',    category: 'Cơm' },
  { id: 'm4', name: 'Mì Udon hải sản xào cay',    price: 95000, description: 'Sợi mì Udon tươi dai xào cùng tôm, mực tươi roi rói và sốt cay độc quyền.', availability: 'available', category: 'Bún/Mì' },
  { id: 'm5', name: 'Bún bò Huế đặc biệt',        price: 65000, description: 'Nước lèo ninh xương bò ngọt thanh béo ngậy thơm mùi sả ruốc, giò heo to tròn.', availability: 'available', category: 'Bún/Mì' },
  { id: 'm6', name: 'Khoai tây chiên lắc phô mai', price: 30000, description: 'Khoai tây cọng vàng giòn rụm lắc đẫm bột phô mai mặn ngọt béo ngậy.',    availability: 'available', category: 'Ăn vặt' },
  { id: 'm7', name: 'Set 5 nem chua rán Hà Nội',  price: 35000, description: 'Nem chua rán bọc bột chiên xù giòn tan bên ngoài, dẻo mềm thơm bên trong.', availability: 'off_permanent', category: 'Ăn vặt' },
  { id: 'm8', name: 'Trà sữa trân châu truyền thống', price: 40000, description: 'Trà đen đậm vị pha cùng sữa béo thơm kèm trân châu đen dai giòn ngọt lịm.', availability: 'available', category: 'Đồ uống' },
  { id: 'm9', name: 'Nước cam vắt nguyên chất',   price: 35000, description: 'Cam sành tươi vắt lấy nước nguyên chất, giàu vitamin C thanh mát.',         availability: 'available', category: 'Đồ uống' },
];

const CATEGORIES = ['Tất cả', 'Cơm', 'Bún/Mì', 'Ăn vặt', 'Đồ uống'];

// ─── Availability Config ──────────────────────────────────────────────────────

const AVAIL_CONFIG: Record<AvailabilityStatus, { label: string; badgeLabel: string; bg: string; color: string; icon: string }> = {
  available:     { label: 'Đang bán',      badgeLabel: 'ĐANG BÁN',    bg: '#DCFCE7', color: '#16A34A', icon: 'check-circle' },
  off_today:     { label: 'Tắt hôm nay',   badgeLabel: 'TẮT HÔM NAY', bg: '#FEF3C7', color: '#D97706', icon: 'wb-sunny' },
  off_permanent: { label: 'Ngừng bán',     badgeLabel: 'NGỪNG BÁN',   bg: '#FEE2E2', color: COLORS.error,  icon: 'block' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return 'm' + Date.now().toString().slice(-6);
}

function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

// ─── Turn-Off Picker Modal ────────────────────────────────────────────────────

function TurnOffModal({
  visible,
  itemName,
  onClose,
  onSelect,
}: {
  visible: boolean;
  itemName: string;
  onClose: () => void;
  onSelect: (status: AvailabilityStatus) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <View style={modal.handle} />
          <Text style={modal.title}>Tắt món "{itemName}"</Text>
          <Text style={modal.sub}>Chọn thời gian tắt món ăn này khỏi thực đơn:</Text>

          <TouchableOpacity style={modal.option} onPress={() => onSelect('off_today')} activeOpacity={0.75}>
            <View style={[modal.optionIcon, { backgroundColor: '#FEF3C7' }]}>
              <MaterialIcons name="wb-sunny" size={22} color="#D97706" />
            </View>
            <View style={modal.optionText}>
              <Text style={modal.optionLabel}>Tắt hôm nay</Text>
              <Text style={modal.optionSub}>Món sẽ tự động mở lại vào ngày hôm sau lúc 0:00</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={modal.option} onPress={() => onSelect('off_permanent')} activeOpacity={0.75}>
            <View style={[modal.optionIcon, { backgroundColor: '#FEE2E2' }]}>
              <MaterialIcons name="block" size={22} color={COLORS.error} />
            </View>
            <View style={modal.optionText}>
              <Text style={modal.optionLabel}>Tắt vĩnh viễn</Text>
              <Text style={modal.optionSub}>Ẩn hoàn toàn khỏi thực đơn cho đến khi bạn mở lại thủ công</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={modal.cancelBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={modal.cancelText}>Hủy bỏ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Item Editor Modal ────────────────────────────────────────────────────────

interface EditorState {
  id: string;
  name: string;
  price: string;
  description: string;
  category: string;
}

function ItemEditorModal({
  visible,
  initial,
  isNew,
  onClose,
  onSave,
}: {
  visible: boolean;
  initial: EditorState | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (data: EditorState) => void;
}) {
  const [form, setForm] = useState<EditorState>(
    initial || { id: '', name: '', price: '', description: '', category: CATEGORIES[1] }
  );

  // sync when initial changes (e.g. different item opened)
  React.useEffect(() => {
    if (initial) setForm(initial);
    else setForm({ id: '', name: '', price: '', description: '', category: CATEGORIES[1] });
  }, [initial, visible]);

  const handleSave = () => {
    if (!form.name.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên món ăn.');
      return;
    }
    const priceNum = parseInt(form.price.replace(/\D/g, ''), 10);
    if (!priceNum || priceNum <= 0) {
      Alert.alert('Giá không hợp lệ', 'Vui lòng nhập giá lớn hơn 0.');
      return;
    }
    onSave({ ...form, price: priceNum.toString() });
  };

  const field = (label: string, key: keyof EditorState, placeholder: string, numeric = false, multiline = false) => (
    <View style={editor.fieldGroup}>
      <Text style={editor.fieldLabel}>{label}</Text>
      <TextInput
        style={[editor.fieldInput, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={form[key] as string}
        onChangeText={(v) => setForm((p) => ({ ...p, [key]: v }))}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        keyboardType={numeric ? 'numeric' : 'default'}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={modal.overlay}>
          <View style={[modal.sheet, { maxHeight: '90%' }]}>
            <View style={modal.handle} />
            <Text style={modal.title}>{isNew ? '➕ Thêm món mới' : '✏️ Chỉnh sửa món ăn'}</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {field('Tên món ăn *', 'name', 'VD: Cơm gà chiên giòn đặc biệt')}
              {field('Giá bán (đ) *', 'price', 'VD: 55000', true)}
              {field('Mô tả món ăn', 'description', 'Mô tả nguyên liệu, hương vị đặc trưng...', false, true)}

              {/* Category Selector */}
              <View style={editor.fieldGroup}>
                <Text style={editor.fieldLabel}>Danh mục</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {CATEGORIES.filter((c) => c !== 'Tất cả').map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[editor.catChip, form.category === cat && editor.catChipActive]}
                        onPress={() => setForm((p) => ({ ...p, category: cat }))}
                      >
                        <Text style={[editor.catChipText, form.category === cat && { color: COLORS.white }]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Price preview */}
              {form.price.replace(/\D/g, '') ? (
                <View style={editor.pricePreview}>
                  <MaterialIcons name="sell" size={14} color={COLORS.driverDark} />
                  <Text style={editor.pricePreviewText}>
                    Giá hiển thị: {parseInt(form.price.replace(/\D/g, ''), 10).toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={editor.actions}>
              <TouchableOpacity style={editor.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={editor.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={editor.saveBtn} onPress={handleSave} activeOpacity={0.8}>
                <MaterialIcons name="check" size={18} color={COLORS.white} />
                <Text style={editor.saveText}>{isNew ? 'Thêm món' : 'Lưu thay đổi'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MerchantMenuScreen() {
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  // Turn-off modal
  const [turnOffTarget, setTurnOffTarget] = useState<MenuItem | null>(null);
  // Editor modal
  const [editorItem, setEditorItem] = useState<EditorState | null>(null);
  const [editorIsNew, setEditorIsNew] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);

  // ── Filter ──
  const filteredMenu = menu.filter((item) => {
    const matchesCat = activeCategory === 'Tất cả' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const availableCount = menu.filter((m) => m.availability === 'available').length;
  const offCount       = menu.filter((m) => m.availability !== 'available').length;

  // ── Toggle Switch ──
  const handleSwitchToggle = (item: MenuItem) => {
    if (item.availability === 'available') {
      // Turn ON -> show picker to choose OFF type
      setTurnOffTarget(item);
    } else {
      // Turn OFF -> turn back ON immediately
      setMenu((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, availability: 'available' } : m))
      );
    }
  };

  const handleTurnOff = (status: AvailabilityStatus) => {
    if (!turnOffTarget) return;
    setMenu((prev) =>
      prev.map((m) => (m.id === turnOffTarget.id ? { ...m, availability: status } : m))
    );
    setTurnOffTarget(null);
  };

  // ── Edit ──
  const openEdit = (item: MenuItem) => {
    setEditorItem({
      id: item.id,
      name: item.name,
      price: item.price.toString(),
      description: item.description,
      category: item.category,
    });
    setEditorIsNew(false);
    setEditorVisible(true);
  };

  // ── Add ──
  const openAdd = () => {
    setEditorItem(null);
    setEditorIsNew(true);
    setEditorVisible(true);
  };

  // ── Save (add or edit) ──
  const handleSaveEditor = (data: EditorState) => {
    const priceNum = parseInt(data.price, 10);
    if (editorIsNew) {
      const newItem: MenuItem = {
        id: generateId(),
        name: data.name.trim(),
        price: priceNum,
        description: data.description.trim(),
        category: data.category,
        availability: 'available',
      };
      setMenu((prev) => [newItem, ...prev]);
    } else {
      setMenu((prev) =>
        prev.map((m) =>
          m.id === data.id
            ? { ...m, name: data.name.trim(), price: priceNum, description: data.description.trim(), category: data.category }
            : m
        )
      );
    }
    setEditorVisible(false);
  };

  // ── Delete ──
  const handleDelete = (item: MenuItem) => {
    Alert.alert(
      'Xoá món ăn',
      `Bạn có chắc muốn xoá "${item.name}" khỏi thực đơn không? Hành động này không thể hoàn tác.`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: () => setMenu((prev) => prev.filter((m) => m.id !== item.id)),
        },
      ]
    );
  };

  // ── Render card ──
  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const cfg = AVAIL_CONFIG[item.availability];
    const isOn = item.availability === 'available';

    return (
      <View style={[styles.card, !isOn && styles.cardOff]}>
        {/* Top: name + badge + actions */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={[styles.cardName, !isOn && styles.cardNameOff]} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                <MaterialIcons name={cfg.icon as any} size={10} color={cfg.color} />
                <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.badgeLabel}</Text>
              </View>
            </View>
            <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionBtns}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => openEdit(item)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="edit" size={18} color={COLORS.primaryDark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: '#FEE2E2' }]}
              onPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="delete-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        {item.description ? (
          <Text style={[styles.cardDesc, !isOn && { color: COLORS.textLight }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {/* Category tag + Toggle */}
        <View style={styles.cardFooter}>
          <View style={styles.catTag}>
            <MaterialIcons name="label-outline" size={12} color={COLORS.textLight} />
            <Text style={styles.catTagText}>{item.category}</Text>
          </View>

          <View style={styles.toggleGroup}>
            <Text style={[styles.toggleLabel, { color: isOn ? '#16A34A' : COLORS.textLight }]}>
              {cfg.label}
            </Text>
            <Switch
              value={isOn}
              onValueChange={() => handleSwitchToggle(item)}
              trackColor={{ false: COLORS.border, true: '#BBF7D0' }}
              thumbColor={isOn ? '#16A34A' : COLORS.textLight}
              ios_backgroundColor={COLORS.border}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Search Header ── */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={COLORS.textLight} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm món ăn..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="cancel" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.85}>
          <MaterialIcons name="add" size={20} color={COLORS.white} />
          <Text style={styles.addBtnText}>Thêm món</Text>
        </TouchableOpacity>
      </View>

      {/* ── Category Filter ── */}
      <View style={styles.catBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.md, gap: 8 }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Stats Bar ── */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <MaterialIcons name="check-circle" size={14} color="#16A34A" />
          <Text style={styles.statText}>{availableCount} đang bán</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialIcons name="block" size={14} color={COLORS.error} />
          <Text style={styles.statText}>{offCount} đã tắt</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialIcons name="restaurant-menu" size={14} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{menu.length} tổng món</Text>
        </View>
      </View>

      {/* ── Menu List ── */}
      <FlatList
        data={filteredMenu}
        keyExtractor={(item) => item.id}
        renderItem={renderMenuItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="restaurant-menu" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Không tìm thấy món ăn</Text>
            <Text style={styles.emptySub}>Thử tìm kiếm từ khóa khác hoặc thêm món mới.</Text>
          </View>
        }
      />

      {/* ── Turn-Off Modal ── */}
      <TurnOffModal
        visible={turnOffTarget !== null}
        itemName={turnOffTarget?.name ?? ''}
        onClose={() => setTurnOffTarget(null)}
        onSelect={handleTurnOff}
      />

      {/* ── Item Editor Modal ── */}
      <ItemEditorModal
        visible={editorVisible}
        initial={editorItem}
        isNew={editorIsNew}
        onClose={() => setEditorVisible(false)}
        onSave={handleSaveEditor}
      />
    </SafeAreaView>
  );
}

// ─── Main Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // Search Header
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm + 2,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text, padding: 0 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.driver,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    ...SHADOWS.light,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.white },

  // Category
  catBar: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: { backgroundColor: COLORS.driver, borderColor: COLORS.driver },
  catChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  catChipTextActive: { color: COLORS.white, fontWeight: '700' },

  // Stats
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  statText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  statDivider: { width: 1, height: 16, backgroundColor: COLORS.border },

  // List
  listContent: { padding: SPACING.md, paddingBottom: 100 },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  cardOff: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E9ECEF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
    flex: 1,
    marginRight: 8,
  },
  cardName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardNameOff: { color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  cardPrice: { fontSize: 14, fontWeight: '700', color: COLORS.driverDark },
  cardDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17, marginBottom: 10 },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statusBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },

  // Action buttons
  actionBtns: { flexDirection: 'row', gap: 6, flexShrink: 0 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Card footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  catTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  catTagText: { fontSize: 11, color: COLORS.textLight, fontWeight: '600' },
  toggleGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleLabel: { fontSize: 11, fontWeight: '700' },

  // Empty
  emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: SPACING.xl },
  emptyTitle: { fontSize: SIZES.h4, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  emptySub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xs, lineHeight: 18 },
});

// ─── Modal Styles ─────────────────────────────────────────────────────────────

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: 40,
    ...SHADOWS.heavy,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: SIZES.h3 - 1,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  optionText: { flex: 1 },
  optionLabel: { fontSize: SIZES.body - 1, fontWeight: '700', color: COLORS.text },
  optionSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, lineHeight: 16 },
  cancelBtn: {
    marginTop: SPACING.lg,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary },
});

// ─── Editor Styles ────────────────────────────────────────────────────────────

const editor = StyleSheet.create({
  fieldGroup: { marginBottom: SPACING.md },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  fieldInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: { backgroundColor: COLORS.driver, borderColor: COLORS.driver },
  catChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  pricePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.driverLight,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    marginBottom: SPACING.sm,
  },
  pricePreviewText: { fontSize: 13, fontWeight: '700', color: COLORS.driverDark },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.driver,
    ...SHADOWS.medium,
  },
  saveText: { fontSize: 15, fontWeight: '800', color: COLORS.white },
});
