"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Search,
  Filter,
  Star,
  Loader2,
  ChevronRight,
  ShoppingBag,
  Heart,
  Zap,
  LayoutGrid,
  X,
  Trash2,
} from "lucide-react";
import { useCart } from "@/src/store/useCart";

interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  image_url: string;
  category: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false); // State สำหรับสถานะกำลังสั่งซื้อ

  const { cart, addToCart, removeFromCart, clearCart } = useCart(); // เพิ่ม clearCart มาใช้หลังสั่งซื้อสำเร็จ
  const totalItemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0); // คำนวณราคารวม

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8080/api/products");
        if (!res.ok) throw new Error("Server responded with error");

        const data = await res.json();
        setProducts(data || []);
      } catch (error) {
        console.error("Fetch Error:", error);
        setProducts([
          { id: 1, name: "Test Product", price: 100, rating: 5, image_url: "", category: "Monitor" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 🚀 ฟังก์ชันสั่งซื้อสินค้า (Checkout)
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    try {
      const res = await fetch("http://127.0.0.1:8080/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_amount: totalPrice, // ส่งราคารวมไป
          user_id: 1, // สมมติว่า User ID คือ 1 ไปก่อน
        }),
      });

      if (!res.ok) throw new Error("Order failed");

      const data = await res.json();
      alert(`✅ สั่งซื้อสำเร็จ! รหัสออเดอร์: ${data.order_id}`);
      
      clearCart(); // ล้างตะกร้า
      setIsCartOpen(false); // ปิด Sidebar
      
    } catch (error) {
      alert("❌ เกิดข้อผิดพลาดในการสั่งซื้อ");
      console.error(error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ทั้งหมด" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 relative">
      {/* --- Cart Sidebar --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8 border-b pb-4">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-indigo-600" /> ตะกร้าของคุณ
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {cart.length === 0 ? (
                <div className="text-center py-20 opacity-40">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4" />
                  <p className="font-bold">ยังไม่มีสินค้าในตะกร้า</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id} // ใช้ key ตาม id ที่แก้แล้ว
                    className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors"
                  >
                    <div className="w-20 h-20 bg-white rounded-xl overflow-hidden border flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-indigo-600 font-black">
                        ฿{item.price.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        จำนวน: {item.quantity}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* ส่วนสรุปราคาและปุ่ม Checkout */}
            {cart.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-slate-400 font-bold">ราคารวมทั้งหมด</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    ฿{totalPrice.toLocaleString()}
                  </span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> กำลังบันทึก...
                    </>
                  ) : (
                    "ยืนยันการสั่งซื้อ"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Navbar และส่วนอื่นๆ เหมือนเดิม --- */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                E-commerce System
              </span>
            </div>

            <div className="hidden lg:flex flex-1 max-w-xl mx-12">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="ค้นหาอุปกรณ์เทพๆ ใน Poom Store..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-100/50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all duration-300"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItemsInCart > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce border-2 border-white">
                  {totalItemsInCart}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar - ระบบ Filter หมวดหมู่ */}
          <aside className="w-full lg:w-64 space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-600" /> หมวดหมู่
            </h3>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-2">
              {[
                "ทั้งหมด",
                "Monitor",
                "Gaming Gear",
                "Gadget",
                "Furniture",
                "Accessories",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all font-bold ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105"
                      : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900">
                สินค้า
                {selectedCategory !== "ทั้งหมด"
                  ? `หมวด ${selectedCategory}`
                  : "ทั้งหมด"}
              </h2>
              <p className="text-slate-500 font-medium">
                พบสินค้า {filteredProducts.length} รายการ
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <p className="font-bold text-slate-400">
                  กำลังเตรียมอุปกรณ์เทพๆ ให้คุณ...
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">
                  ไม่พบสินค้าที่คุณต้องการในหมวดนี้
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product, index) => (
                  <div
                    key={`${product.id}-${index}`}
                    className="group bg-white rounded-[2rem] border border-slate-200/60 p-4 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-50 mb-6 border border-slate-100">
                      <img
                        src={
                          product.image_url ||
                          "https://via.placeholder.com/400x300?text=Poom+Store"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="px-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                          {product.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-slate-400">
                            {product.rating || "5.0"}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-black text-slate-800 my-2 text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                            ราคาพิเศษ
                          </span>
                          <span className="text-2xl font-black text-slate-900">
                            ฿{product.price.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-indigo-600 shadow-lg shadow-black/5 hover:shadow-indigo-200 transition-all active:scale-90"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}