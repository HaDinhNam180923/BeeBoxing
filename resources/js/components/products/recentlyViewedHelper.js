/**
 * Helper để quản lý sản phẩm đã xem gần đây
 */

const STORAGE_KEY = 'recentlyViewed';
const MAX_ITEMS = 10; // Số lượng sản phẩm tối đa lưu trữ

/**
 * Thêm ID sản phẩm vào danh sách đã xem gần đây
 * @param {number} productId - ID của sản phẩm
 */
export const addToRecentlyViewed = (productId) => {
  try {
    // Lấy danh sách hiện tại
    let recentlyViewed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    // Chuyển đổi productId sang số nếu cần
    productId = parseInt(productId, 10);
    
    // Xóa sản phẩm khỏi danh sách nếu đã tồn tại (để thêm lại vào đầu)
    recentlyViewed = recentlyViewed.filter(id => id !== productId);
    
    // Thêm sản phẩm vào đầu danh sách
    recentlyViewed.unshift(productId);
    
    // Giới hạn số lượng sản phẩm lưu trữ
    if (recentlyViewed.length > MAX_ITEMS) {
      recentlyViewed = recentlyViewed.slice(0, MAX_ITEMS);
    }
    
    // Lưu lại vào localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
  } catch (error) {
    console.error('Lỗi khi lưu sản phẩm đã xem:', error);
  }
};

/**
 * Lấy danh sách ID sản phẩm đã xem gần đây
 * @returns {Array} Mảng các ID sản phẩm
 */
export const getRecentlyViewedIds = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm đã xem:', error);
    return [];
  }
};

/**
 * Xóa toàn bộ lịch sử xem sản phẩm
 */
export const clearRecentlyViewed = () => {
  localStorage.removeItem(STORAGE_KEY);
};