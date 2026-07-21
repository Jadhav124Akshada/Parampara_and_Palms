import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'    
import 'react-toastify/dist/ReactToastify.css';

const OrderReport = () => {
    const [formData, setFormData] = useState({
        form_date: '', 
        to_date: '',
        status: 'all',
    })
    const [orders, setOrders] = useState([])
    const [hasSearched, setHasSearched] = useState(false); // Track if a search was performed
    
    const adminUser = localStorage.getItem("adminUser");
    const navigate = useNavigate();

    useEffect(() => {
        if (!adminUser) {
            navigate('/admin-login');
        }
    }, [adminUser, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        try { 
            const response = await fetch('https://parampara-and-palms.onrender.com/api/order-between-dates/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if(response.status === 200) {
                setOrders(data);
                setHasSearched(true);
                if (data.length === 0) toast.info("No orders found for selected criteria.");
            } else {
                toast.error('Failed to fetch report');
            }
        } catch (error) {  
            toast.error('Server error occurred');
        }
    };

    return (
        <AdminLayout>
            <ToastContainer position='bottom-center' theme='colored' />
            <div className='container-fluid py-3'>
                <h3 className='text-center text-dark mb-4'>
                    <i className='fas fa-calendar-alt me-2'></i>Between Dates Order Report
                </h3>
                
                {/* Search Form */}
                <div className='card p-4 shadow-sm mb-4 border-0 bg-light'>
                    <form onSubmit={handleSubmit}>
                        <div className='row g-3 align-items-end'>
                            <div className='col-md-3'>  
                                <label className='form-label fw-bold'>From Date:</label>
                                <input type='date' name='form_date' value={formData.form_date} onChange={handleChange} className='form-control' required />
                            </div>
                            <div className='col-md-3'>
                                <label className='form-label fw-bold'>To Date:</label>
                                <input type='date' name='to_date' value={formData.to_date} onChange={handleChange} className='form-control' required />
                            </div>
                            <div className='col-md-3'>
                                <label className='form-label fw-bold'>Status:</label>
                                <select name='status' value={formData.status} onChange={handleChange} className='form-select'>
                                    <option value='all'>All Status</option>
                                    <option value='not-confirmed'>Not Confirmed</option>
                                    <option value='confirmed'>Confirmed</option>
                                    <option value='being-prepared'>Being Prepared</option>
                                    <option value='pickup'>Pickup</option>
                                    <option value='delivered'>Delivered</option>
                                    <option value='cancelled'>Cancelled</option>
                                </select>
                            </div>
                            <div className='col-md-3'>
                                <button type='submit' className='btn btn-success w-100'>
                                   <i className="fas fa-file-export me-1"></i> Submit
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Results Table */}
                {hasSearched && (
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
                                            <td colSpan="4" className="text-center py-4 text-muted">No records found for the selected date range.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default OrderReport;