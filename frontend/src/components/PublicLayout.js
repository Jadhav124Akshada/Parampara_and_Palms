import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  FaHeart,
  FaHome,
  FaShoppingCart,
  FaSignInAlt,
  FaTruck,
  FaUserPlus,
  FaUserShield,
  FaUtensils,
  FaUser,
  FaHamburger,
  FaUserCircle,
  FaCogs,
  FaSignOutAlt
} from 'react-icons/fa';

import '../styles/Layout.css';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

import Chatbot from './Chatbot';


const PublicLayout = ({ children }) => {


  const [isLoggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  const { cartCount, setCartCount } = useCart();
  const { wishlistCount, setWishlistCount } = useWishlist();


  const navigate = useNavigate();


  const userId = localStorage.getItem("userId");
  const name = localStorage.getItem("userName");



  // Fetch Cart Count
  const fetchCartCount = async () => {

    if(userId){

      try{

        const response = await fetch(
          `https://parampara-and-palms.onrender.com/api/cart/${userId}/`
        );

        const data = await response.json();


        if(Array.isArray(data)){

          setCartCount(data.length);

        }
        else{

          setCartCount(
            data.cartItemCount || 0
          );

        }


      }
      catch(error){

        console.log(
          "Cart error:",
          error
        );

      }

    }

  };





  // Fetch Wishlist Count
  const fetchWishlistCount = async () => {


    if(userId){

      try{


        const response = await fetch(
          `https://parampara-and-palms.onrender.com/api/wishlist/${userId}/`
        );


        const data = await response.json();



        if(Array.isArray(data)){

          setWishlistCount(data.length);

        }
        else{

          setWishlistCount(
            data.wishlistItemCount || 0
          );

        }



      }
      catch(error){

        console.log(
          "Wishlist error:",
          error
        );

      }

    }


  };






  // Login check
  useEffect(()=>{


    if(userId && name){

      setLoggedIn(true);
      setUserName(name);

      fetchCartCount();
      fetchWishlistCount();

    }


  },[userId,name]);







  // Logout
  const handleLogout = ()=>{


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


      {/* Navbar */}

      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

        <div className="container-fluid">


          <Link
            className="navbar-brand fw-bold"
            to="/"
          >

            <img
              src="/images/p.ico"
              alt="Logo"
              width="60"
              height="60"
              className="me-1"
            />

            Parampara & Palms

          </Link>





          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
          >

            <span className="navbar-toggler-icon"></span>

          </button>





          <div
            className="collapse navbar-collapse"
            id="navbarSupportedContent"
          >


            <ul className="navbar-nav ms-auto">





              <li className="nav-item">

                <Link
                  className="nav-link"
                  to="/"
                >

                  <FaHome className="me-1"/>
                  Home

                </Link>

              </li>






              <li className="nav-item">

                <Link
                  className="nav-link"
                  to="/food-menu"
                >

                  <FaUtensils className="me-1"/>
                  Menu

                </Link>

              </li>






              <li className="nav-item">

                <Link
                  className="nav-link"
                  to="/track-order"
                >

                  <FaTruck className="me-1"/>
                  Track

                </Link>

              </li>







              {!isLoggedIn ? (

                <>


                <li className="nav-item">

                  <Link
                    className="nav-link"
                    to="/register"
                  >

                    <FaUserPlus className="me-1"/>
                    Register

                  </Link>

                </li>




                <li className="nav-item">

                  <Link
                    className="nav-link"
                    to="/login"
                  >

                    <FaSignInAlt className="me-1"/>
                    Login

                  </Link>

                </li>





                <li className="nav-item">

                  <Link
                    className="nav-link"
                    to="/admin-login"
                  >

                    <FaUserShield className="me-1"/>
                    Admin

                  </Link>

                </li>


                </>



              ) : (



                <>


                <li className="nav-item">

                  <Link
                    className="nav-link"
                    to="/my-orders"
                  >

                    <FaHamburger className="me-1"/>
                    My Orders

                  </Link>

                </li>





                <li className="nav-item">

                  <Link
                    className="nav-link"
                    to="/cart"
                  >

                    <FaShoppingCart className="me-1"/>

                    Cart

                    {
                      cartCount > 0 &&
                      ` (${cartCount})`
                    }

                  </Link>

                </li>







                <li className="nav-item">

                  <Link
                    className="nav-link"
                    to="/wishlist"
                  >

                    <FaHeart className="me-1 text-danger"/>

                    Wishlist

                    {
                      wishlistCount > 0 &&
                      ` (${wishlistCount})`
                    }


                  </Link>

                </li>







                <li className="nav-item dropdown">


                  <button

                    className="nav-link btn btn-link dropdown-toggle text-capitalize border-0"

                    data-bs-toggle="dropdown"

                  >

                    <FaUserCircle className="me-1"/>

                    {userName}


                  </button>




                  <ul className="dropdown-menu dropdown-menu-end">


                    <li>

                      <Link
                        className="dropdown-item"
                        to="/profile"
                      >

                        <FaUser className="me-1"/>
                        Profile

                      </Link>

                    </li>




                    <li>

                      <Link
                        className="dropdown-item"
                        to="/change-password"
                      >

                        <FaCogs className="me-1"/>
                        Settings

                      </Link>

                    </li>



                    <li>
                      <hr className="dropdown-divider"/>
                    </li>




                    <li>

                      <button
                        className="dropdown-item"
                        onClick={handleLogout}
                      >

                        <FaSignOutAlt className="me-1"/>
                        Logout

                      </button>


                    </li>


                  </ul>


                </li>



                </>


              )}



            </ul>


          </div>



        </div>


      </nav>







      {/* ONLY ONE PAGE RENDER */}

      <div className="min-vh-100">

          {children}

      </div>







      {/* ONLY ONE CHATBOT */}

      <Chatbot />







      {/* Footer */}

      <footer className="text-center py-4 bg-dark text-white-50 border-top border-secondary">

        <div className="container">

          <p className="mb-0">

            © 2026 Parampara & Palms. All rights reserved.

          </p>

        </div>

      </footer>




    </div>

  );

};


export default PublicLayout;