import React, { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import '../styles/home.css';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';    
import 'react-toastify/dist/ReactToastify.css'; 
import { useWishlist } from '../context/WishlistContext';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'; // 🛠️ FaStarHalfAlt इम्पोर्ट किया गया

const Home = () => {
  const [foods, setFoods] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const { setWishlistCount } = useWishlist();
  const userId = localStorage.getItem("userId");

  // 🛠️ रेटिंग्स डेटा और होवर स्टेट्स (ट्यूटोरियल के अनुसार)
  const [ratingsData, setRatingsData] = useState({}); // सभी फ़ूड का रेटिंग समरी स्टोर करने के लिए
  const [hoveredFoodId, setHoveredFoodId] = useState(null); // किस फ़ूड के स्टार्स पर माउस होवर है

  // Fetch random food choices for home page display
  useEffect(() => {
    fetch(`https://parampara-and-palms.onrender.com/api/random-food`)
      .then(res => res.json())
      .then(data => {
        setFoods(data);
      })
      .catch(err => console.error("Error loading top picks:", err));
  }, []);

  // 🛠️ फ़ूड लिस्ट लोड होने के बाद सभी फ़ूड की रेटिंग समरी फ़ेच करना
  useEffect(() => {
    if (foods.length === 0) return;

    const fetchAllSummaries = async () => {
      const aggregatedMap = {};
      
      for (let item of foods) {
        try {
          const res = await fetch(`https://parampara-and-palms.onrender.com/api/food-rating-summary/${item.id}/`);
          if (res.ok) {
            const summary = await res.json();
            aggregatedMap[item.id] = summary;
          }
        } catch (error) {
          console.error(`Failed to fetch rating summary for food id ${item.id}:`, error);
        }
      }
      setRatingsData(aggregatedMap);
    };

    fetchAllSummaries();
  }, [foods]);

  // Load the authenticated user's active favorites list context map
  useEffect(() => {
    if (userId) {
      fetch(`https://parampara-and-palms.onrender.com/api/wishlist/${userId}/`)
        .then(res => res.json())
        .then(data => {
          const wishlistIds = Array.isArray(data) 
            ? data.map(item => item.food_id || item.food) 
            : (data.wishlist_ids || []);
          setWishlist(wishlistIds);
          setWishlistCount(wishlistIds.length);
        })
        .catch(err => console.error("Error loading wishlist:", err));
    }
  }, [userId, setWishlistCount]);

  // Dynamic Toggle Handler to add or remove favorite records seamlessly
  const toggleWishlist = async (foodId) => {
    if (!userId) {
      toast.info("Please log in to use the wishlist feature.");
      return;
    }
    
    const isInWishlist = wishlist.includes(foodId);
    const endpoint = isInWishlist ? 'remove-wishlist/' : 'add-wishlist/';
    
    try {
      const response = await fetch(`https://parampara-and-palms.onrender.com/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, food_id: foodId })
      });
      
      const resData = await response.json();

      if (response.ok) {
        let updatedWishlist = [];
        
        if (isInWishlist) {
          updatedWishlist = wishlist.filter(id => id !== foodId);
          setWishlist(updatedWishlist);
          setWishlistCount(updatedWishlist.length);
          toast.success("Removed from wishlist.");
        } else {
          updatedWishlist = [...wishlist, foodId];
          setWishlist(updatedWishlist);
          setWishlistCount(updatedWishlist.length);
          toast.success("Added to wishlist successfully!");
        }
      } else {
        toast.error(resData.message || "Failed to update wishlist. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please check your network connection.");
    }
  };

  // 🛠️ डाइनेमिक हाफ-स्टार्स की गणना और रेंडरर फ़ंक्शन
  const renderStars = (ratingValue) => {
    const numericRating = Math.min(5, Math.max(0, parseFloat(ratingValue || 0))); // 0 से 5 के बीच सीमित रखें
    const starsArray = [];
    
    for (let i = 1; i <= 5; i++) {
      if (numericRating >= i) {
        // पूर्ण भरा हुआ स्टार
        starsArray.push(<FaStar key={i} className="me-1" style={{ color: '#ffc107' }} />);
      } else if (numericRating >= i - 0.5) {
        // आधा भरा हुआ स्टार (जैसे 2.5 पर तीसरा स्टार आधा होगा)
        starsArray.push(<FaStarHalfAlt key={i} className="me-1" style={{ color: '#ffc107' }} />);
      } else {
        // खाली स्टार
        starsArray.push(<FaRegStar key={i} className="me-1" style={{ color: '#e4e5e9' }} />);
      }
    }
    return starsArray;
  };

  return (
    <PublicLayout>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      
      {/* Hero Header Banner */}
      <section className="hero py-5 text-center" style={{ backgroundImage: "url('/images/b5.png')", height: '80vh', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '40px 20px', borderRadius: '10px' }}>
          <h1 className="display-4 text-white">Quick & Delicious Food Delivered To Your Doorstep</h1>
          <p className="lead text-white-50">Craving Something Delicious? We've Got You Covered!</p>
          <form method='GET' action='/search' className='d-flex justify-content-center mt-4' style={{ maxWidth: '600px', margin: '0 auto' }}>
            <input type='text' name='q' className='form-control w-50 d-inline-block' placeholder='Search for your favorite dishes...'
              style={{ borderTopRightRadius: '0', borderBottomRightRadius: '0' }} />
            <button className="btn btn-warning px-4"
              style={{ borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}>Search</button>
          </form>
        </div>
      </section>

      {/* Most Loved Dishes Content Section */}
      <section className='py-5'>
        <div className='container'>
          <h2 className='text-center mb-4 fw-bold'>
            Most Loved Dishes This Month
            <span className='badge bg-danger ms-2' style={{ fontSize: '0.8rem' }}>Top picks</span>
          </h2>

          <div className='row mt-4'>
            {foods.length === 0 ? (
              <div className="col-12 text-center">
                <p className="text-muted">No Foods Found..</p>
              </div>
            ) : (
              foods.map((food, index) => {
                // इस फ़ूड आइटम का रेटिंग समरी डेटा निकालें
                const summary = ratingsData[food.id];
                const avgRating = summary ? summary.average : 0;
                const totalRatingsCount = summary ? summary.total_reviews : 0;
                const starBreakdown = summary ? summary.breakdown : { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };

                return (
                  <div className='col-md-4 mb-4' key={food.id || index}>
                    <div className='card hovereffect shadow-sm h-100' style={{ borderRadius: '12px', overflow: 'hidden', border: 'none' }}>
                      <div className='position-relative'>
                        <img
                          src={`http://localhost:8000${food.image}`}
                          className='card-img-top w-100'
                          style={{ height: '180px', objectFit: 'cover' }}
                          alt={food.item_name}
                        />
                        <i
                          className={`${wishlist.includes(food.id) ? 'fas fa-heart text-danger' : 'far fa-heart text-secondary'} 
                          position-absolute top-0 end-0 m-3 shadow-sm d-flex align-items-center justify-content-center`}
                          style={{
                            cursor: "pointer",
                            backgroundColor: "white",
                            fontSize: "18px",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                          }}
                          title={wishlist.includes(food.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                          onClick={() => toggleWishlist(food.id)}
                        ></i>
                      </div>

                      <div className='card-body d-flex flex-column justify-content-between p-3'>
                        <div>
                          <h5 className='card-title fw-bold mb-1'>
                            <Link to={`/food/${food.id}`} className="text-decoration-none text-dark">{food.item_name}</Link>
                          </h5>
                          
                          {/* ======================================================== */}
                          {/* 🛠️ स्टार रेटिंग्स और पॉपओवर पैनल (STAR RATINGS & POPOVER SECTION) */}
                          {/* ======================================================== */}
                          {summary && (
                            <div 
                              className="position-relative d-flex align-items-center mb-2" 
                              style={{ fontSize: '14px', height: '22px', cursor: 'pointer', width: 'fit-content' }}
                              onMouseEnter={() => setHoveredFoodId(food.id)} // 👈 स्टार्स पर माउस जाने पर एक्टिव करें
                              onMouseLeave={() => setHoveredFoodId(null)}    // 👈 माउस हटने पर छुपाएं
                            >
                              {/* 🛠️ यहाँ एवरेज के आधार पर डाइनेमिक रूप से हाफ और फुल स्टार्स रेंडर होते हैं */}
                              {renderStars(avgRating)}
                              
                              {/* 🛠️ केवल होवर होने पर एवरेज रेटिंग और कुल रेटिंग संख्या दिखाई देगी */}
                              {hoveredFoodId === food.id && (
                                <span className="text-muted small ms-2 fw-semibold popover-animation" style={{ fontSize: '12px' }}>
                                  {avgRating} ({totalRatingsCount} ratings)
                                </span>
                              )}

                              {/* 🛠️ केवल होवर होने पर ब्रेकडाउन पॉपओवर दिखाई देगा */}
                              {hoveredFoodId === food.id && totalRatingsCount > 0 && (
                                <div 
                                  className="position-absolute bg-white text-dark shadow-lg border p-3 popover-rating-matrix"
                                  style={{ 
                                    bottom: '28px', 
                                    left: '0', 
                                    width: '260px', 
                                    borderRadius: '8px', 
                                    zIndex: '999',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                                  }}
                                >
                                  <h6 className="fw-bold small mb-2 border-bottom pb-1 text-secondary text-start">Rating Summary</h6>
                                  {["5", "4", "3", "2", "1"].map((starKey) => {
                                    const currentCount = starBreakdown[starKey] || 0;
                                    const calculatePercent = totalRatingsCount > 0 ? (currentCount / totalRatingsCount) * 100 : 0;

                                    return (
                                      <div className="d-flex align-items-center mb-1 text-dark" key={starKey} style={{ fontSize: '11px' }}>
                                        <span className="me-2 fw-semibold text-start" style={{ width: '40px' }}>{starKey} star</span>
                                        {/* प्रोग्रेस बार */}
                                        <div className="progress flex-grow-1 bg-light border-0" style={{ height: '8px', borderRadius: '4px' }}>
                                          <div 
                                            className="progress-bar bg-warning" 
                                            role="progressbar" 
                                            style={{ width: `${calculatePercent}%`, borderRadius: '4px' }}
                                            aria-valuenow={calculatePercent} 
                                            aria-valuemin="0" 
                                            aria-valuemax="100"
                                          ></div>
                                        </div>
                                        <span className="ms-2 text-muted fw-bold text-end" style={{ width: '20px' }}>{currentCount}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          <p className='card-text text-muted small mt-1'>{food.description?.slice(0, 50)}...</p>
                        </div>
                        
                        <div className='d-flex justify-content-between align-items-center mt-3 border-top pt-2'>
                          <span className='fw-bold text-success' style={{ fontSize: '1.1rem' }}>₹{food.price}</span>
                          {food.is_available ? (
                            <Link to={`/food/${food.id}`} className='btn btn-sm btn-outline-primary float-end px-3 fw-bold'>
                              <i className='fas fa-shopping-basket me-1'></i>Order Now
                            </Link>
                          ) : (
                            <div title='This Food Item is Currently Unavailable. Please try again later.'>
                              <button className='btn btn-sm btn-outline-secondary float-end fw-bold' disabled>
                                <i className='fas fa-times-circle me-1'></i>Unavailable
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 3 Step Instruction Section */}
      <section className="py-5 bg-white text-dark border-top">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3" style={{ fontSize: '2.5rem' }}>Ordering in 3 Simple Steps</h2>
            <p className="text-muted">Experience gourmet dining from the comfort of your home with our seamless process.</p>
          </div>
          <div className="row g-4 mt-4">
            <div className="col-md-4">
              <div className="h-100 border-0 shadow-sm rounded overflow-hidden">
                <img src="/images/step1.jpg" className="img-fluid w-100" alt="Choose dish" style={{ objectFit: 'cover', height: '350px' }} />
                <div className="p-4 bg-light">
                  <span className="text-uppercase text-muted small fw-bold">Step 1</span>
                  <h4 className="fw-bold mt-2">Choose Your Dish</h4>
                  <p className="text-muted small mb-0">Browse our curated menu of gourmet favorites and find exactly what you’re craving.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="h-100 border-0 shadow-sm rounded overflow-hidden">
                <img src="/images/step2.jpg" className="img-fluid w-100" alt="Set location" style={{ objectFit: 'cover', height: '350px' }} />
                <div className="p-4 bg-light">
                  <span className="text-uppercase text-muted small fw-bold">Step 2</span>
                  <h4 className="fw-bold mt-2">Set Your Location</h4>
                  <p className="text-muted small mb-0">Tell us where you are, and we’ll find the fastest route to get your meal to your door.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="h-100 border-0 shadow-sm rounded overflow-hidden">
                <img src="/images/step3.jpg" className="img-fluid w-100" alt="Enjoy food" style={{ objectFit: 'cover', height: '350px' }} />
                <div className="p-4 bg-light">
                  <span className="text-uppercase text-muted small fw-bold">Step 3</span>
                  <h4 className="fw-bold mt-2">Savor the Flavor</h4>
                  <p className="text-muted small mb-0">Sit back and relax. Our lightning-fast delivery ensures your food arrives hot and fresh.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CSS एनिमेशन स्टाइल टैग */}
      <style>{`
        .popover-rating-matrix, .popover-animation {
          animation: popoverFadeIn 0.15s ease-out;
        }
        @keyframes popoverFadeIn {
          from { opacity: 0; transform: translateY(3px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </PublicLayout>
  );
};

export default Home;