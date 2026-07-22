import React, { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link, useLocation } from 'react-router-dom';
import '../styles/home.css';

const SearchPage = () => {
    const query = new URLSearchParams(useLocation().search).get('q') || '';
    const [results, setResults] = useState([]);

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

    return (
        <PublicLayout>
            <div className='container py-4'>
                <h3 className='text-center text-primary'>Result For: {query}</h3>
                <div className='row mt-4'>
                    {results.length === 0 ? (
                        <p className='text-center'>No Foods Found..</p>
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
                                            <Link to="#" className="text-decoration-none">{food.item_name}</Link>
                                        </h5>
                                        <p className='card-text text-muted'>{food.description?.slice(0, 50)}...</p>
                                        <div className='d-flex justify-content-between align-items-center mt-auto'>
                                            <span className='fw-bold'>₹ {food.price}</span>
                                            {food.is_available ? (
                                                <Link to="#" className='btn btn-sm btn-outline-primary'>
                                                    <i className='fas fa-shopping-basket me-1'></i>Order Now
                                                </Link>
                                            ) : (
                                                <div title='This Food Item is Currently Unavailable. Please try again later.'>
                                                    <button className='btn btn-sm btn-outline-secondary' disabled>
                                                        <i className='fas fa-times-circle me-1'></i>Currently Unavailable
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