import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaHeart, FaHome, FaShoppingCart, FaSignInAlt, FaTruck, 
  FaUserPlus, FaUserShield, FaUtensils, FaUser, FaHamburger, 
  FaUserCircle, FaCogs, FaSignOutAlt 
} from 'react-icons/fa';
import '../styles/Layout.css';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const PublicLayout = ({ children }) => {
  
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const { cartCount, setCartCount } = useCart();
  const { wishlistCount, setWishlistCount } = useWishlist();

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const name = localStorage.getItem("userName");

  // 1. Synchronize shopping cart item totals from core backend API
  const fetchCartCount = async () => {
    if (userId) {
      try {
        const response = await fetch(`http://localhost:8000/api/cart/${userId}/`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setCartCount(data.length);
        } else {
          setCartCount(data.cartItemCount || 0);
        }
      } catch (error) {
        console.error("Cart synchronization error:", error);
      }
    }
  };

  // 2. Synchronize active customer wishlist arrays from core backend API
  const fetchWishlistCount = async () => {
    if (userId) {
      try {
        const response = await fetch(`http://localhost:8000/api/wishlist/${userId}/`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setWishlistCount(data.length);
        } else {
          // Supports custom array mapper wrappers like wishlist_ids or counter responses
          setWishlistCount(data.wishlist_ids ? data.wishlist_ids.length : (data.wishlistItemCount || 0));
        }
      } catch (error) {
        console.error("Wishlist synchronization error:", error);
      }
    }
  };

  // 3. Monitor active authentication parameters to load accurate counter contextual state metrics
  useEffect(() => {
    if (userId && name) {
      setLoggedIn(true);
      setUserName(name);
      fetchCartCount();
      fetchWishlistCount();
    }
  }, [userId, name]);

  // 4. Session deletion log out clearing routine handler
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    setLoggedIn(false);
    setUserName("");
    setCartCount(0);
    setWishlistCount(0);
    navigate("/login");
  };

  return (
    <div>
      {/* Bootstrap Sticky Dynamic Header Panel Wrapper Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/">
            <img src="/images/p.ico" alt="Logo" className="me-1" width="60" height="60"/>
            Parampara & Palms
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/"> <FaHome className="me-1"/>Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/food-menu"> <FaUtensils className="me-1"/>Menu</Link>
              </li>
              <li className="nav-item">
                <Link  className="nav-link" to="/track-order"> <FaTruck className="me-1"/>Track</Link>
              </li>
              
              {!isLoggedIn ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register"> <FaUserPlus className="me-1"/>Register</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login"> <FaSignInAlt className="me-1"/>Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin-login"> <FaUserShield className="me-1"/>Admin</Link>
                  </li>
                </>
              ) : (
                <> 
                  <li className="nav-item">
                    <Link className="nav-link" to="/my-orders"> <FaHamburger className="me-1"/>My Orders</Link>
                  </li> 
                  <li className="nav-item">
                    <Link className="nav-link" to="/cart"> 
                      <FaShoppingCart className="me-1"/>
                      Cart {cartCount > 0 && ` (${cartCount})`}
                    </Link>
                  </li> 
                  <li className="nav-item">
                    {/* ADDED: Connected directly to your specific dynamic view routing path alongside active counter arrays */}
                    <Link className="nav-link" to="/wishlist"> 
                      <FaHeart className="me-1 text-danger"/>
                      Wishlist {wishlistCount > 0 && ` (${wishlistCount})`}
                    </Link>
                  </li> 
                  
                  {/* Account Profile Dropdown Control System */}
                  <li className="nav-item dropdown">
                    <button className="nav-link btn btn-link dropdown-toggle text-capitalize border-0 y-0 align-baseline" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <FaUserCircle className="me-1"/> {userName}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                      <li><Link className="dropdown-item" to="/profile"><FaUser className="me-1"/>Profile</Link></li>
                      <li><Link className="dropdown-item" to="/change-password"><FaCogs className="me-1"/>Settings</Link></li>
                      <li><hr className="dropdown-divider"/></li>
                      <li><button className="dropdown-item" onClick={handleLogout}><FaSignOutAlt className="me-1"/>Logout</button></li>
                    </ul>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
         
      {/* Main Container Mounting Component Page Block Injector */}
      <div className="min-vh-100">{children}</div>

      {/* Footer Branding Wrapper Bar */}
      <footer className='text-center py-4 bg-dark text-white-50 border-top border-secondary'>
        <div className='container'>
          <p className="mb-0">&copy; 2026 Parampara & Palms. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;