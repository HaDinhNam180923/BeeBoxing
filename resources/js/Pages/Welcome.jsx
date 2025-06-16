import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import Slider from '@/Components/common/Slider';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';

export default function Welcome({ laravelVersion, phpVersion }) {
    const [featuredCollections, setFeaturedCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedCollections();
    }, []);

    const fetchFeaturedCollections = async () => {
        try {
            const response = await axios.get('/api/collections/featured');
            if (response.data.status) {
                setFeaturedCollections(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching featured collections:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GuestLayout>
            <Head title="Welcome to BeeBoxing" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Hero Slider */}
                    <div className="mb-8">
                        <Slider />
                    </div>

                    {/* Welcome Message */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg mb-8">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-4">Welcome to BeeBoxing!</h2>
                            <p>Discover our latest products and exclusive offers. <Link href="/login" className="text-yellow-600 hover:underline">Log in</Link> or <Link href="/register" className="text-yellow-600 hover:underline">register</Link> to start shopping!</p>
                        </div>
                    </div>

                    {/* Featured Collections */}
                    {!loading && featuredCollections.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-6">Featured Collections</h2>
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
                                                    View Collection
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
                            <h3 className="font-semibold text-lg mb-2">New Arrivals</h3>
                            <p className="text-gray-600">Check out our latest products added to the store.</p>
                            <Link href="/products" className="text-yellow-600 font-medium mt-2 inline-block">Browse Now →</Link>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg mb-2">Special Offers</h3>
                            <p className="text-gray-600">Limited time deals and discounts just for you.</p>
                            <Link href="/products" className="text-yellow-600 font-medium mt-2 inline-block">See Offers →</Link>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg mb-2">Join BeeBoxing</h3>
                            <p className="text-gray-600">Create an account to track orders and access exclusive perks.</p>
                            <Link href="/register" className="text-yellow-600 font-medium mt-2 inline-block">Register Now →</Link>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="py-16 text-center text-sm text-gray-500">
                
            </footer>
        </GuestLayout>
    );
}