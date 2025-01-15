<?php

namespace App\Http\Controllers\API;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductInventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    public function addProdToCart(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'inventory_id' => 'required|exists:product_inventory,inventory_id',
                'quantity' => 'required|integer|min:1'
            ]);

            // Check if product inventory has enough stock
            $inventory = ProductInventory::find($validated['inventory_id']);
            if (!$inventory || $inventory->stock_quantity < $validated['quantity']) {
                return response()->json([
                    'status' => false,
                    'message' => 'Not enough stock available'
                ], 400);
            }

            // Get or create cart for user
            $cart = Cart::firstOrCreate(
                ['user_id' => Auth::id()],
                ['created_at' => now(), 'updated_at' => now()]
            );

            DB::beginTransaction();

            // Check if item already exists in cart
            $cartItem = CartItem::where('cart_id', $cart->cart_id)
                ->where('inventory_id', $validated['inventory_id'])
                ->first();

            if ($cartItem) {
                // Update quantity if item exists
                $newQuantity = $cartItem->quantity + $validated['quantity'];

                // Check if new total quantity exceeds available stock
                if ($newQuantity > $inventory->stock_quantity) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Cannot add more items. Exceeds available stock.'
                    ], 400);
                }

                $cartItem->update([
                    'quantity' => $newQuantity,
                    'updated_at' => now()
                ]);
            } else {
                // Create new cart item
                CartItem::create([
                    'cart_id' => $cart->cart_id,
                    'inventory_id' => $validated['inventory_id'],
                    'quantity' => $validated['quantity'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Product added to cart successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Error adding product to cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCart()
    {
        try {
            $userId = Auth::check() ? Auth::id() : null;
            $cart = Cart::where('user_id', $userId)
                ->with(['items.inventory.color.product' => function ($query) {
                    $query->with(['category', 'colors' => function ($q) {
                        $q->with(['images' => function ($q) {
                            $q->where('is_primary', true);
                        }]);
                    }]);
                }])
                ->first();

            if (!$cart) {
                return response()->json([
                    'status' => true,
                    'data' => null
                ]);
            }

            $cartItems = $cart->items->map(function ($item) {
                try {
                    $product = $item->inventory->color->product;
                    $basePrice = $product->base_price * (1 - ($product->discount / 100));
                    $priceAdjustment = $item->inventory->price_adjustment;
                    $finalPrice = $basePrice * (1 + ($priceAdjustment / 100));

                    return [
                        'cart_item_id' => $item->cart_item_id,
                        'product_id' => $product->product_id,
                        'product_name' => $product->name,
                        'color_name' => $item->inventory->color->color_name,
                        'size' => $item->inventory->size,
                        'quantity' => $item->quantity,
                        'stock_quantity' => $item->inventory->stock_quantity,
                        'unit_price' => round($finalPrice),
                        'subtotal' => round($finalPrice * $item->quantity),
                        'image_url' => $product->colors->first(function ($color) {
                            return $color->images->contains('is_primary', true);
                        })->images->firstWhere('is_primary', true)->image_url ?? null
                    ];
                } catch (\Exception $e) {
                    Log::error('Error mapping cart item: ' . $e->getMessage());
                    return null;
                }
            })->filter();

            return response()->json([
                'status' => true,
                'data' => [
                    'cart_id' => $cart->cart_id,
                    'items' => $cartItems
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting cart data: ' . $e->getMessage());

            return response()->json([
                'status' => false,
                'message' => 'Error getting cart data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // Thêm API để cập nhật số lượng
    public function updateQuantity(Request $request)
    {
        try {
            $validated = $request->validate([
                'cart_item_id' => 'required|exists:cart_items,cart_item_id',
                'quantity' => 'required|integer|min:1'
            ]);

            $cartItem = CartItem::find($validated['cart_item_id']);

            $userId = Auth::check() ? Auth::id() : null;
            $cart = Cart::where('cart_id', $cartItem->cart_id)
                ->where('user_id', $userId)
                ->first();

            if (!$cart) {
                return response()->json([
                    'status' => false,
                    'message' => 'Cart item not found'
                ], 404);
            }

            // Kiểm tra tồn kho
            if ($validated['quantity'] > $cartItem->inventory->stock_quantity) {
                return response()->json([
                    'status' => false,
                    'message' => 'Not enough stock available'
                ], 400);
            }

            $cartItem->update([
                'quantity' => $validated['quantity']
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Quantity updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error updating quantity',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // API xóa item khỏi giỏ hàng
    public function removeItem(Request $request)
    {
        try {
            $validated = $request->validate([
                'cart_item_id' => 'required|exists:cart_items,cart_item_id'
            ]);

            $cartItem = CartItem::find($validated['cart_item_id']);

            $userId = Auth::check() ? Auth::id() : null;
            $cart = Cart::where('cart_id', $cartItem->cart_id)
                ->where('user_id', $userId)
                ->first();


            if (!$cart) {
                return response()->json([
                    'status' => false,
                    'message' => 'Cart item not found'
                ], 404);
            }

            $cartItem->delete();

            return response()->json([
                'status' => true,
                'message' => 'Item removed from cart'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error removing item',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
