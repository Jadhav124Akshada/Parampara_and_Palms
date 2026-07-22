import React, { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/home.css';

const SearchPage = () => {
    const query = new URLSearchParams(useLocation().search).get('q') || '';
    const [results, setResults] = useState([]);
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    useEffect(() => {
        if (query) {
            fetch(`https://parampara-and-palms.onrender.com/api/search-food/?q=${query}`)
                .then(res => res.json())
                .then(data => {
                    setResults(data);
                })
                .catch(err => console.error("Error fetching search results:", err));
        }
    }, [query]);

    // Handle adding item to cart and redirecting to cart/checkout
const handleAddToCart = async (foodId) => {
    if (!userId) {
        toast.error("Please login first to place an order!");
        setTimeout(() => navigate('/login'), 1500);
        return;
    }

    try {
        const response = await fetch('https://parampara-and-palms.onrender.com/api/cart/add/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userID: userId,
                foodID: foodId,
                quantity: 1
            })
        });

        const data = await response.json();

        if (response.ok) {
            toast.success(data.message || "Item added to cart! Redirecting...");
            setTimeout(() => {
                navigate('/cart');
            }, 1000);
        } else {
            toast.error(data.message || "Failed to add item to cart");
        }
    } catch (error) {
        console.error("Cart error:", error);
        toast.error("Server error. Please try again.");
    }
};

    return (
        <PublicLayout>
            <ToastContainer position="top-right" autoClose={2000} theme="light" />
            <div className='container py-4'>
                <h3 className='text-center text-primary mb-4'>Result For: {query}</h3>
                <div className='row mt-4'>
                    {results.length === 0 ? (
                        <p className='text-center text-muted'>No Foods Found..</p>
                    ) : (
                        results.map((food, index) => (
                            <div className='col-md-4 mb-4' key={index}>
                                <div className='card hovereffect h-100 shadow-sm border-0'>
                                    <img
                                        src={
                                            food.image
                                                ? (food.image.startsWith('http')
                                                    ? food.image.replace('http://localhost:8000', 'https://parampara-and-palms.onrender.com')
                                                    : `https://parampara-and-palms.onrender.com${food.image.startsWith('/') ? '' : '/'}${food.image}`)
                                                : 'https://via.placeholder.com/300'
                                        }
                                        className='card-img-top'
                                        style={{ height: '180px', objectFit: 'cover' }}
                                        alt={food.item_name}
                                    />
                                    <div className='card-body d-flex flex-column'>
                                        <h5 className='card-title'>
                                            <Link to="#" className="text-decoration-none text-dark">{food.item_name}</Link>
                                        </h5>
                                        <p className='card-text text-muted small'>{food.description?.slice(0, 50)}...</p>
                                        <div className='d-flex justify-content-between align-items-center mt-auto pt-2'>
                                            <span className='fw-bold text-success'>₹ {food.price}</span>
                                            {food.is_available ? (
                                                <button
                                                    onClick={() => handleAddToCart(food.id)}
                                                    className='btn btn-sm btn-outline-primary'
                                                >
                                                    <i className='fas fa-shopping-basket me-1'></i>Order Now
                                                </button>
                                            ) : (
                                                <div title='This Food Item is Currently Unavailable. Please try again later.'>
                                                    <button className='btn btn-sm btn-outline-secondary' disabled>
                                                        <i className='fas fa-times-circle me-1'></i>Unavailable
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </PublicLayout>
    );
};

export default SearchPage;