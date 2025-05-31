import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

const Footer = () => {
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

    const toggleSizeGuide = () => {
        setIsSizeGuideOpen(!isSizeGuideOpen);
    };

    return (
        <footer className="bg-black text-white pt-10 pb-8">
            <div className="container mx-auto px-4">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <h2 className="text-xl font-bold mb-4">BEEBOXING lắng nghe bạn!</h2>
                        <p className="text-gray-300 mb-6">
                            Chúng tôi luôn trân trọng và mong đợi nhận được mọi ý kiến đóng góp từ khách 
                            hàng để có thể nâng cấp trải nghiệm dịch vụ và sản phẩm tốt hơn nữa.
                        </p>
                        <Link 
                            href="/contact"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md inline-flex items-center transition duration-300"
                        >
                            ĐÓNG GÓP Ý KIẾN
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>

                    {/* Contact Section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-start mb-6">
                            <div className="mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium">Hotline</h3>
                                <p className="text-lg font-bold">1900.272737 - 028.7777.2737</p>
                                <p className="text-gray-400">(8:30 - 22:00)</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium">Email</h3>
                                <p className="text-lg font-bold">Info@beeboxing.me</p>
                            </div>
                        </div>

                        {/* Social Media Icons */}
                        <div className="flex mt-6 space-x-4">
                            <a href="https://facebook.com" className="hover:opacity-80 transition-opacity" target="_blank" rel="noopener noreferrer">
                                <img src="/storage/images/facebook-icon.png" alt="Facebook" className="w-10 h-10" />
                            </a>
                            <a href="https://zalo.me" className="hover:opacity-80 transition-opacity" target="_blank" rel="noopener noreferrer">
                                <img src="/storage/images/zalo-icon.png" alt="Zalo" className="w-10 h-10" />
                            </a>
                            <a href="https://tiktok.com" className="hover:opacity-80 transition-opacity" target="_blank" rel="noopener noreferrer">
                                <img src="/storage/images/tiktok-icon.png" alt="TikTok" className="w-10 h-10" />
                            </a>
                            <a href="https://instagram.com" className="hover:opacity-80 transition-opacity" target="_blank" rel="noopener noreferrer">
                                <img src="/storage/images/icon-instar.svg" alt="Instagram" className="w-10 h-10" />
                            </a>
                            <a href="https://youtube.com" className="hover:opacity-80 transition-opacity" target="_blank" rel="noopener noreferrer">
                                <img src="/storage/images/icon-youtube.svg" alt="YouTube" className="w-10 h-10" />
                            </a>
                        </div>
                    </div>

                    {/* First Column */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">CHÍNH SÁCH</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/policies/return" className="text-gray-300 hover:text-white transition">Chính sách đổi trả 60 ngày</Link>
                            </li>
                            <li>
                                <Link href="/policies/promotion" className="text-gray-300 hover:text-white transition">Chính sách khuyến mãi</Link>
                            </li>
                            <li>
                                <Link href="/policies/privacy" className="text-gray-300 hover:text-white transition">Chính sách bảo mật</Link>
                            </li>
                            <li>
                                <Link href="/policies/shipping" className="text-gray-300 hover:text-white transition">Chính sách giao hàng</Link>
                            </li>
                        </ul>

                        <h3 className="text-lg font-bold mt-8 mb-4">BEEBOXING.ME</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/website-history" className="text-gray-300 hover:text-white transition">Lịch sử thay đổi website</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Second Column */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">CHĂM SÓC KHÁCH HÀNG</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/satisfaction" className="text-gray-300 hover:text-white transition">Trải nghiệm mua sắm 100% hài lòng</Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-gray-300 hover:text-white transition">Hỏi đáp - FAQs</Link>
                            </li>
                        </ul>

                        <h3 className="text-lg font-bold mt-8 mb-4">KIẾN THỨC HỮU ÍCH</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/size-guide-men" className="text-gray-300 hover:text-white transition">Hướng dẫn chọn size đồ nam</Link>
                            </li>
                            <li>
                                <Link href="/size-guide-women" className="text-gray-300 hover:text-white transition">Hướng dẫn chọn size đồ nữ</Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-gray-300 hover:text-white transition">Blog</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Third Column */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">VỀ BEEBOXING</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about/terms" className="text-gray-300 hover:text-white transition">Quy tắc ứng xử của BeeBoxing</Link>
                            </li>
                            <li>
                                <Link href="/about/101" className="text-gray-300 hover:text-white transition">BeeBoxing 101</Link>
                            </li>
                            <li>
                                <Link href="/about/business" className="text-gray-300 hover:text-white transition">DVKH xuất sắc</Link>
                            </li>
                            <li>
                                <Link href="/about/story" className="text-gray-300 hover:text-white transition">Câu chuyện về BeeBoxing</Link>
                            </li>
                            <li>
                                <Link href="/about/factory" className="text-gray-300 hover:text-white transition">Nhà máy</Link>
                            </li>
                            <li>
                                <Link href="/about/care" className="text-gray-300 hover:text-white transition">Care & Share</Link>
                            </li>
                            <li>
                                <Link href="/about/commitment" className="text-gray-300 hover:text-white transition">Cam kết bền vững</Link>
                            </li>
                            <li>
                                <Link href="/about/vision" className="text-gray-300 hover:text-white transition">Tầm nhìn 2030</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Address Section */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4">ĐỊA CHỈ LIÊN HỆ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <p className="text-gray-300">
                                <span className="font-medium block mb-1">Văn phòng Hà Nội:</span>
                                Tầng 3 Tòa nhà BMM, KM2, Đường Phùng Hưng, Phường Phúc La, Quận Hà Đông, TP Hà Nội
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-300">
                                <span className="font-medium block mb-1">Trung tâm vận hành Hà Nội:</span>
                                Lô C8, KCN Lại Yên, Xã Lại Yên, Huyện Hoài Đức, Thành phố Hà Nội
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-300">
                                <span className="font-medium block mb-1">Văn phòng và Trung tâm vận hành TP. HCM:</span>
                                Lô C3, đường D2, KCN Cát Lái, Thạnh Mỹ Lợi, TP. Thủ Đức, TP. Hồ Chí Minh
                            </p>
                        </div>
                    </div>
                </div>

                {/* Certificates */}
                <div className="flex flex-wrap items-center justify-center lg:justify-between border-t border-gray-700 pt-8">
                    <div className="mb-4 lg:mb-0">
                        <img src="/storage/images/logoSaleNoti.png" alt="Đã thông báo Bộ Công Thương" className="h-12" />
                    </div>
                    <div className="mb-4 lg:mb-0">
                        <img src="/storage/images/ssl.png" alt="SSL Secure" className="h-12" />
                    </div>
                    <div className="mb-4 lg:mb-0">
                        <div className="flex items-center">
                            <img src="/storage/images/visa.png" alt="Visa" className="h-10 mr-3" />
                            <img src="/storage/images/vnpay-logo.png" alt="MasterCard" className="h-10 mr-3" />
                            <img src="/storage/images/jcb.png" alt="JCB" className="h-10 mr-3" />
                            <img src="/storage/images/cod.png" alt="COD" className="h-10" />
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="text-center text-gray-400 text-sm mt-8">
                    <p>© {new Date().getFullYear()} BEEBOX TEAM - CÔNG TY CỔ PHẦN TRANG PHỤC BOXING VIỆT NAM</p>
                    <p className="mt-1">Bản quyền thiết kế thuộc về BeeBoxing - Đã đăng ký bản quyền</p>
                </div>
            </div>

            {/* Back to top button */}
            <button 
                onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition duration-300"
                aria-label="Back to top"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
            </button>

            {/* Size Guide Button */}
            <button
                onClick={toggleSizeGuide}
                className="fixed bottom-6 left-6 bg-orange-500 hover:bg-orange-600 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-3000 group animate-pulse hover:animate-none"
                aria-label="Hướng dẫn chọn size"
            >
                <div className="relative">
                    {/* Icon thước đo */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    
                    {/* Badge nhấp nháy */}
                    <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 animate-bounce">
                        Size!
                    </span>
                </div>
                
                {/* Tooltip text */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap animate-pulse">
                        Nhấn vào đây để hướng dẫn chọn size
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                            <div className="border-4 border-transparent border-t-gray-800"></div>
                        </div>
                    </div>
                </div>
            </button>

            {/* Size Guide Popup */}
            {isSizeGuideOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Hướng Dẫn Chọn Size
                            </h2>
                            <button
                                onClick={toggleSizeGuide}
                                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition duration-200"
                                aria-label="Đóng"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="text-gray-700">
                            <h3 className="text-lg font-semibold mb-2 text-blue-600">📏 Hướng Dẫn Chọn Size Đồ Nam</h3>
                            <table className="w-full border-collapse mb-4 shadow-sm">
                                <thead>
                                    <tr className="bg-blue-50">
                                        <th className="border border-gray-300 p-3 text-left">Size</th>
                                        <th className="border border-gray-300 p-3 text-left">Ngực (cm)</th>
                                        <th className="border border-gray-300 p-3 text-left">Eo (cm)</th>
                                        <th className="border border-gray-300 p-3 text-left">Hông (cm)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border border-gray-300 p-3 font-medium">S</td>
                                        <td className="border border-gray-300 p-3">86-90</td>
                                        <td className="border border-gray-300 p-3">70-74</td>
                                        <td className="border border-gray-300 p-3">88-92</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border border-gray-300 p-3 font-medium">M</td>
                                        <td className="border border-gray-300 p-3">90-94</td>
                                        <td className="border border-gray-300 p-3">74-78</td>
                                        <td className="border border-gray-300 p-3">92-96</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border border-gray-300 p-3 font-medium">L</td>
                                        <td className="border border-gray-300 p-3">94-98</td>
                                        <td className="border border-gray-300 p-3">78-82</td>
                                        <td className="border border-gray-300 p-3">96-100</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border border-gray-300 p-3 font-medium">XL</td>
                                        <td className="border border-gray-300 p-3">98-102</td>
                                        <td className="border border-gray-300 p-3">82-86</td>
                                        <td className="border border-gray-300 p-3">100-104</td>
                                    </tr>
                                </tbody>
                            </table>

                            <h3 className="text-lg font-semibold mb-2 text-pink-600">👗 Hướng Dẫn Chọn Size Đồ Nữ</h3>
                            <table className="w-full border-collapse shadow-sm">
                                <thead>
                                    <tr className="bg-pink-50">
                                        <th className="border border-gray-300 p-3 text-left">Size</th>
                                        <th className="border border-gray-300 p-3 text-left">Ngực (cm)</th>
                                        <th className="border border-gray-300 p-3 text-left">Eo (cm)</th>
                                        <th className="border border-gray-300 p-3 text-left">Hông (cm)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border border-gray-300 p-3 font-medium">XS</td>
                                        <td className="border border-gray-300 p-3">78-82</td>
                                        <td className="border border-gray-300 p-3">60-64</td>
                                        <td className="border border-gray-300 p-3">86-90</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border border-gray-300 p-3 font-medium">S</td>
                                        <td className="border border-gray-300 p-3">82-86</td>
                                        <td className="border border-gray-300 p-3">64-68</td>
                                        <td className="border border-gray-300 p-3">90-94</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border border-gray-300 p-3 font-medium">M</td>
                                        <td className="border border-gray-300 p-3">86-90</td>
                                        <td className="border border-gray-300 p-3">68-72</td>
                                        <td className="border border-gray-300 p-3">94-98</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="border border-gray-300 p-3 font-medium">L</td>
                                        <td className="border border-gray-300 p-3">90-94</td>
                                        <td className="border border-gray-300 p-3">72-76</td>
                                        <td className="border border-gray-300 p-3">98-102</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                <p className="text-sm">
                                    <span className="font-bold text-yellow-800">⚠️ Lưu ý quan trọng:</span> 
                                    <br />• Các số đo trên là kích thước cơ thể, không phải kích thước quần áo.
                                    <br />• Vui lòng đo chính xác và chọn size phù hợp.
                                    <br />• Nếu cần hỗ trợ thêm, hãy liên hệ qua hotline <strong>1900.272737</strong>
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 text-right">
                            <button
                                onClick={toggleSizeGuide}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-md transition duration-200"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;