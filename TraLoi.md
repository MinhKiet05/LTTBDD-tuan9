Trả lời câu hỏi bổ sung — Buổi 9

1. Giá trị dẫn xuất (Derived State)

Lý do tính trực tiếp: errors và valid là các giá trị được suy ra hoàn toàn từ các state gốc (name, phone, address, items), nên việc tính toán trực tiếp mỗi lần render giúp giao diện luôn đồng bộ tuyệt đối với dữ liệu hiện tại mà không cần thêm state thừa.

Điểm dễ sai nếu dùng useState: Nếu tách thành useState riêng, ta phải nhớ cập nhật lại errors và valid ở mọi nơi gọi setName, setPhone, setAddress hoặc khi giỏ hàng thay đổi; chỉ cần quên cập nhật ở một chỗ sẽ khiến thông báo lỗi hiển thị sai hoặc nút đặt hàng mở/khoá không đúng thực tế.

2. Thứ tự gọi hàm trong submit

Hậu quả nếu gọi clear() trước: Nếu clear() chạy trước await createOrder(...), khi rớt mạng hoặc server lỗi, giỏ hàng trong Redux store và AsyncStorage đã bị xoá sạch trong khi đơn hàng chưa hề được tạo trên hệ thống, làm người dùng mất toàn bộ sách đã chọn.

Lý do đặt clear() sau createOrder: Đặt clear() ngay sau await createOrder(...) đảm bảo chỉ khi server xác nhận đã lưu đơn hàng thành công thì giỏ hàng mới bị xoá; nếu gặp lỗi, luồng sẽ nhảy sang catch và giữ nguyên giỏ để người dùng thử lại.

3. Phân biệt PUT và PATCH

Kết quả khi dùng PUT: PUT /users/1 sẽ thay thế toàn bộ object user cũ bằng dữ liệu mới gửi lên, khiến user trong db.json chỉ còn lại id, name, phone và bị mất hoàn toàn các trường quan trọng khác như email và password.

Lý do chọn PATCH: PATCH chỉ cập nhật một phần dữ liệu (đúng các trường được gửi là name và phone) và giữ nguyên các thuộc tính còn lại của tài khoản, đảm bảo an toàn dữ liệu cho chức năng chỉnh sửa hồ sơ.

4. Cập nhật lạc quan (Optimistic UI Update)

Lỗi xảy ra nếu bỏ đoạn hoàn lại read: false: Khi mất mạng, giao diện vẫn hiển thị thông báo đã đọc (nền trắng, mất chấm đỏ) trong khi dữ liệu dưới server vẫn là read: false; khi người dùng tải lại màn hình, thông báo tự động quay về trạng thái chưa đọc gây khó hiểu và thiếu nhất quán.

Ví dụ áp dụng:

Nên dùng: Thả tim / thêm vào danh sách yêu thích (Wishlist), vì đây là thao tác tương tác nhẹ, tần suất cao và cần phản hồi tức thì cho người dùng.

Không nên dùng: Gửi đơn hàng thanh toán (Checkout) hoặc đăng ký/đăng nhập tài khoản, vì các nghiệp vụ này đòi hỏi xác thực và ghi nhận chính xác từ phía server trước khi báo thành công.

5. Code bổ sung: Bộ lọc trạng thái ở màn Đơn hàng (OrdersScreen.tsx)

Để thêm bộ lọc trạng thái ở màn hình Đơn hàng của tôi, ta khai báo thêm state lưu trạng thái đang chọn, tạo thanh chọn các tab trạng thái phía trên danh sách và lọc mảng orders truyền vào FlatList:

// 1. Khai báo kiểu và danh sách bộ lọc (đặt ngoài component OrdersScreen)
import { ScrollView } from "react-native"; // Bổ sung ScrollView vào import từ react-native
import { OrderStatus } from "../types";

type FilterStatus = "all" | OrderStatus;

const STATUS_TABS: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "completed", label: "Hoàn tất" },
  { key: "cancelled", label: "Đã huỷ" },
];

// 2. Bên trong component OrdersScreen: thêm state statusFilter và tính danh sách đã lọc
const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

const filteredOrders = orders.filter(
  (o) => statusFilter === "all" || o.status === statusFilter
);

// 3. Trong phần return: thêm thanh chọn trạng thái và truyền filteredOrders vào FlatList
<View style={styles.container}>
  <View style={{ backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: colors.line }}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
    >
      {STATUS_TABS.map((tab) => {
        const active = statusFilter === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => setStatusFilter(tab.key)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: active ? colors.indigo : colors.bg,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: active ? "#fff" : colors.text }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  </View>

  <FlatList
    data={filteredOrders}
    keyExtractor={(o) => String(o.id)}
    // ... giữ nguyên các props còn lại của FlatList
  />
</View>
