import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SearchOrder = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [orders, setOrders] = useState([]);
    const [submitted, setSubmitted] = useState(false); // Added missing state

    const adminUser = localStorage.getItem("adminUser");
    const navigate = useNavigate();

    useEffect(() => {
        if (!adminUser) {
            navigate('/admin-login');
        }
    }, [adminUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            toast.warning("Please enter an order number");
            return;
        };

        try {
            const response = await fetch(`https://parampara-and-palms.onrender.com/api/search-orders/?q=${searchTerm}`);
            const data = await response.json();


            setOrders(data);
            setSubmitted(true);
        } catch (error) {
            toast.error('Server error occurred');
        }
    };

    return (
        <AdminLayout>
            <ToastContainer position='bottom-center' theme='colored' />
            <div className='container-fluid py-3'>
                <h3 className='text-center text-dark mb-4'>
                    <i className='fas fa-search me-2'></i>Search Orders
                </h3>

                {/* Search Form */}
                <form onSubmit={handleSubmit} className='d-flex justify-content-center mt-4 mb-5' style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <input
                        type='text'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        name='q'
                        className='form-control w-75 d-inline-block'
                        placeholder='Enter Order Number..'
                        style={{ borderTopRightRadius: '0', borderBottomRightRadius: '0' }}
                    />
                    <button type="submit" className="btn btn-warning px-4"
                        style={{ borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}>
                        Search
                    </button>
                </form>

                {/* Results Table */}
                {submitted && (
                    <div className='card shadow-sm border-0'>
                        <div className='card-header bg-white d-flex justify-content-between align-items-center'>
                            <h5 className='m-0'>Results</h5>
                            <span className='badge bg-primary'>{orders.length} Orders Found</span>
                        </div>
                        <div className='table-responsive'>
                            <table className='table table-hover mb-0'>
                                <thead className='table-dark'>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Order Number</th>
                                        <th>Order Date</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length > 0 ? (
                                        orders.map((order, index) => (
                                            <tr key={order.id || index}>
                                                <td>{index + 1}</td>
                                                <td className="fw-bold">{order.order_number}</td>
                                                <td>{new Date(order.order_time).toLocaleString()}</td>
                                                <td className="text-center">
                                                    <Link to={`/food-order-details/${order.order_number}`} className='btn btn-sm btn-info'>
                                                        <i className='fas fa-eye me-1'></i>Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">
                                                No records found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default SearchOrder;