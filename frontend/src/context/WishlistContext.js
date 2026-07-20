import { createContext, useContext, useState } from "react";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [WishlistCount, setWishlistCount] = useState(0);

  return (
    <WishlistContext.Provider value={{ wishlistCount: WishlistCount, setWishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
