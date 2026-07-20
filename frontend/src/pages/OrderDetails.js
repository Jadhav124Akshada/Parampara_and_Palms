import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import CancelOrderModal from '../components/CancelOrderModal';
import { FaReceipt, FaMapMarkerAlt, FaFileInvoice, FaTimesCircle } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderDetails = () => {
    const userId = localStorage.getItem("userId");
    const [orderItems, setOrderItems] = useState([]);
    const [orderAddress, setOrderAddress] = useState(null);
    const [total, setTotal] = useState(0);
    const [showCancelModal, setShowCancelModal] = useState(false);
    
    const navigate = useNavigate();
    const { order_number } = useParams();

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }
        fetch(`http://localhost:8000/api/orders/by_order_number/${order_number}/`)
            .then(res => res.json())
            .then(data => {
                setOrderItems(data);
                const totalAmount = data.reduce((sum, item) => {
                    return sum + (parseFloat(item.food.price) * item.quantity);
                }, 0);
                setTotal(totalAmount);
            });

        fetch(`http://localhost:8000/api/order_address/${order_number}/`)
            .then(res => res.json())
            .then(data => {
                setOrderAddress(data);
            })
            .catch(err => console.error("Error fetching data:", err));
    }, [order_number, userId, navigate]);

    // JavaScript uses .trim() instead of Python's .strip()
    const currentStatus = orderAddress?.order_final_status ? orderAddress.order_final_status.toLowerCase().trim() : 'pending';
    
    // Cancellation criteria rule matching Pankaj's video guide guidelines
    const isEligibleForCancellation = ['pending', 'order confirmed', 'food being prepared', 'waiting for restaurant confirmation', ''].includes(currentStatus);

    return (
        <PublicLayout>
            <ToastContainer position="top-right" autoClose={3000} theme="light" />
            
            <div className='container py-5'>
                <h3 className='mb-4 d-flex align-items-center'>
                    <FaReceipt className="me-2 text-secondary" /> Order: {order_number} Details
                </h3>
                <div className='row'>
                    {/* Purchase Items List loops */}
                    <div className='col-md-8'>
                        {orderItems.map((item, index) => (
                            <div className='card mb-3 shadow-sm' key={index}>
                                <div className='row g-0'>
                                    <div className='col-md-4'>
                                        <img 
                                            src={`http://localhost:8000${item.food.image}`} 
                                            className='img-fluid rounded-start' 
                                            style={{ height: '300px', width: '100%', objectFit: 'cover' }} 
                                            alt={item.food.item_name} 
                                        />
                                    </div>
                                    <div className='col-md-8'>
                                        <div className='card-body'>
                                            <h4>{item.food.item_name}</h4>
                                            <p className="text-muted">{item.food.description}</p>
                                            <p><strong>Price: </strong>₹{item.food.price}</p>
                                            <p><strong>Quantity: </strong>{item.quantity}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cost Ledger Summary Sidebar */}
                    <div className='col-md-4'>
                        {orderAddress && (
                            <div className='card mb-3 shadow-sm p-3'>
                                <h5 className='fw-semibold mb-3 text-center d-flex align-items-center justify-content-center'>
                                    <FaMapMarkerAlt className="me-2 text-danger" /> Delivery Details
                                </h5>
                                <p><strong>Date: </strong>{new Date(orderAddress.order_time).toLocaleString()}</p>
                                <p><strong>Address: </strong>{orderAddress.address}</p>
                                <p>
                                    <strong>Status: </strong>
                                    <span className={`badge text-uppercase ms-1 p-2 ${orderAddress.order_final_status === 'cancelled' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                        {orderAddress.order_final_status || 'Waiting For Confirmation'}
                                    </span>
                                </p>
                                <p><strong>Payment Mode: </strong><span className='badge bg-info text-dark'>{orderAddress.payment_mode}</span></p>
                                <p><strong>Total: </strong>₹ {total}</p>
                                
                                <a href={`http://localhost:8000/api/invoice/${order_number}`} target='_blank' rel="noreferrer" className='btn btn-success w-100 my-2 d-flex align-items-center justify-content-center'>
                                    <FaFileInvoice className="me-2" /> Invoice
                                </a>

                                {isEligibleForCancellation ? (
                                    <button onClick={() => setShowCancelModal(true)} className='btn btn-danger w-100 my-2 d-flex align-items-center justify-content-center'>
                                        <FaTimesCircle className="me-2" /> Cancel Order
                                    </button>
                                ) : (
                                    <div className="alert alert-danger small fw-bold mt-2 text-center p-2 mb-0 text-uppercase" style={{ fontSize: '11px' }}>
                                        Order cannot be modified. Status: {orderAddress.order_final_status}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mount Popup Component Container */}
            <CancelOrderModal 
                show={showCancelModal} 
                handleClose={() => setShowCancelModal(false)} 
                orderNumber={order_number} 
                paymentMode={orderAddress?.payment_mode} 
            />
        </PublicLayout>
    );
};

export default OrderDetails;