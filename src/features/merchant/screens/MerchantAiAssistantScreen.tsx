import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

const PRESETS = [
  { id: 'p1', label: 'Tăng đơn hàng buổi trưa? ☀️', queryType: 'lunch_orders' },
  { id: 'p2', label: 'Gợi ý khuyến mãi tháng này? 🎁', queryType: 'promo_suggestions' },
  { id: 'p3', label: 'Mẹo giảm tỷ lệ hủy đơn? 📉', queryType: 'cancel_rate' },
  { id: 'p4', label: 'Cách trả lời review 1 sao? 💬', queryType: 'one_star_reply' },
];

const BOT_RESPONSES: Record<string, string> = {
  lunch_orders: 'Để tăng đơn hàng buổi trưa (11h - 13h), quán nên áp dụng các chiến lược sau:\n\n1. 🍱 **Tạo Combo Ăn Trưa:** Kết hợp món ăn chính bán chạy và 1 phần nước ép/canh với giá giảm 10-15% so với mua lẻ. Khách văn phòng rất chuộng đặt cơm combo.\n\n2. ⏱️ **Tối ưu tốc độ chuẩn bị:** Chuẩn bị sẵn hộp đựng và sơ chế nguyên liệu từ 10h30. Đơn hàng ra lò dưới 10 phút sẽ được thuật toán Ikigai ưu tiên đẩy lên top đầu tìm kiếm.\n\n3. ⚡ **Flash Sale giờ vàng:** Đăng ký Flash Sale giảm 15% vào khung giờ 10h45 - 12h15 để đón đầu luồng khách hàng bắt đầu chọn món ăn trưa.',
  
  promo_suggestions: 'Gợi ý các chương trình khuyến mãi tối ưu doanh thu tháng này cho quán:\n\n1. 🎟️ **Mã giảm giá nhóm (Group Order):** Tạo mã `IKIGAI25` (Giảm 25.000đ cho đơn tối thiểu 160.000đ). Office workers thường gom đơn đặt chung để chia tiền ship, mã này giúp nâng cao giá trị trung bình đơn hàng cực tốt.\n\n2. 🥤 **Happy Hour buổi chiều (14h - 16h):** Đây là giờ thấp điểm của quán ăn nhưng là giờ vàng ăn vặt/uống nước. Tạo khuyến mãi "Mua 1 Tặng 1" hoặc giảm 30% trà sữa/sinh tố để kích cầu doanh số.',
  
  cancel_rate: 'Tỷ lệ hủy đơn cao sẽ làm giảm điểm chất lượng của quán và bị hạn chế hiển thị. Hãy áp dụng các mẹo sau để khắc phục:\n\n1. 🥑 **Cập nhật thực đơn thời gian thực:** Nếu một nguyên liệu chính bị hết, hãy dùng mục "Thực đơn" và tạm tắt món ăn đó đi ngay lập tức, tránh trường hợp khách đặt rồi phải hủy.\n\n2. ⏸️ **Sử dụng trạng thái Tạm nghỉ ngắn hạn:** Nếu nhà hàng đột xuất quá đông khách ăn tại chỗ hoặc bếp bị quá tải, hãy bật chế độ Tạm nghỉ 15 phút hoặc 30 phút trong Cài đặt thay vì cố nhận đơn online rồi trễ hạn hoặc hủy đơn.',
  
  one_star_reply: 'Khi phản hồi đánh giá 1 sao từ khách hàng, bí quyết là giữ thái độ bình tĩnh, chuyên nghiệp và cầu thị:\n\n*Công thức đề xuất: Xin lỗi chân thành + Giải thích ngắn gọn lỗi khách quan (nếu có) + Hành động khắc phục + Đền bù.*\n\n*Mẫu trả lời:* "Dạ, quán chân thành xin lỗi bạn về trải nghiệm món ăn không tốt này. Bếp đã làm việc lại với nhân viên để rút kinh nghiệm. Quán xin phép gửi tặng bạn mã giảm giá 20.000đ cho đơn hàng sau để quán có cơ hội sửa sai nhé. Cảm ơn bạn rất nhiều!"',
};

