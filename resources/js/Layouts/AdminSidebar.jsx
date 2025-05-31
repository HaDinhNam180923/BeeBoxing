import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminSidebar({ children }) {
    const user = usePage().props.auth.user;
    const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isVoucherMenuOpen, setIsVoucherMenuOpen] = useState(false);
    const [isOrderMenuOpen, setIsOrderMenuOpen] = useState(false);
    const [isCollectionMenuOpen, setIsCollectionMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200 shadow-lg">
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
                    </div>
                    
                    <nav className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                                    className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    <span>Danh mục</span>
                                    <svg
                                        className={`w-4 h-4 transform transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {isCategoryMenuOpen && (
                                    <ul className="mt-2 space-y-1 pl-6">
                                        <li>
                                            <Link
                                                href={route('admin.categories')}
                                                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                            >
                                                Danh sách danh mục
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href={route('admin.categories.create')}
                                                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                            >
                                                Thêm danh mục
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>
                            
                            <li>
                                <button
                                    onClick={() => setIsProductMenuOpen(!isProductMenuOpen)}
                                    className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    <span>Sản phẩm</span>
                                    <svg
                                        className={`w-4 h-4 transform transition-transform ${isProductMenuOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {isProductMenuOpen && (
                                    <ul className="mt-2 space-y-1 pl-6">
                                        <li>
                                            <Link
                                                href={route('admin.products')}
                                                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                            >
                                                Danh sách sản phẩm
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href={route('admin.products.create')}
                                                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                            >
                                                Thêm sản phẩm
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>
                            
                            <li>
                                <button
                                    onClick={() => setIsVoucherMenuOpen(!isVoucherMenuOpen)}
                                    className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    <span>Mã giảm giá</span>
                                    <svg
                                        className={`w-4 h-4 transform transition-transform ${isVoucherMenuOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {isVoucherMenuOpen && (
                                    <ul className="mt-2 space-y-1 pl-6">
                                        <li>
                                            <Link
                                                href={route('admin.vouchers')}
                                                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                            >
                                                Danh sách mã giảm giá
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href={route('admin.vouchers.create')}
                                                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                            >
                                                Thêm mã giảm giá
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>
                            
                            <li>
                                <button
                                    onClick={() => setIsOrderMenuOpen(!isOrderMenuOpen)}
                                    className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    <span>Quản lý đơn hàng</span>
                                    <svg
                                        className={`w-4 h-4 transform transition-transform ${isOrderMenuOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {isOrderMenuOpen && (
                                    <ul className="mt-2 space-y-1 pl-6">
                                        <li>
                                            <Link
                                                href={route('admin.orders')}
                                                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                            >
                                                Danh sách đơn hàng
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>
                            
                            <li>
                                <button
                                    onClick={() => setIsCollectionMenuOpen(!isCollectionMenuOpen)}
                                    className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    <span>Bộ sưu tập</span>
                                    <svg
                                        className={`w-4 h-4 transform transition-transform ${isCollectionMenuOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {isCollectionMenuOpen && (
                                    <ul className="mt-2 space-y-1 pl-6">
                                        <li>
                                            <Link
                                                href={route('admin.collections')}
                                                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                            >
                                                Danh sách bộ sưu tập
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href={route('admin.collections.create')}
                                                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                            >
                                                Thêm bộ sưu tập
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        </ul>
                    </nav>

                    <div className="border-t border-gray-200 p-4">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md text-left"
                        >
                            Đăng xuất
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                <nav className="fixed top-0 left-64 right-0 z-50 border-b border-gray-100 bg-white">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex shrink-0 items-center">
                                    <Link href="/admin">
                                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="hidden sm:flex sm:items-center">
                                <div className="text-sm text-gray-500">
                                    Xin chào, {user.name}
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="pt-16 px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                </main>
            </div>
        </div>
    );
}