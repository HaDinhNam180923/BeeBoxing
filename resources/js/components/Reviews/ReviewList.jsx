import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StarIcon } from 'lucide-react';

const ReviewList = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`/api/reviews/product/${productId}`);
                setReviews(response.data.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [productId]);

    if (loading) {
        return (
            <div className="animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="py-4">
                        <div className="flex space-x-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded" />
                                <div className="h-4 bg-gray-200 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!reviews.length) {
        return <p>No reviews yet for this product</p>;
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.review_id} className="flex space-x-4">
                    <img
                        src="/api/placeholder/48/48"
                        alt="User Avatar"
                        className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">{review.user.name}</p>
                            <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className={`w-4 h-4 ${
                                            i < review.rating
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm mb-2">
                            {new Date(review.created_at).toLocaleDateString()}
                        </p>
                        <p>{review.comment}</p>
                        {review.image_urls.length > 0 && (
                            <div className="mt-4 flex space-x-2">
                                {review.image_urls.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Review Image ${index + 1}`}
                                        className="w-20 h-20 object-cover rounded-md"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;