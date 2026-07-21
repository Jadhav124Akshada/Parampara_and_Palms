import React, { useState, useEffect } from 'react'; 
import AdminLayout from '../components/AdminLayout';
import { Link, useNavigate } from 'react-router-dom';

const Cancelled = () => {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const adminUser = localStorage.getItem("adminUser");
    const navigate = useNavigate();

    useEffect(() => {
        if (!adminUser) {
            navigate('/admin-login');
            return;
        }

        fetch('https://parampara-and-palms.onrender.com/api/order-cancelled/')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setOrders(Array.isArray(data) ? data : []);
            })
            .catch(err => console.error("Fetch error:", err));
    }, [adminUser, navigate]);

    // पेजिनेशन लॉजिक
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.max(1, Math.ceil(orders.length / itemsPerPage));

    return (
        <AdminLayout>
            <div className="container-fluid py-2" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <h3 className='text-center text-dark mb-4'>
                    <i className='fas fa-list-alt me-1'></i>Details of Cancelled Orders
                </h3>
                
                <h5 className='text-end text-muted'>
                    <i className='fas fa-database me-1'></i>Total Cancelled Orders
                    <span className='ms-2 badge bg-success'>{orders.length}</span>
                </h5>

                <div className="table-responsive shadow-sm rounded-3 flex-grow-1">
                    <table className='table table-bordered table-striped table-hover'>
                        <thead className='table-dark'>
                            <tr>
                                <th>S.No</th>
                                <th>Order Number</th>
                                <th>Order Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.length > 0 ? (
                                currentOrders.map((order, index) => (
                                    <tr key={order.id || index}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td>{order.order_number}</td>
                                        <td>{order.order_time ? new Date(order.order_time).toLocaleString() : "N/A"}</td>
                                        <td className="text-center">
                                            <Link to={`/food-order-details/${order.order_number}`} className='btn btn-info btn-sm'>
                                                <i className='fas fa-eye me-1'></i>View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center">No cancelled orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* पेजिनेशन कंट्रोल्स (हमेशा नीचे) */}
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
        </AdminLayout>
    );
};

export default Cancelled;