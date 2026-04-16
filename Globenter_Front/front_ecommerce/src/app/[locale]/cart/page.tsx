"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { updateCartItem, removeCartItem } from "@/store/slices/cartSlice";
import Image from "next/image";
import { FiTrash, FiMinus, FiPlus, FiBox } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const cartItems = useSelector((state: RootState) => state.cart.items) ?? [];

  const totalPrice = cartItems.reduce(
    (sum, item) =>
      sum + (Number(item.product?.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );

  const getImageUrl = (image?: string | null) =>
    image && image.startsWith("http") ? image : null;

  const handleIncrease = (itemId: number, currentQuantity: number) => {
    dispatch(updateCartItem({ itemId, quantity: currentQuantity + 1 }));
  };

  const handleDecrease = (itemId: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      dispatch(updateCartItem({ itemId, quantity: currentQuantity - 1 }));
    } else {
      dispatch(removeCartItem(itemId));
    }
  };

  const handleRemove = (itemId: number) => {
    dispatch(removeCartItem(itemId));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    router.push("/checkout"); // ✅ navigate to checkout
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="w-[90%] mx-auto space-y-8">
        {/* Title */}
        <h1 className="text-4xl font-bold text-[#b16926]">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Summary */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#b16926]">
              Order Summary
            </h2>

            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
              <span>Total Items:</span>
              <span>{totalItems}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
              <span>Total Price:</span>
              <span>
                AFN {totalPrice.toLocaleString()} ($
                {(totalPrice / 68).toFixed(2)})
              </span>
            </div>

            <div className="flex justify-between font-bold py-3 border-b border-gray-200 dark:border-gray-800">
              <span>Amount to Pay:</span>
              <span>AFN {totalPrice.toLocaleString()}</span>
            </div>

            {/* ✅ Checkout button */}
            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="w-full bg-[#b16926] hover:bg-[#f1a013] text-white py-3 rounded-2xl font-bold mt-4 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pay & Complete Order
            </button>

            <Link href="/">
              <button className="w-full border border-[#b16926] text-[#b16926] py-3 rounded-2xl mt-2 hover:bg-[#f1a013]/10 transition dark:text-[#f1a013]">
                Continue Shopping
              </button>
            </Link>
          </div>

          {/* Products */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#b16926]">
              Selected Products ({totalItems})
            </h2>

            {cartItems.length > 0 ? (
              cartItems.map(
                (item) =>
                  item.product && (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 py-4"
                    >
                      {/* Product Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {getImageUrl(item.product.image) ? (
                            <Image
                              src={getImageUrl(item.product.image)!}
                              alt={item.product.name}
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          ) : (
                            <FiBox className="text-gray-400 dark:text-gray-500 text-3xl" />
                          )}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-100">
                            {item.product.name}
                          </p>
                          <p className="text-[#b16926] font-bold mt-1">
                            AFN{" "}
                            {Number(item.product.price).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <button
                          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-full"
                          onClick={() =>
                            handleDecrease(item.id, item.quantity)
                          }
                        >
                          <FiMinus />
                        </button>

                        <span className="px-3 font-medium">
                          {item.quantity}
                        </span>

                        <button
                          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-full"
                          onClick={() =>
                            handleIncrease(item.id, item.quantity)
                          }
                        >
                          <FiPlus />
                        </button>

                        <button
                          className="text-red-500 hover:text-red-600 ml-4"
                          onClick={() => handleRemove(item.id)}
                        >
                          <FiTrash size={20} />
                        </button>
                      </div>
                    </div>
                  )
              )
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                Your cart is empty.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
