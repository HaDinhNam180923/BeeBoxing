<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Order;
use App\Models\OrderDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ReviewController extends Controller
{

    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            // Log input data
            Log::info('Review submission data:', $request->all());

            // Validate request
            $validated = $request->validate([
                'product_id' => 'required|exists:products,product_id',
                'order_id' => 'required|exists:orders,order_id',
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|min:10',
                'images.*' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
            ]);

            // Verify user owns the order
            $order = Order::where('order_id', $validated['order_id'])
                ->where('user_id', Auth::id())
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Order not found or unauthorized'
                ], 403);
            }

            // Handle image upload
            $imageUrls = [];
            $uploadedFiles = [];

            if ($request->hasFile('images')) {
                $images = $request->file('images');

                foreach ($images as $image) {
                    try {
                        // Generate unique filename
                        $filename = uniqid() . '_' . time() . '.' . $image->getClientOriginalExtension();

                        // Store image in public/reviews directory
                        $path = $image->storeAs('reviews', $filename);

                        // Add to image URLs array
                        $imageUrls[] = '/storage/reviews/' . $filename;
                        $uploadedFiles[] = $path;
                    } catch (\Exception $e) {
                        // Delete any uploaded files if upload fails
                        foreach ($uploadedFiles as $file) {
                            Storage::delete($file);
                        }

                        Log::error('File upload failed: ' . $e->getMessage());
                        return response()->json([
                            'status' => false,
                            'message' => 'Failed to upload images',
                            'error' => $e->getMessage()
                        ], 500);
                    }
                }
            }

            // Create review
            $review = Review::create([
                'user_id' => Auth::id(),
                'product_id' => $validated['product_id'],
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
                'is_visible' => true,
                'image_urls' => $imageUrls,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();

            Log::info('Review created successfully', ['review_id' => $review->review_id]);

            return response()->json([
                'status' => true,
                'message' => 'Review submitted successfully',
                'data' => $review
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            // Delete uploaded files if transaction failed
            foreach ($uploadedFiles as $file) {
                Storage::delete($file);
            }

            Log::error('Review creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Error creating review',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function getUserReviews()
    {
        try {
            $reviews = Review::where('user_id', Auth::id())
                ->with(['product:product_id,name'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => true,
                'data' => $reviews
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching user reviews: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error fetching reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getProductReviews($productId)
    {
        try {
            $reviews = Review::where('product_id', $productId)
                ->where('is_visible', true)
                ->with(['user:id,name'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => true,
                'data' => $reviews
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching product reviews: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error fetching reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $reviewId)
    {
        try {
            $review = Review::where('review_id', $reviewId)
                ->where('user_id', Auth::id())
                ->first();

            if (!$review) {
                return response()->json([
                    'status' => false,
                    'message' => 'Review not found or unauthorized'
                ], 403);
            }

            $validated = $request->validate([
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|min:10',
                'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
            ]);

            // Handle image upload if new image is provided
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($review->image_urls && count($review->image_urls) > 0) {
                    Storage::delete(str_replace('/storage', 'public', $review->image_urls[0]));
                }

                $file = $request->file('image');
                $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('reviews', $filename);
                $validated['image_urls'] = ['/storage/reviews/' . $filename];
            }

            $review->update($validated);

            return response()->json([
                'status' => true,
                'message' => 'Review updated successfully',
                'data' => $review
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating review: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error updating review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($reviewId)
    {
        try {
            $review = Review::where('review_id', $reviewId)
                ->where('user_id', Auth::id())
                ->first();

            if (!$review) {
                return response()->json([
                    'status' => false,
                    'message' => 'Review not found or unauthorized'
                ], 403);
            }

            // Delete associated image if exists
            if ($review->image_urls && count($review->image_urls) > 0) {
                Storage::delete(str_replace('/storage', 'public', $review->image_urls[0]));
            }

            $review->delete();

            return response()->json([
                'status' => true,
                'message' => 'Review deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting review: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error deleting review',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
