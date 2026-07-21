import React, { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout'
import { useNavigate, Link } from 'react-router-dom';
import { FaBoxOpen, FaInfoCircle, FaMapMarkedAlt, FaTruck } from 'react-icons/fa';

const MyOrders = () => {
    const userId = localStorage.getItem("userId");
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }
        fetch(`https://parampara-and-palms.onrender.com/api/orders/${userId}/`)
            .then(res => res.json())
            .then(data => {
                setOrders(data);
            })
 }, [userId]);


    return (
        <PublicLayout>
            <div className='container py-5'>
                <h3 className='text-center mb-4'><FaBoxOpen className='text-warning me-2'size={50}/>My Orders</h3>
              {orders.length === 0?(
                <p className='text-center text-muted'>You have not placed any orders yet..</p>
              ):
                 (
                    orders.map((order,index) => (
                       <div class='card mb-4 shadow-sm'key={index}>
                        <div class='card-body d-flex align-items-center flex-wrap'>
                            <div className='me-2'>
                            <FaBoxOpen className='text-warning'size={50}/>
                            </div>
                            <div className='flex-grow-1'> 
                            <h5 className='mb-2'><Link >Order: {order.order_number}</Link> </h5>
                            <p className='text-muted mb-2'>
                                <strong>Date:</strong>{new Date(order.order_time).toLocaleString()}</p>
                                <span className='badge bg-secondary'>{order.order_final_status}</span>
                            
                                </div>
                                <div className='mt-3 mt-md-0'>
                               <Link to={`/track-order/${order.order_number}`} className='btn btn-outline-secondary btn-sm me-2'>
                               <FaTruck/> Track
                               </Link> 
                               <Link className='btn btn-outline-secondary btn-sm me-2'to={`/order-details/${order.order_number}`}>
                               <FaInfoCircle/> View Details
                               </Link> 
                               </div>
                            </div>

                       </div>
                    ))


                 )}
            </div>
        </PublicLayout>
    );
};

export default MyOrders;