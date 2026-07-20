import React, { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { useParams, useNavigate } from 'react-router-dom';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaStar, FaStarHalfAlt, FaRegStar, FaEdit, FaTrash } from 'react-icons/fa'; // 🛠️ FaStarHalfAlt को इम्पोर्ट किया गया

const FoodDetail = () => {
    const userId = localStorage.getItem("userId");
    const { id } = useParams();
    const navigate = useNavigate();

    const [food, setFood] = useState(null); 
    
    // रिव्यू और रेटिंग सिस्टम के लिए स्टेट वेरिएबल्स
    const [reviews, setReviews] = useState([]);          // सभी रिव्यूज लिस्ट के लिए
    const [summary, setSummary] = useState(null);        // एग्रीगेटेड एवरेज और स्टार काउंट समरी के लिए
    const [rating, setRating] = useState(0);             // सेलेक्टेड स्टार्स के लिए
    const [comment, setComment] = useState('');           // रिव्यू टेक्स्ट के लिए
    const [hoveredRating, setHoveredRating] = useState(0); // स्टार्स होवर इफ़ेक्ट के लिए
    const [editId, setEditId] = useState(null);          // एडिट मोड ट्रैकिंग के लिए

    // डेटा लोड करने का मुख्य हुक
    useEffect(() => {
        // 1. फ़ूड आइटम डिटेल्स फ़ेच करें
        fetch(`http://localhost:8000/api/foods/${id}`)
            .then(res => res.json())
            .then(data => setFood(data));

        // 2. इस फ़ूड के सभी रिव्यूज़ फ़ेच करें
        fetch(`http://localhost:8000/api/reviews/${id}/`)
            .then(res => res.json())
            .then(data => setReviews(data))
            .catch(err => console.error("Error fetching reviews:", err));

        // 3. बैकएंड से ओवरऑल रेटिंग का एवरेज और ब्रेकडाउन समरी फ़ेच करें
        fetch(`http://localhost:8000/api/food-rating-summary/${id}/`)
            .then(res => res.json())
            .then(data => setSummary(data))
            .catch(err => console.error("Error fetching rating summary:", err));
    }, [id]);

    // हेल्पर फ़ंक्शन: सबमिशन या डिलीट के बाद समरी को तुरंत रिफ्रेश करने के लिए
    const refreshReviewsAndSummary = async () => {
        try {
            const resReviews = await fetch(`http://localhost:8000/api/reviews/${id}/`);
            const dataReviews = await resReviews.json();
            setReviews(dataReviews);

            const resSummary = await fetch(`http://localhost:8000/api/food-rating-summary/${id}/`);
            const dataSummary = await resSummary.json();
            setSummary(dataSummary);
        } catch (err) {
            console.error("Error refreshing data:", err);
        }
    };

    // 🛒 कार्ट में फ़ूड आइटम जोड़ना
    const handleAddToCart = async () => {
        if (!userId) {
            navigate("/login");
            return;
        }
        try {
            const response = await fetch('http://localhost:8000/api/cart/add/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userID: userId,
                    foodID: food.id
                }),
            });
            const data = await response.json();

            if (response.status === 200) {
                toast.success('Food Item Added To Cart!');
                setTimeout(() => {
                    navigate('/cart');
                }, 2000);
            } else {
                toast.error(data.message || 'Something went Wrong');
            }
        } catch (error) {
            toast.error('Server error. Please try again later.');
        }
    }; 

    // 🛠️ रिव्यू सबमिट या अपडेट करने का हैंडलर
    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            toast.warn("Please log in first to submit a review.");
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        if (rating < 1 || rating > 5) {
            toast.error("Please select a rating between 1 and 5 stars.");
            return;
        }

        const payload = {
            user_id: userId,
            food: id,
            rating: rating,
            comment: comment.trim()
        };

        const url = editId 
            ? `http://localhost:8000/api/review-edit/${editId}/`
            : `http://localhost:8000/api/reviews/add/${id}/`;

        const method = editId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success(editId ? "Review updated successfully!" : "Review submitted successfully!");
                setComment('');
                setRating(0);
                setEditId(null);
                refreshReviewsAndSummary(); 
            } else {
                toast.error("Failed to save review.");
            }
        } catch (err) {
            toast.error("Something went wrong.");
        }
    };

    // 🛠️ रिव्यू एडिट मोड एक्टिवेट करने का हैंडलर
    const handleEditTrigger = (review) => {
        setEditId(review.id);
        setRating(review.rating);
        setComment(review.comment);
    };

    // 🛠️ रिव्यू डिलीट करने का हैंडलर
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        try {
            const response = await fetch(`http://localhost:8000/api/review-delete/${reviewId}/`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success("Review deleted successfully.");
                refreshReviewsAndSummary(); 
            } else {
                toast.error("Failed to delete review.");
            }
        } catch (err) {
            toast.error("Could not connect to server.");
        }
    };

    // 🛠️ बिल्कुल सटीक हाफ-स्टार और इनलाइन कलर रेंडरर लॉजिक
    const renderStars = (ratingValue) => {
        const cappedRating = Math.min(5, Math.max(0, parseFloat(ratingValue || 0)));
        const starsArray = [];
        
        for (let i = 1; i <= 5; i++) {
            if (i <= cappedRating) {
                // पूरा भरा हुआ स्टार (सॉलिड गोल्ड)
                starsArray.push(<FaStar key={i} className="me-1" style={{ color: '#ffc107' }} />);
            } else if (i - 0.5 <= cappedRating) {
                // आधा भरा हुआ स्टार (हाफ गोल्ड - जैसे 2.5 होने पर तीसरा स्टार आधा दिखेगा)
                starsArray.push(<FaStarHalfAlt key={i} className="me-1" style={{ color: '#ffc107' }} />);
            } else {
                // खाली स्टार (ग्रे आउटलाइन)
                starsArray.push(<FaRegStar key={i} className="me-1" style={{ color: '#e4e5e9' }} />);
            }
        }
        return starsArray;
    };

    if (!food) {
        return <div className="text-center p-5">loading...</div>;
    }

    const avgRating = summary ? summary.average : 0;
    const totalReviewsCount = summary ? summary.total_reviews : 0;

    return (
        <PublicLayout>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <div className='container py-5'>
                {/* फ़ूड डिटेल्स कार्ड अनुभाग */}
                <div className='row align-items-center mb-5'>
                    <div className='col-md-5 text-center'>
                        <Zoom>
                            <img 
                                src={`http://localhost:8000${food.image}`} 
                                className='img-fluid rounded shadow-sm' 
                                style={{ width: '100%', maxHeight: '350px', objectFit: 'cover' }} 
                                alt={food.item_name}
                            />
                        </Zoom>
                    </div>
                    <div className='col-md-7 ps-md-5'>
                        <h2 className="fw-bold text-dark mb-1">{food.item_name}</h2>
                        
                        {/* ======================================================== */}
                        {/* 🛠️ टॉप एवरेज रेटिंग और हाफ-स्टार डिस्प्ले                */}
                        {/* ======================================================== */}
                        {summary && (
                            <div className="d-flex align-items-center mb-3" style={{ fontSize: '16px' }}>
                                <div className="d-flex align-items-center">
                                    {renderStars(avgRating)}
                                </div>
                                <span className="text-dark fw-bold me-1 ms-2">{avgRating}</span>
                                <span className="text-muted small">({totalReviewsCount} {totalReviewsCount === 1 ? 'rating' : 'ratings'})</span>
                            </div>
                        )}

                        <p className='text-muted mb-3'>{food.description}</p>
                        <p className="mb-2"><strong>Category: </strong><span className="badge bg-light text-dark border">{food.category_name}</span></p>
                        <h3 className="text-success fw-bold mb-2">₹{food.price}</h3>
                        <p className='mb-4'>Shipping: <strong>Free</strong></p>
                        
                        {food.is_available ? (
                            <button className='btn btn-lg btn-warning px-4 fw-bold shadow-sm' onClick={handleAddToCart}>
                                <i className='fas fa-cart-plus me-2'></i>Add to cart
                            </button>
                        ) : (
                            <div title='This Food Item is Currently Unavailable. Please try again later.'>
                                <button className='btn btn-md btn-outline-secondary' disabled>
                                    <i className='fas fa-times-circle me-1'></i>Currently Unavailable
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <hr className="my-5" />

                {/* समीक्षा (Review) ग्राफ़िकल प्रोग्रेस बार सेक्शन */}
                <div className="review-section mt-4">
                    <h4 className="fw-bold mb-4">Customer Reviews</h4>

                    <div className="row">
                        {/* बायाँ कॉलम: प्रोग्रेस बार ग्राफिकल समरी */}
                        {summary && totalReviewsCount > 0 && (
                            <div className="col-md-5 mb-4 mb-md-0 border-end pe-md-4">
                                <div className="card p-4 border-0 shadow-sm bg-light text-center mb-3">
                                    <h1 className="fw-extrabold text-dark m-0" style={{ fontSize: '3rem' }}>{avgRating}</h1>
                                    <div className="my-1 d-flex align-items-center justify-content-center" style={{ fontSize: '18px' }}>
                                        {renderStars(avgRating)}
                                    </div>
                                    <p className="text-muted small mb-0">Based on {totalReviewsCount} verified reviews</p>
                                </div>

                                {/* प्रत्येक स्टार का प्रोग्रेस बार लूप */}
                                {["5", "4", "3", "2", "1"].map((starKey) => {
                                    const count = summary.breakdown[starKey] || 0;
                                    const percent = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
                                    return (
                                        <div key={starKey} className="d-flex align-items-center mb-2" style={{ fontSize: '13px' }}>
                                            <span className="text-muted fw-semibold" style={{ width: '45px' }}>{starKey} Star</span>
                                            <div className="progress flex-grow-1 mx-2 bg-secondary bg-opacity-10" style={{ height: '10px', borderRadius: '5px' }}>
                                                <div 
                                                    className="progress-bar bg-warning" 
                                                    role="progressbar" 
                                                    style={{ width: `${percent}%`, borderRadius: '5px' }}
                                                    aria-valuenow={percent} 
                                                    aria-valuemin="0" 
                                                    aria-valuemax="100"
                                                ></div>
                                            </div>
                                            <span className="text-muted text-end fw-bold" style={{ width: '25px' }}>{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* दायाँ कॉलम: रिव्यू कमेंट्स लिस्ट */}
                        <div className={summary && totalReviewsCount > 0 ? "col-md-7 ps-md-4" : "col-12"}>
                            {reviews.length === 0 ? (
                                <p className="text-muted fst-italic mb-4">No reviews yet. Be the first to share your thoughts!</p>
                            ) : (
                                <div className="review-list mb-4" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                                    {reviews.map((rev) => (
                                        <div key={rev.id} className="card p-3 mb-3 border-0 shadow-sm bg-light">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className="mb-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar key={i} className="me-1" style={{ color: i < rev.rating ? '#ffc107' : '#e4e5e9' }} />
                                                        ))}
                                                    </div>
                                                    <p className="mb-1 text-dark fw-medium">{rev.comment}</p>
                                                    <small className="text-muted small">
                                                        By: <strong>{rev.user_name || 'Customer'}</strong>
                                                    </small>
                                                </div>

                                                {String(rev.user_id) === String(userId) && (
                                                    <div className="action-buttons">
                                                        <button onClick={() => handleEditTrigger(rev)} className="btn btn-sm btn-outline-primary me-2 py-0 px-2" title="Edit">
                                                            <FaEdit size={13} />
                                                        </button>
                                                        <button onClick={() => handleDeleteReview(rev.id)} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete">
                                                            <FaTrash size={13} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* रिव्यू लिखने/एडिट करने का फॉर्म बॉक्स */}
                            <div className="card p-4 border-0 shadow-sm bg-white border">
                                <h5 className="fw-bold mb-3 text-secondary">
                                    <i className="fas fa-pen-fancy me-2 text-primary"></i>
                                    {editId ? 'Modify Your Review' : 'Write a Review'}
                                </h5>
                                
                                <form onSubmit={handleReviewSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted fw-semibold small d-block mb-1">Your Rating</label>
                                        <div className="star-rating-input">
                                            {[...Array(5)].map((_, index) => {
                                                const starValue = index + 1;
                                                return (
                                                    <FaStar
                                                        key={index}
                                                        size={25}
                                                        className="me-1"
                                                        style={{ cursor: 'pointer', transition: 'color 0.1s' }}
                                                        color={starValue <= (hoveredRating || rating) ? "#ffc107" : "#e4e5e9"}
                                                        onClick={() => setRating(starValue)}
                                                        onMouseEnter={() => setHoveredRating(starValue)}
                                                        onMouseLeave={() => setHoveredRating(0)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <textarea
                                            className="form-control border-light-subtle p-3"
                                            rows="3"
                                            placeholder="Write your review details here..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                            style={{ backgroundColor: '#fdfdfd', fontSize: '14px' }}
                                        ></textarea>
                                    </div>

                                    <div className="d-flex align-items-center">
                                        <button type="submit" className="btn btn-dark btn-sm px-4 fw-bold">
                                            {editId ? 'Update Review' : 'Submit Review'}
                                        </button>
                                        {editId && (
                                            <button 
                                                type="button" 
                                                onClick={() => { setEditId(null); setComment(''); setRating(0); }} 
                                                className="btn btn-link btn-sm text-secondary ms-2 text-decoration-none"
                                            >
                                                Cancel Edit
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </PublicLayout>
    );
};

export default FoodDetail;