import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Slider({ autoPlay = true, interval = 5000 }) {
    const [slides, setSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch slides from the server
    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const response = await axios.get('/api/slides');
                if (response.data && response.data.length > 0) {
                    setSlides(response.data);
                } else {
                    // Placeholder slides if none exist in database
                    setSlides([
                        {
                            slide_id: 1,
                            title: 'BeeBoxing Collection',
                            description: 'Discover our latest products',
                            image_url: '/storage/slide/slide1.jpg',
                            link_url: '/products'
                        },
                        {
                            slide_id: 2,
                            title: 'Special Offers',
                            description: 'Get discounts on selected items',
                            image_url: '/storage/slide/slide2.jpg',
                            link_url: '/products'
                        },
                        {
                            slide_id: 3,
                            title: 'New Arrivals',
                            description: 'Check out our newest products',
                            image_url: '/storage/slide/slide3.jpg',
                            link_url: '/products'
                        },
                        {
                            slide_id: 4,
                            title: 'Limited Edition',
                            description: 'Exclusive items just for you',
                            image_url: '/storage/slide/slide5.png',
                            link_url: '/products'
                        }
                    ]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching slides:', error);
                setLoading(false);
                // Use placeholder slides if fetch fails
                setSlides([
                    {
                        slide_id: 1,
                        title: 'BeeBoxing Collection',
                        description: 'Discover our latest products',
                        image_url: '/storage/slide/slide1.jpg',
                        link_url: '/products'
                    },
                    {
                        slide_id: 2,
                        title: 'Special Offers',
                        description: 'Get discounts on selected items',
                        image_url: '/storage/slide/slide2.jpg',
                        link_url: '/products'
                    }
                ]);
            }
        };

        fetchSlides();
    }, []);

    // Auto-play functionality
    useEffect(() => {
        if (!autoPlay || slides.length <= 1) return;

        const slideTimer = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        }, interval);

        return () => clearInterval(slideTimer);
    }, [autoPlay, interval, slides.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const goToPrevSlide = () => {
        setCurrentSlide((prevSlide) => 
            prevSlide === 0 ? slides.length - 1 : prevSlide - 1
        );
    };

    const goToNextSlide = () => {
        setCurrentSlide((prevSlide) => 
            (prevSlide + 1) % slides.length
        );
    };

    if (loading) {
        return <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>;
    }

    if (slides.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full overflow-hidden rounded-lg shadow-xl">
            {/* Main Slider */}
            <div className="relative h-[400px] md:h-[500px]">
                {slides.map((slide, index) => (
                    <div
                        key={slide.slide_id}
                        className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
                            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                    >
                        <img
                            src={slide.image_url}
                            alt={slide.title || `Slide ${index + 1}`}
                            className="absolute object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-white">
                            {slide.title && (
                                <h2 className="text-2xl md:text-4xl font-bold mb-2">{slide.title}</h2>
                            )}
                            {slide.description && (
                                <p className="text-lg md:text-xl">{slide.description}</p>
                            )}
                            {slide.link_url && (
                                <a 
                                    href={slide.link_url} 
                                    className="inline-block mt-4 px-6 py-2 bg-yellow-500 text-black font-semibold rounded-md hover:bg-yellow-400 transition-colors"
                                >
                                    Shop Now
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrevSlide}
                className="absolute top-1/2 left-4 z-20 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 focus:outline-none"
                aria-label="Previous slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={goToNextSlide}
                className="absolute top-1/2 right-4 z-20 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 focus:outline-none"
                aria-label="Next slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full ${
                            index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}