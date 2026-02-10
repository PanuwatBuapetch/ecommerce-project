// src/store/useCart.ts
import { create } from 'zustand';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>((set) => ({
  cart: [],
  addToCart: (product) => set((state) => {
    // 1. ตรวจสอบว่ามีสินค้า ID นี้อยู่ในตะกร้าแล้วหรือยัง
    const existingItem = state.cart.find((item) => item.id === product.id);

    if (existingItem) {
      // 2. ถ้ามีอยู่แล้ว ให้วนลูป Map เพื่อเพิ่มแค่จำนวน (Quantity) ของชิ้นนั้น
      return {
        cart: state.cart.map((item) =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        ),
      };
    }

    // 3. ถ้าเป็นสินค้าใหม่ (ID ไม่ซ้ำกับที่มีอยู่) ให้ Copy ของเดิมไว้แล้วเพิ่มชิ้นใหม่ต่อท้าย
    return { 
      cart: [...state.cart, { ...product, quantity: 1 }] 
    };
  }),
  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== id),
  })),
  clearCart: () => set({ cart: [] }),
}));