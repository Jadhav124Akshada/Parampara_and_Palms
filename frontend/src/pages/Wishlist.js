import React, { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash, FaShoppingBasket } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { useWishlist } from '../context/WishlistContext';
import 'react-toastify/dist/ReactToastify.css';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // पेजिनेशन स्टेट्स
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // एक पेज पर 6 आइटम्स (2 लाइन * 3 कार्ड्स)

  const { setWishlistCount } = useWishlist();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      fetch(`https://parampara-and-palms.onrender.com/api/wishlist/${userId}/`)
        .then(res => res.json())
        .then(data => {
          setWishlistItems(data);
          setWishlistCount(data.length);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching full wishlist records:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [userId, setWishlistCount]);

  const removeFromWishlist = async (foodId) => {
    try {
      const response = await fetch(`https://parampara-and-palms.onrender.com/api/remove-wishlist/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, food_id: foodId })
      });

      if (response.ok) {
        const updatedList = wishlistItems.filter(item => item.food_id !== foodId);
        setWishlistItems(updatedList);
        setWishlistCount(updatedList.length);
        toast.success("Item removed from your wishlist.");
      } else {
        toast.error("Failed to remove item.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  // पेजिनेशन लॉजिक
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = wishlistItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(wishlistItems.length / itemsPerPage));

  return (
    <PublicLayout>
      <ToastContainer position="top-right" autoClose={2000} theme="light" />

      <div className="container py-5 min-vh-100">
        <h2 className="fw-bold mb-4 text-center">
          My Favorites Wishlist <FaHeart className="text-danger ms-2" />
        </h2>
        <hr className="mb-5" />

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
          </div>
        ) : !userId ? (
          <div className="text-center py-5 shadow-sm rounded bg-light">
            <h4 className="text-muted">Please log in to see your wishlist.</h4>
            <Link to="/login" className="btn btn-dark mt-3 px-4 fw-bold">Login Now</Link>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-5 shadow-sm rounded bg-light">
            <h4 className="text-muted mb-3">Your Wishlist is empty!</h4>
            <Link to="/food-menu" className="btn btn-warning mt-2 px-4 fw-bold">Explore Our Menu</Link>
          </div>
        ) : (
          <>
            <div className="row">
              {currentItems.map((item) => (
                <div className="col-md-4 mb-4" key={item.id}>
                  <div className="card shadow-sm h-100 border-0 overflow-hidden" style={{ borderRadius: '12px' }}>
                    <div className="position-relative">
                      <img
                        src={item.image?.startsWith('http') ? item.image : `https://parampara-and-palms.onrender.com${item.image}`}
                        className="card-img-top w-100"
                        style={{ height: '200px', objectFit: 'cover' }}
                        alt={item.item_name}
                      />
                      <button className="btn btn-light position-absolute top-0 end-0 m-3 shadow-sm" style={{ borderRadius: '50%', color: '#dc3545' }} onClick={() => removeFromWishlist(item.food_id)}>
                        <FaTrash />
                      </button>
                    </div>
                    <div className="card-body p-3">
                      <h5 className="card-title fw-bold">{item.item_name}</h5>
                      <p className="text-muted small">{item.description?.slice(0, 65)}...</p>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <span className="fw-bold text-success fs-5">₹{item.price}</span>
                        <Link to={`/food/${item.food_id}`} className="btn btn-sm btn-outline-primary px-3 fw-bold">
                          <FaShoppingBasket className="me-1" /> Order Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* पेजिनेशन बटन सेक्शन */}
            <div className="mt-4 pb-4 text-center">
              <nav>
                <ul className="pagination justify-content-center shadow-sm d-inline-flex">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link text-dark fw-bold" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
                  </li>
                  <li className="page-item disabled">
                    <span className="page-link text-dark fw-bold">Page {currentPage} of {totalPages}</span>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link text-dark fw-bold" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  );
};

export default Wishlist;