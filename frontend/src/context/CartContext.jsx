import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item._id === product._id,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item._id !== productId),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item._id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