export default function MerchantAiAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ lý AI của đối tác nhà hàng Ikigai. 🤖\n\nTôi có thể giúp bạn phân tích xu hướng bán hàng, đề xuất chiến lược khuyến mãi tăng doanh thu, tư vấn cách trả lời khách hàng hoặc xử lý các lỗi vận hành hàng ngày. Bạn cần tôi trợ giúp gì hôm nay?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = (text: string, queryType?: string) => {
    if (!text.trim()) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: 'm_' + Date.now(),
      sender: 'user',
      text,
      time: userTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulate Bot response
    setTimeout(() => {
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let replyText = 'Tôi đã nhận được câu hỏi của bạn. Để tối ưu hóa hoạt động của quán ăn, tôi đề xuất bạn nên chú ý theo dõi lượng đơn hàng cao điểm buổi trưa và phản hồi đánh giá của khách hàng trong vòng 2 giờ để tạo thiện cảm tốt nhất.';
      
      if (queryType && BOT_RESPONSES[queryType]) {
        replyText = BOT_RESPONSES[queryType];
      } else {
        // Simple keyword matching for custom queries
        const lowerText = text.toLowerCase();
        if (lowerText.includes('trưa') || lowerText.includes('ăn trưa') || lowerText.includes(' lunch')) {
          replyText = BOT_RESPONSES.lunch_orders;
        } else if (lowerText.includes('khuyến mãi') || lowerText.includes('giảm giá') || lowerText.includes('quảng cáo')) {
          replyText = BOT_RESPONSES.promo_suggestions;
        } else if (lowerText.includes('hủy đơn') || lowerText.includes('hủy') || lowerText.includes('quá tải')) {
          replyText = BOT_RESPONSES.cancel_rate;
        } else if (lowerText.includes('1 sao') || lowerText.includes('đánh giá') || lowerText.includes('phản hồi')) {
          replyText = BOT_RESPONSES.one_star_reply;
        }
      }

      const botMsg: Message = {
        id: 'm_' + (Date.now() + 1),
        sender: 'bot',
        text: replyText,
        time: botTime,
      };

      setMessages((prev) => [...prev, botMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={styles.avatar}>
            <MaterialIcons name="psychology" size={22} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Trợ lý AI Kinh doanh</Text>
            <Text style={styles.headerSub}>Tư vấn vận hành &amp; Marketing Ikigai 24/7</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        
        {/* ── Messages List ── */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => <View style={{ height: 20 }} />}
          renderItem={({ item }) => {
            const isBot = item.sender === 'bot';
            return (
              <View style={[styles.messageRow, isBot ? styles.rowBot : styles.rowUser]}>
                {isBot && (
                  <View style={styles.msgAvatar}>
                    <MaterialIcons name="psychology" size={16} color={COLORS.white} />
                  </View>
                )}
                <View style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}>
                  <Text style={[styles.messageText, isBot ? styles.textBot : styles.textUser]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.timeText, isBot ? styles.timeBot : styles.timeUser]}>
                    {item.time}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* ── Preset Prompt Chips ── */}
        <View style={styles.presetContainer}>
          <Text style={styles.presetHeading}>💡 Gợi ý câu hỏi nhanh:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetScroll}
          >
            {PRESETS.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.chip}
                onPress={() => sendMessage(p.label, p.queryType)}
                activeOpacity={0.8}
              >
                <Text style={styles.chipText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Input Bar ── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập câu hỏi cho Trợ lý AI..."
            placeholderTextColor={COLORS.textLight}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage(inputText)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            disabled={!inputText.trim()}
            onPress={() => sendMessage(inputText)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="send" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 4,
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#7C3AED',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },

  // Chat Area
  chatList: {
    padding: SPACING.md,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    maxWidth: '85%',
  },
  rowBot: {
    alignSelf: 'flex-start',
    gap: 8,
  },
  rowUser: {
    alignSelf: 'flex-end',
  },
  msgAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#7C3AED',
    justifyContent: 'center', alignItems: 'center',
    marginTop: 2,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...SHADOWS.light,
  },
  bubbleBot: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleUser: {
    backgroundColor: '#7C3AED',
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  textBot: {
    color: COLORS.text,
  },
  textUser: {
    color: COLORS.white,
  },
  timeText: {
    fontSize: 8,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeBot: {
    color: COLORS.textLight,
  },
  timeUser: {
    color: 'rgba(255,255,255,0.7)',
  },

  // Presets
  presetContainer: {
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  presetHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    marginBottom: 6,
  },
  presetScroll: {
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm + 2,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.text,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.textLight,
  },
});
