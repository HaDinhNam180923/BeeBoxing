import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@headlessui/react';
import { StarIcon, UploadIcon } from 'lucide-react';
import axios from 'axios';

export default function ReviewModal({ isOpen, onClose, orderId, productId, productName }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setRating(5);
            setComment('');
            setImages([]);
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        if (comment.length < 10) {
            setError('Comment must be at least 10 characters long');
            setLoading(false);
            return;
        }
    
        const formData = new FormData();
        formData.append('product_id', productId);
        formData.append('order_id', orderId);
        formData.append('rating', rating);
        formData.append('comment', comment);
        
        images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
        });
    
        console.log('Submitting review with data:', {
            product_id: productId,
            order_id: orderId,
            rating,
            comment,
            images: images.map(image => image.name)
        });
    
        try {
            const response = await axios.post('/api/reviews', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            console.log('Server response:', response.data);
    
            if (response.data.status) {
                onClose();
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            setError(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md rounded bg-white p-6">
                    <Dialog.Title className="text-xl font-semibold mb-4">
                        Review {productName}
                    </Dialog.Title>

                    {error && (
                        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rating
                            </label>
                            <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setRating(value)}
                                        className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1"
                                    >
                                        <StarIcon
                                            className={`w-6 h-6 ${
                                                value <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Comment
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                                minLength={10}
                                rows={4}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Tell us about your experience with this product..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Images (Optional)
                            </label>
                            <div className="flex items-center space-x-4">
                                <label htmlFor="images" className="cursor-pointer">
                                    <div className="flex items-center justify-center w-20 h-20 text-gray-400 bg-gray-100 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50">
                                        <UploadIcon className="w-8 h-8" />
                                    </div>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img 
                                                src={URL.createObjectURL(image)}
                                                alt={`Review Image ${index + 1}`}
                                                className="w-20 h-20 rounded-md object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setImages(images.filter((_, i) => i !== index))}
                                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white text-red-500 flex items-center justify-center"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <input
                                id="images"
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/jpg"
                                className="hidden"
                                onChange={(e) => {
                                    const newImages = Array.from(e.target.files);
                                    setImages([...images, ...newImages]);
                                    e.target.value = ''; 
                                }}
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Accepted formats: JPG, JPEG, PNG (max 2MB each)
                            </p>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || comment.length < 10}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}

ReviewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    orderId: PropTypes.string.isRequired,
    productId: PropTypes.string.isRequired,
    productName: PropTypes.string.isRequired
};