import React, { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link } from 'react-router-dom';

const FoodList = () => {
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter Control State Hooks
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [priceSort, setPriceSort] = useState("default");
    const [priceRangeFilter, setPriceRangeFilter] = useState("all");

    // Pagination State Controls
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; //[cite: 2]

    useEffect(() => {
        Promise.all([
            fetch('http://localhost:8000/api/food/').then(res => res.json()),
            fetch('http://localhost:8000/api/categories/').then(res => res.json())
        ])
        .then(([foodData, catData]) => {
            const cleanFood = Array.isArray(foodData) ? foodData : (foodData.food || []);
            const cleanCat = Array.isArray(catData) ? catData : (catData.categories || []);

            setFoods(cleanFood);
            setCategories(cleanCat);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error loading menu dependencies:", err);
            setLoading(false);
        });
    }, []);

    // Reset back to page 1 automatically whenever any filter shifts[cite: 2]
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, priceSort, priceRangeFilter]);

    const getFilteredAndSortedFoods = () => {
        let output = [...foods];

        // 1. Search Box Filter
        if (searchTerm.trim() !== "") {
            const keyword = searchTerm.toLowerCase();
            output = output.filter(dish => 
                (dish.item_name || dish.name || '').toLowerCase().includes(keyword)
            );
        }

        // 2. Category Selection Dropdown
        if (selectedCategory !== "all") {
            output = output.filter(dish => 
                String(dish.category) === String(selectedCategory) || 
                String(dish.category_name || '').toLowerCase() === String(selectedCategory).toLowerCase()
            );
        }

        // 3. Price Bracket Dropdown
        if (priceRangeFilter !== "all") {
            output = output.filter(dish => {
                const price = parseFloat(dish.price || 0);
                if (priceRangeFilter === "under200") return price < 200;
                if (priceRangeFilter === "200to500") return price >= 200 && price <= 500;
                if (priceRangeFilter === "above500") return price > 500;
                return true;
            });
        }

        // 4. Sort By Price Dropdown
       if (priceSort === "lowToHigh") {
            output.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
        } else if (priceSort === "highToLow") {
            output.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
        } else if (priceSort === "aToZ") {
            output.sort((a, b) => (a.item_name || a.name || '').localeCompare(b.item_name || b.name || ''));
        } else if (priceSort === "zToA") {
            output.sort((a, b) => (b.item_name || b.name || '').localeCompare(a.item_name || a.name || ''));
        }

        return output;
    };

    if (loading) {
        return (
            <PublicLayout>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <div className="spinner-border text-dark" role="status">
                        <span className="visually-hidden">Loading Menu...</span>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    // Apply Filter Pipeline
    const filteredDishes = getFilteredAndSortedFoods();

    // Compute Pagination Array Segments[cite: 2]
    const indexOfLastItem = currentPage * itemsPerPage; //[cite: 2]
    const indexOfFirstItem = indexOfLastItem - itemsPerPage; //[cite: 2]
    const displayedDishes = filteredDishes.slice(indexOfFirstItem, indexOfLastItem); //[cite: 2]
    const totalPages = Math.ceil(filteredDishes.length / itemsPerPage); //[cite: 2]

    return (
        <PublicLayout>
            {/* INJECT SAFE HOVER TRANSITION AND SLIDE OVERLAY CLASSES SEAMLESSLY */}
            <style>
                {`
                    .dish-card-wrapper {
                        transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease;
                        border-radius: 12px;
                        overflow: hidden;
                    }
                    .dish-card-wrapper:hover {
                        transform: translateY(-8px);
                        box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important;
                    }
                    .image-container-overlay {
                        position: relative;
                        overflow: hidden;
                    }
                    .sliding-description-pane {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background: rgba(30, 27, 24, 0.9);
                        color: #ffffff;
                        padding: 15px;
                        transform: translateY(101%);
                        transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
                        z-index: 5;
                    }
                    .dish-card-wrapper:hover .sliding-description-pane {
                        transform: translateY(0);
                    }
                    .page-link {
                        color: #1e1b18;
                        border-color: #decfa7;
                    }
                    .page-item.active .page-link {
                        background-color: #1e1b18;
                        border-color: #1e1b18;
                        color: #fff;
                    }
                    .page-link:hover {
                        background-color: #decfa7;
                        color: #1e1b18;
                    }
                `}
            </style>

            <section className='py-5' style={{ backgroundColor: '#FAF8F5', minHeight: '90vh' }}>
                <div className='container'>
                    <h2 className='text-center mb-5 fw-bold' style={{ color: '#1E1B18', letterSpacing: '-0.5px' }}>
                        Explore Our Menu
                        <span className='badge bg-danger ms-2' style={{ fontSize: '0.9rem' }}>All Dishes</span>
                    </h2>
                    
                    {/* --- MULTI-DROPDOWN FILTER BAR --- */}
                    <div className="card border-0 shadow-sm p-4 mb-5 bg-white" style={{ borderRadius: '12px' }}>
                        <div className="row g-3 align-items-end">
                            <div className="col-xl-3 col-md-6">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Search Dish</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 text-muted"><i className="fas fa-search"></i></span>
                                    <input 
                                        type="text" 
                                        className="form-control bg-light border-start-0 ps-0" 
                                        placeholder="Type dish name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ height: '42px', fontSize: '0.95rem' }}
                                    />
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Category Selection</label>
                                <select 
                                    className="form-select bg-light"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    style={{ height: '42px', fontSize: '0.95rem' }}
                                >
                                    <option value="all">All Food Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id || cat.category_name}>
                                            {cat.category_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-xl-3 col-md-6">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Filter By Price</label>
                                <select 
                                    className="form-select bg-light"
                                    value={priceRangeFilter}
                                    onChange={(e) => setPriceRangeFilter(e.target.value)}
                                    style={{ height: '42px', fontSize: '0.95rem' }}
                                >
                                    <option value="all">All Price Brackets</option>
                                    <option value="under200">Under ₹200</option>
                                    <option value="200to500">₹200 - ₹500</option>
                                    <option value="above500">Above ₹500</option>
                                </select>
                            </div>

                            <div className="col-xl-3 col-md-6">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Sort By Price</label>
                                <select 
                                    className="form-select bg-light"
                                    value={priceSort}
                                    onChange={(e) => setPriceSort(e.target.value)}
                                    style={{ height: '42px', fontSize: '0.95rem' }}
                                >
                                    <option value="default">Default</option>
                                    <option value="lowToHigh">Low to High</option>
                                    <option value="highToLow">High to Low</option>
                                    <option value="aToZ">A to Z</option>
                                    <option value="zToA">Z to A</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* --- DISH GRID MAP --- */}
                    <div className='row'>  
                        {displayedDishes.length === 0 ? ( 
                            <div className='col-12 text-center py-5'>
                                <i className="fas fa-search-minus fa-3x text-muted mb-3 opacity-40"></i>
                                <p className='text-muted lead'>No dishes match your active dropdown sorting setups.</p>
                            </div>
                        ) : (
                            displayedDishes.map((food) => (
                                <div className='col-lg-4 col-md-6 mb-4' key={food.id}>
                                    <div className='card h-100 shadow-sm border-0 dish-card-wrapper'>
                                        
                                        {/* Image Section containing hidden description drawer layer */}
                                        <div className="image-container-overlay">
                                            <img 
                                                src={food.image?.startsWith('http') ? food.image : `http://localhost:8000${food.image}`} 
                                                className='card-img-top' 
                                                alt={food.item_name || food.name} 
                                                style={{ height: '220px', objectFit: 'cover' }}
                                            />
                                            {/* Sliding Hover Description Panel Fixed */}
                                            
                                        </div>

                                        <div className='card-body d-flex flex-column justify-content-between p-4 bg-white'>
                                            <div>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h5 className='card-title fw-bold text-dark mb-0'>{food.item_name || food.name}</h5>
                                                    <span className="badge bg-light text-secondary border border-light small font-monospace">{food.category_name || "Gourmet"}</span>
                                                </div>
                                            </div>
                                            
                                            <div className='mt-3'>
                                                <p className='card-text text-success fw-bold mb-3' style={{ fontSize: '1.25rem' }}>
                                                    ₹{Number(food.price || 0).toFixed(2)}
                                                </p>
                                                
                                                {food.is_available ?? true ? (
                                                    <Link to={`/food/${food.id}`} className='btn btn-primary w-100 fw-bold py-2' style={{ borderRadius: '6px' }}>
                                                        <i className='fas fa-shopping-basket me-2'></i>Order Now
                                                    </Link>
                                                ) : (
                                                    <div title='This Food Item is Currently Unavailable.'>
                                                        <button className='btn btn-outline-secondary w-100 fw-bold py-2' disabled style={{ borderRadius: '6px' }}>
                                                            <i className='fas fa-times-circle me-2'></i>Currently Unavailable
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

                    {/* --- PAGINATION LINK CONTAINER PANEL --- */}
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
                    
                </div>
            </section>
        </PublicLayout>
    );
};

export default FoodList;