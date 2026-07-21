import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewOrder = () => {
    const { orderNumber } = useParams();
    const [data, setData] = useState(null);
    const adminUser = localStorage.getItem("adminUser");
    const navigate = useNavigate();

    useEffect(() => {
        if (!adminUser) {
            navigate('/admin-login');
            return;
        }

        fetch(`https://parampara-and-palms.onrender.com/api/view_order_details/${orderNumber}/`)
            .then(res => {
                if (!res.ok) throw new Error("Order not found");
                return res.json();
            })
            .then(data => setData(data))
            .catch(err => {
                toast.error("Error loading order");
                console.error(err);
            });
    }, [orderNumber, adminUser, navigate]);

    if (!data) return <AdminLayout><p className="text-center p-5">Loading...</p></AdminLayout>;

    const { order, food, tracking } = data;

    const statusOptions = [
        "Order Confirmed", "Order Being Prepared", "Order Picked Up", "Order Delivered", "Order Cancelled"
    ];

    const currentStatus = order?.order_final_status || "Pending";
    const visibleStatusOptions = statusOptions.slice(statusOptions.indexOf(currentStatus) + 1);

    const handleUpdateStatus = (e) => {
        e.preventDefault();
        const statusVal = e.target.status.value;
        const remark = e.target.remark.value;

        fetch('https://parampara-and-palms.onrender.com/api/update-order-status/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_number: order?.order_number, status: statusVal, remark }),
        })
            .then(async (res) => {
                const result = await res.json();
                if (res.ok) {
                    toast.success(result.message || 'Status updated successfully!');

                    // 🛠️ REDIRECTION LOGIC FOR STATUS CANCELLATIONS
                    if (statusVal === "Order Cancelled") {
                        setTimeout(() => {
                            navigate('/my-orders'); // Adjust this route slug string to match your Admin Order History page route
                        }, 1200);
                    } else {
                        setTimeout(() => window.location.reload(), 1000);
                    }
                } else {
                    toast.error(result.error || 'Failed to update status');
                }
            })
            .catch(err => {
                toast.error('Server error. Please try again later.');
                console.error(err);
            });
    };

    return (
        <AdminLayout>
            <ToastContainer position='bottom-center' theme='colored' />
            <div className='container mt-4 mb-5'>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3><i className='fas fa-file-invoice me-2'></i>Order Details: #{orderNumber}</h3>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                        <i className="fas fa-arrow-left me-1"></i> Back
                    </button>
                </div>

                <div className='row'>
                    {/* Customer Info Card */}
                    <div className='col-md-5'>
                        <div className='card mb-4 shadow-sm border-0'>
                            <div className='card-header bg-primary text-white fw-bold'>Customer Details</div>
                            <div className='card-body'>
                                <p className="mb-2"><strong>Name:</strong> {order?.user_first_name} {order?.user_last_name}</p>
                                <p className="mb-2"><strong>Email:</strong> {order?.user_email}</p>
                                <p className="mb-2"><strong>Phone:</strong> {order?.user_mobile_number}</p>
                                <p className="mb-2"><strong>Address:</strong> {order?.address}</p>
                                <hr />
                                <p className="mb-2 text-primary fw-bold">Total Price: ₹{order?.total_price}</p>
                                <p className="mb-2"><strong>Order Time:</strong> {order?.order_time ? new Date(order.order_time).toLocaleString() : 'N/A'}</p>
                                <p className="mb-0"><strong>Status:</strong> <span className="badge bg-info text-dark text-uppercase">{currentStatus}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Ordered Items Table */}
                    <div className='col-md-7'>
                        <div className='card mb-4 shadow-sm border-0'>
                            <div className='card-header bg-success text-white fw-bold'>Ordered Items</div>
                            <div className="table-responsive">
                                <table className='table table-hover mb-0'>
                                    <thead className="table-light">
                                        <tr>
                                            <th>Image</th>
                                            <th>Item Name</th>
                                            <th className="text-end pe-3">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {food && food.map((item, i) => (
                                            <tr key={i}>
                                                <td>
                                                       <img
    src={
        item.image 
            ? item.image
                .replace('http://localhost:8000', 'https://parampara-and-palms.onrender.com')
                .replace('http://127.0.0.1:8000', 'https://parampara-and-palms.onrender.com')
            : 'https://via.placeholder.com/50'
    }
    width="50" height="50" className="rounded shadow-sm" alt={item.item_name}
    style={{ objectFit: 'cover' }}
/>
                                                </td>
                                                <td className="align-middle fw-bold">{item.item_name}</td>
                                                <td className="align-middle text-end text-success pe-3">₹{item.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tracking Log Section */}
                <div className='row'>
                    <div className='col-12'>
                        <div className='card shadow-sm border-0 mb-4'>
                            <div className='card-header bg-dark text-white fw-bold'>Tracking History</div>
                            <div className='card-body p-0'>
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="ps-4" style={{ width: '25%' }}>Status</th>
                                                <th style={{ width: '50%' }}>Remark</th>
                                                <th className="text-end pe-4" style={{ width: '25%' }}>Date & Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tracking && tracking.length > 0 ? (
                                                tracking.map((step, i) => (
                                                    <tr key={i}>
                                                        <td className="ps-4 align-middle">
                                                            <strong className="text-primary text-uppercase">{step.status}</strong>
                                                        </td>
                                                        <td className="align-middle text-muted small">{step.remark}</td>
                                                        <td className="text-end pe-4 align-middle">
                                                            <small className='text-muted font-monospace'>
                                                                {new Date(step.status_date).toLocaleString()}
                                                            </small>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center text-muted py-4">No tracking history yet</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* State Selection Dropdown Control Panels */}
                            {currentStatus.toLowerCase() !== 'order delivered' && currentStatus.toLowerCase() !== 'order cancelled' && currentStatus.toLowerCase() !== 'cancelled' && (
                                <div className="card-footer bg-white border-top py-4">
                                    <h5 className="mb-4 text-center">Update Order Status</h5>
                                    <form onSubmit={handleUpdateStatus} className="row justify-content-center">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label fw-bold small">Select New Status</label>
                                            <select name="status" className="form-select" required>
                                                <option value="">Choose status...</option>
                                                {visibleStatusOptions.map((status, index) => (
                                                    <option key={index} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold small">Admin Remark</label>
                                            <textarea name="remark" className='form-control' rows="1" placeholder="Enter status update details..." required></textarea>
                                        </div>
                                        <div className="col-md-2 mb-3 d-flex align-items-end">
                                            <button type="submit" className="btn btn-success w-100">
                                                <i className="fas fa-save me-1"></i> Update
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ViewOrder;