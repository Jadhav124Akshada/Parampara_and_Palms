import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    FaThLarge, FaUsers, FaEdit, FaUtensils, 
    FaClipboardList, FaFileAlt, FaSearch, FaComments,
    FaChevronDown, FaChevronRight 
} from 'react-icons/fa';

const AdminSidebar = () => {
    const location = useLocation();
    const adminUser = localStorage.getItem("adminUser") || "Admin";

    // Manages expanding/collapsing state for all three drop-down nodes explicitly
    const [openMenus, setOpenMenus] = useState({
        category: false,
        menu: false,
        orders: false
    });

    const toggleMenu = (menuName) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    return (
        <>
            {/* Inject safe custom styled scrollbars to look cohesive with the charcoal palette */}
            <style>
                {`
                    .custom-scrollable-sidebar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollable-sidebar::-webkit-scrollbar-track {
                        background: #1a1d1f;
                    }
                    .custom-scrollable-sidebar::-webkit-scrollbar-thumb {
                        background: #4a4e52;
                        border-radius: 10px;
                    }
                    .custom-scrollable-sidebar::-webkit-scrollbar-thumb:hover {
                        background: #6c7278;
                    }
                `}
            </style>

            <div 
                className="sidebar text-white custom-scrollable-sidebar" 
                style={{ 
                    width: '260px', 
                    height: '100vh',           // Strictly caps total container constraints at viewport ceiling
                    position: 'fixed', 
                    top: 0, 
                    left: 0,
                    backgroundColor: '#222629', // Deep dark charcoal layer design matching your interface
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    zIndex: 1000,
                    overflowY: 'auto',         // FIXED: Enables vertical scrolling dynamically when elements expand
                    overflowX: 'hidden'        // Guards layout boundaries from accidental horizontal clipping loops
                }}
            >
                {/* Top Avatar Profile Frame Segment */}
                <div className="text-center py-4 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
                    <div 
                        className="rounded-circle mx-auto mb-2 overflow-hidden"
                        style={{ width: '150px', height: '150px', border: '5px solid white' }}
                    >
                        <img 
                            src="/images/admin.jpg" 
                            alt="Admin Avatar" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <h5 className="mb-0 fw-semibold text-white" style={{ fontSize: '1.05rem' }}>{adminUser}</h5>
                </div>

                {/* Sidebar Mapping Links Matrix */}
                <div className="list-group list-group-flush pt-2 pb-4">
                    
                    {/* 1. Dashboard Routing Node */}
                    <Link 
                        to="/admin-dashboard" 
                        className={`list-group-item list-group-item-action text-white d-flex align-items-center px-4 py-3 border-0 ${location.pathname === '/admin-dashboard' ? 'bg-secondary bg-opacity-25 fw-bold' : ''}`}
                        style={{ backgroundColor: 'transparent', fontSize: '0.95rem' }}
                    >
                        <FaThLarge className="me-3 opacity-75" />
                        <span>Dashboard</span>
                    </Link>

                    {/* 2. Registered Users Management Link */}
                    <Link 
                        to="/manage-users" 
                        className={`list-group-item list-group-item-action text-white d-flex align-items-center px-4 py-3 border-0 ${location.pathname === '/manage-users' ? 'bg-secondary bg-opacity-25 fw-bold' : ''}`}
                        style={{ backgroundColor: 'transparent', fontSize: '0.95rem' }}
                    >
                        <FaUsers className="me-3 opacity-75" />
                        <span>Reg Users</span>
                    </Link>

                    {/* 3. Food Category Dropdown Toggle Selector */}
                    <button 
                        onClick={() => toggleMenu('category')}
                        className="list-group-item list-group-item-action text-white d-flex align-items-center justify-content-between px-4 py-3 border-0 text-start"
                        style={{ backgroundColor: 'transparent', fontSize: '0.95rem', outline: 'none' }}
                    >
                        <div className="d-flex align-items-center">
                            <FaEdit className="me-3 opacity-75" />
                            <span>Food Category</span>
                        </div>
                        {openMenus.category ? <FaChevronDown className="small opacity-50" /> : <FaChevronRight className="small opacity-50" />}
                    </button>

                    {/* Nested Targets sub-tree for Categories */}
                    {openMenus.category && (
                        <div style={{ backgroundColor: '#1a1d1f' }}>
                            <Link to="/add-category" className={`list-group-item list-group-item-action text-white ps-5 py-2.5 small border-0 ${location.pathname === '/add-category' ? 'text-warning fw-bold' : 'opacity-75'}`} style={{ backgroundColor: 'transparent' }}>
                                <i className="fas fa-plus me-2 small"></i>Add Category
                            </Link>
                            <Link to="/manage-category" className={`list-group-item list-group-item-action text-white ps-5 py-2.5 small border-0 ${location.pathname === '/manage-category' ? 'text-warning fw-bold' : 'opacity-75'}`} style={{ backgroundColor: 'transparent' }}>
                                <i className="fas fa-tasks me-2 small"></i>Manage Category
                            </Link>
                        </div>
                    )}

                    {/* 4. Food Menu Dropdown Toggle Selector */}
                    <button 
                        onClick={() => toggleMenu('menu')}
                        className="list-group-item list-group-item-action text-white d-flex align-items-center justify-content-between px-4 py-3 border-0 text-start"
                        style={{ backgroundColor: 'transparent', fontSize: '0.95rem', outline: 'none' }}
                    >
                        <div className="d-flex align-items-center">
                            <FaUtensils className="me-3 opacity-75" />
                            <span>Food Menu</span>
                        </div>
                        {openMenus.menu ? <FaChevronDown className="small opacity-50" /> : <FaChevronRight className="small opacity-50" />}
                    </button>

                    {/* Nested Targets sub-tree for Catalog Items */}
                    {openMenus.menu && (
                        <div style={{ backgroundColor: '#1a1d1f' }}>
                            <Link to="/add-food" className={`list-group-item list-group-item-action text-white ps-5 py-2.5 small border-0 ${location.pathname === '/add-food' ? 'text-warning fw-bold' : 'opacity-75'}`} style={{ backgroundColor: 'transparent' }}>
                                <i className="fas fa-plus me-2 small"></i>Add Food Item
                            </Link>
                            <Link to="/manage-food" className={`list-group-item list-group-item-action text-white ps-5 py-2.5 small border-0 ${location.pathname === '/manage-food' ? 'text-warning fw-bold' : 'opacity-75'}`} style={{ backgroundColor: 'transparent' }}>
                                <i className="fas fa-tasks me-2 small"></i>Manage Food
                            </Link>
                        </div>
                    )}

                    {/* 5. Orders Lifecycle Dropdown Selector */}
                    <button 
                        onClick={() => toggleMenu('orders')}
                        className="list-group-item list-group-item-action text-white d-flex align-items-center justify-content-between px-4 py-3 border-0 text-start"
                        style={{ backgroundColor: 'transparent', fontSize: '0.95rem', outline: 'none' }}
                    >
                        <div className="d-flex align-items-center">
                            <FaClipboardList className="me-3 opacity-75" />
                            <span>Orders</span>
                        </div>
                        {openMenus.orders ? <FaChevronDown className="small opacity-50" /> : <FaChevronRight className="small opacity-50" />}
                    </button>

                    {/* Nested Sub-routes explicitly aligned with targets mapped inside App.js */}
                    {openMenus.orders && (
                        <div style={{ backgroundColor: '#1a1d1f' }}>
                            <Link to="/not-confirmed" className={`list-group-item list-group-item-action text-white ps-5 py-2 small border-0 ${location.pathname === '/not-confirmed' ? 'text-warning fw-bold' : 'opacity-75'}`} style={{ backgroundColor: 'transparent' }}>
                                New Orders
                            </Link>
                            <Link to="/confirmed" className={`list-group-item list-group-item-action text-white ps-5 py-2 small border-0 ${location.pathname === '/confirmed' ? 'text-warning fw-bold' : 'opacity-75'}`} style={{ backgroundColor: 'transparent' }}>
                                Confirmed Orders
                            </Link>
                            <Link to="/being-prepared" className={`list-group-item list-group-item-action text-white ps-5 py-2 small border-0 ${location.pathname === '/being-prepared' ? 'text-warning fw-bold' : 'opacity-75'}`} style={{ backgroundColor: 'transparent' }}>
                                Preparing Food
                            </Link>
                            <Link to="/pickup" className={`list-group-item list-group-item-action text-white ps-5 py-2 small border-0 ${location.pathname === '/pickup' ? 'text-warning fw-bold' : 'opacity-75'}`} style={{ backgroundColor: 'transparent' }}>
                                Ready for Pickup
                            </Link>
                            <Link to="/delivered" className={`list-group-item list-group-item-action text-white ps-5 py-2 small border-0 ${location.pathname === '/delivered' ? 'text-warning fw-bold' : 'opacity-75'}`} style={{ backgroundColor: 'transparent' }}>
                                Delivered Orders
                            </Link>
                            <Link to="/cancelled" className={`list-group-item list-group-item-action text-white ps-5 py-2 small border-0 ${location.pathname === '/cancelled' ? 'text-warning fw-bold' : 'opacity-75'}`} style={{ backgroundColor: 'transparent' }}>
                                Cancelled Orders
                            </Link>
                            <Link to="/all-orders" className={`list-group-item list-group-item-action text-white ps-5 py-2 small border-0 ${location.pathname === '/all-orders' ? 'text-warning fw-bold' : 'opacity-75'}`} style={{ backgroundColor: 'transparent' }}>
                                All Orders
                            </Link>
                        </div>
                    )}

                    {/* 6. Between Dates Report Node Links */}
                    <Link 
                        to="/order-report" 
                        className={`list-group-item list-group-item-action text-white d-flex align-items-center px-4 py-3 border-0 ${location.pathname === '/order-report' ? 'bg-secondary bg-opacity-25 fw-bold' : ''}`}
                        style={{ backgroundColor: 'transparent', fontSize: '0.95rem' }}
                    >
                        <FaFileAlt className="me-3 opacity-75" />
                        <span>B/w Dates Report</span>
                    </Link>

                    {/* 7. Global Search Tool Node */}
                    <Link 
                        to="/search-orders" 
                        className={`list-group-item list-group-item-action text-white d-flex align-items-center px-4 py-3 border-0 ${location.pathname === '/search-orders' ? 'bg-secondary bg-opacity-25 fw-bold' : ''}`}
                        style={{ backgroundColor: 'transparent', fontSize: '0.95rem' }}
                    >
                        <FaSearch className="me-3 opacity-75" />
                        <span>Search</span>
                    </Link>

                    {/* 8. User Feedback Oversight Center */}
                    <Link 
                        to="/manage-reviews" 
                        className={`list-group-item list-group-item-action text-white d-flex align-items-center px-4 py-3 border-0 ${location.pathname === '/manage-reviews' ? 'bg-secondary bg-opacity-25 fw-bold' : ''}`}
                        style={{ backgroundColor: 'transparent', fontSize: '0.95rem' }}
                    >
                        <FaComments className="me-3 opacity-75" />
                        <span>Manage Reviews</span>
                    </Link>

                </div>
            </div>
        </>
    );
};

export default AdminSidebar;