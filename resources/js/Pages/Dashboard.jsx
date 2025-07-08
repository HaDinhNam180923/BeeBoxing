import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Slider from '@/Components/common/Slider';
import ProductCard from '@/Components/products/ProductCard';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import RecentlyViewedProducts from '@/Components/products/RecentlyViewedProducts';

export default function Dashboard() {
    const [featuredCollections, setFeaturedCollections] = useState([]);
    const [topSellingProducts, setTopSellingProducts] = useState([]);
    const [mostViewedProducts, setMostViewedProducts] = useState([]);
    const [userRecommendations, setUserRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [topSellingScrollPosition, setTopSellingScrollPosition] = useState(0);
    const [mostViewedScrollPosition, setMostViewedScrollPosition] = useState(0);
    const [userRecScrollPosition, setUserRecScrollPosition] = useState(0);
    const topSellingContainerRef = useRef(null);
    const mostViewedContainerRef = useRef(null);
    const userRecContainerRef = useRef(null);

    useEffect(() => {
        fetchFeaturedCollections();
        fetchTopSellingProducts();
        fetchMostViewedProducts();
        fetchUserRecommendations();
    }, []);

    const fetchFeaturedCollections = async () => {
        try {
            const response = await axios.get('/api/collections/featured');
            if (response.data.status) {
                setFeaturedCollections(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy bộ sưu tập nổi bật:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTopSellingProducts = async () => {
        try {
            const response = await axios.get('/api/products/top-selling', { params: { limit: 8 } });
            if (response.data.status) {
                setTopSellingProducts(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy sản phẩm bán chạy:', error);
        }
    };

    const fetchMostViewedProducts = async () => {
        try {
            const response = await axios.get('/api/products/most-viewed', { params: { limit: 8 } });
            if (response.data.status) {
                setMostViewedProducts(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy sản phẩm xem nhiều:', error);
        }
    };

    const fetchUserRecommendations = async () => {
        try {
            const response = await axios.get('/api/user/recommendations', { params: { limit: 8 } });
            if (response.data.status) {
                setUserRecommendations(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy gợi ý người dùng:', error);
        }
    };

    const scroll = (containerRef, setScrollPosition, direction, currentPosition) => {
        const container = containerRef.current;
        if (!container) {
            console.error('Container ref không tồn tại:', containerRef);
            return;
        }

        const cardWidth = 304; // Chiều rộng ProductCard (288px) + space-x-4 (16px)
        const scrollAmount = cardWidth * 2; // Cuộn 2 sản phẩm mỗi lần

        const newPosition = direction === 'left'
            ? Math.max(0, currentPosition - scrollAmount)
            : Math.min(
                  container.scrollWidth - container.clientWidth,
                  currentPosition + scrollAmount
              );

        console.log(`Cuộn ${direction}:`, {
            currentPosition,
            newPosition,
            scrollWidth: container.scrollWidth,
            clientWidth: container.clientWidth
        });

        container.scrollTo({
            left: newPosition,
            behavior: 'smooth'
        });

        setScrollPosition(newPosition);
    };

    const updateScrollPosition = (containerRef, setScrollPosition) => {
        if (containerRef.current) {
            const newPosition = containerRef.current.scrollLeft;
            setScrollPosition(newPosition);
            console.log('Cập nhật scroll position:', newPosition);
        }
    };

    const canTopSellingScrollLeft = topSellingScrollPosition > 0;
    const canTopSellingScrollRight = topSellingContainerRef.current
        ? topSellingScrollPosition < topSellingContainerRef.current.scrollWidth - topSellingContainerRef.current.clientWidth - 10
        : false;

    const canMostViewedScrollLeft = mostViewedScrollPosition > 0;
    const canMostViewedScrollRight = mostViewedContainerRef.current
        ? mostViewedScrollPosition < mostViewedContainerRef.current.scrollWidth - mostViewedContainerRef.current.clientWidth - 10
        : false;

    const canUserRecScrollLeft = userRecScrollPosition > 0;
    const canUserRecScrollRight = userRecContainerRef.current
        ? userRecScrollPosition < userRecContainerRef.current.scrollWidth - userRecContainerRef.current.clientWidth - 10
        : false;

    return (
        <AuthenticatedLayout>
            <Head title="Bảng điều khiển" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Hero Slider */}
                    <div className="mb-8">
                        <Slider />
                    </div>

                    {/* Welcome Message */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg mb-8">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-4">Chào mừng đến với BeeBoxing!</h2>
                            <p>Bạn đã đăng nhập! Khám phá các sản phẩm mới nhất và ưu đãi độc quyền.</p>
                        </div>
                    </div>

                    {/* Featured Collections */}
                    {!loading && featuredCollections.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-6">Bộ sưu tập nổi bật</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {featuredCollections.map(collection => (
                                    <Link 
                                        key={collection.collection_id} 
                                        href={`/collections/${collection.slug}`}
                                        className="relative overflow-hidden group rounded-lg"
                                    >
                                        <div className="aspect-[5/4] overflow-hidden">
                                            <img
                                                src={collection.image_url || '/storage/images/collection-placeholder.jpg'}
                                                alt={collection.name}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                        
                                        <div className="absolute bottom-0 left-0 p-4 w-full">
                                            <h3 className="text-xl font-bold text-white">{collection.name}</h3>
                                            {collection.description && (
                                                <p className="text-sm text-white/80 mt-1 line-clamp-2">{collection.description}</p>
                                            )}
                                            <div className="mt-3">
                                                <span className="inline-block px-4 py-2 bg-white font-medium text-sm rounded-full transition-colors group-hover:bg-yellow-600 group-hover:text-white">
                                                    Xem bộ sưu tập
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Promotional Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg mb-2">Sản phẩm mới</h3>
                            <p className="text-gray-600">Khám phá các sản phẩm mới nhất được thêm vào cửa hàng.</p>
                            <Link href="/products" className="text-yellow-600 font-medium mt-2 inline-block">Xem ngay →</Link>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg mb-2">Ưu đãi đặc biệt</h3>
                            <p className="text-gray-600">Các ưu đãi và giảm giá có thời hạn dành riêng cho bạn.</p>
                            <Link href="/products" className="text-yellow-600 font-medium mt-2 inline-block">Xem ưu đãi →</Link>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg mb-2">Đơn hàng của tôi</h3>
                            <p className="text-gray-600">Theo dõi và quản lý các đơn hàng gần đây của bạn.</p>
                            <Link href="/orders" className="text-yellow-600 font-medium mt-2 inline-block">Xem đơn hàng →</Link>
                        </div>
                    </div>

                    {/* Top Selling Products */}
                    {topSellingProducts.length > 0 && (
                        <div className="mt-12">
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sản phẩm bán chạy</h2>
                                        <p className="text-gray-600 mt-1">Khám phá những sản phẩm được yêu thích nhất trong 30 ngày qua.</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => scroll(topSellingContainerRef, setTopSellingScrollPosition, 'left', topSellingScrollPosition)}
                                            disabled={!canTopSellingScrollLeft}
                                            className={`p-2 rounded-full border ${
                                                canTopSellingScrollLeft 
                                                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            }`}
                                            aria-label="Cuộn trái"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={() => scroll(topSellingContainerRef, setTopSellingScrollPosition, 'right', topSellingScrollPosition)}
                                            disabled={!canTopSellingScrollRight}
                                            className={`p-2 rounded-full border ${
                                                canTopSellingScrollRight 
                                                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            }`}
                                            aria-label="Cuộn phải"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="relative overflow-hidden">
                                    <div
                                        ref={topSellingContainerRef}
                                        className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x"
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                        onScroll={() => updateScrollPosition(topSellingContainerRef, setTopSellingScrollPosition)}
                                    >
                                        {topSellingProducts.map((product) => (
                                            <div key={product.product_id} className="flex-none snap-start w-72">
                                                <ProductCard product={product} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Most Viewed Products */}
                    {mostViewedProducts.length > 0 && (
                        <div className="mt-12 mb-12">
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sản phẩm xem nhiều</h2>
                                        <p className="text-gray-600 mt-1">Xem những sản phẩm đang thu hút nhiều sự chú ý nhất.</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => scroll(mostViewedContainerRef, setMostViewedScrollPosition, 'left', mostViewedScrollPosition)}
                                            disabled={!canMostViewedScrollLeft}
                                            className={`p-2 rounded-full border ${
                                                canMostViewedScrollLeft 
                                                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            }`}
                                            aria-label="Cuộn trái"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={() => scroll(mostViewedContainerRef, setMostViewedScrollPosition, 'right', mostViewedScrollPosition)}
                                            disabled={!canMostViewedScrollRight}
                                            className={`p-2 rounded-full border ${
                                                canMostViewedScrollRight 
                                                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            }`}
                                            aria-label="Cuộn phải"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="relative overflow-hidden">
                                    <div
                                        ref={mostViewedContainerRef}
                                        className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x"
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                        onScroll={() => updateScrollPosition(mostViewedContainerRef, setMostViewedScrollPosition)}
                                    >
                                        {mostViewedProducts.map((product) => (
                                            <div key={product.product_id} className="flex-none snap-start w-72">
                                                <ProductCard product={product} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User-Based Recommendations */}
                    {userRecommendations.length > 0 && (
                        <div className="mt-12 mb-12">
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Có thể bạn quan tâm</h2>
                                        <p className="text-gray-600 mt-1">Dựa trên sở thích của bạn và những người dùng tương tự.</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => scroll(userRecContainerRef, setUserRecScrollPosition, 'left', userRecScrollPosition)}
                                            disabled={!canUserRecScrollLeft}
                                            className={`p-2 rounded-full border ${
                                                canUserRecScrollLeft 
                                                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            }`}
                                            aria-label="Cuộn trái"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={() => scroll(userRecContainerRef, setUserRecScrollPosition, 'right', userRecScrollPosition)}
                                            disabled={!canUserRecScrollRight}
                                            className={`p-2 rounded-full border ${
                                                canUserRecScrollRight 
                                                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            }`}
                                            aria-label="Cuộn phải"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="relative overflow-hidden">
                                    <div
                                        ref={userRecContainerRef}
                                        className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x"
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                        onScroll={() => updateScrollPosition(userRecContainerRef, setUserRecScrollPosition)}
                                    >
                                        {userRecommendations.map((product) => (
                                            <div key={product.product_id} className="flex-none snap-start w-72">
                                                <ProductCard product={product} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}