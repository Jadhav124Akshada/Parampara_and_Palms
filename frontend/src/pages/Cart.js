import React, { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout'
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { FaMinus, FaPlus, FaShoppingCart, FaTrash } from 'react-icons/fa';
import { useCart } from '../context/CartContext'; // IMPORT GLOBAL CUSTOM HOOK (Video #66)[cite: 1]

const Cart = () => {
    const userId = localStorage.getItem("userId");
    const [cartItems, setCartItems] = useState([]);
    const [grandTotal, setgrandTotal] = useState(0);
    const navigate = useNavigate();
    
    // EXTRACT THE CONTEXT SETTER METHOD (Video #66)[cite: 1]
    const { setCartCount } = useCart(); 

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }
        fetch(`https://parampara-and-palms.onrender.com/api/cart/${userId}`)
            .then(res => res.json())
            .then(data => {
                const fetchedData = Array.isArray(data) ? data : [];
                setCartItems(fetchedData);
                // Synchronize global context right on first payload initialization[cite: 1]
                setCartCount(fetchedData.length); 
                
                const total = fetchedData.reduce((sum, item) => {
                    return sum + (parseFloat(item.food.price) * item.quantity);
                }, 0);
                setgrandTotal(total);
            })
            .catch(err => console.error("Error fetching cart:", err));
    }, [userId, navigate, setCartCount]);

    const updateQuantity = async (OrderId, newQty) => {
        if (newQty < 1) return;
        try {
            const response = await fetch('https://parampara-and-palms.onrender.com/api/cart/update_quantity/', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    OrderId: OrderId,
                    quantity: newQty
                }),
            });
            const data = await response.json();
            if (response.status === 200) {
                const updated = await fetch(`https://parampara-and-palms.onrender.com/api/cart/${userId}`);
                const freshData = await updated.json();
                const cleanData = Array.isArray(freshData) ? freshData : [];
                
                setCartItems(cleanData);
                // INSTANT BADGE UPDATE: Keeps global counter matching current length dynamically[cite: 1]
                setCartCount(cleanData.length); 

                const total = cleanData.reduce((sum, item) => {
                    return sum + (parseFloat(item.food.price) * item.quantity);
                }, 0);
                setgrandTotal(total);
            } else {
                toast.error(data.message || 'Something went Wrong');
            }
        } catch (error) {
            toast.error('Server error. Please try again later.');
        }
    };

    const deleteCartItem = async (OrderId) => {
        const confirmDelete = window.confirm("Are you sure you want to remove this item?");
        if (!confirmDelete) return; // FIXED: Stops item deletion if user cancels prompt box

        try {
            const response = await fetch(`https://parampara-and-palms.onrender.com/api/cart/delete/${OrderId}/`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (response.status === 200) {
                const updated = await fetch(`https://parampara-and-palms.onrender.com/api/cart/${userId}`);
                const freshData = await updated.json();
                const cleanData = Array.isArray(freshData) ? freshData : [];
                
                setCartItems(cleanData);
                // INSTANT BADGE UPDATE: Instantly drops index count when removal succeeds[cite: 1]
                setCartCount(cleanData.length); 

                const total = cleanData.reduce((sum, item) => {
                    return sum + (parseFloat(item.food.price) * item.quantity);
                }, 0);
                setgrandTotal(total);
                toast.success('Item removed from cart');
            } else {
                toast.error(data.message || 'Something went Wrong');
            }
        } catch (error) {
            toast.error('Server error. Please try again later.');
        }
    };

    return (
        <PublicLayout>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className='container py-5'>
                <h2 className='mb-4 text-center'>
                    <FaShoppingCart className='me-2' />Cart
                </h2>
                {cartItems.length === 0 ? (
                    <p className='text-center text-muted'>Your Cart Is Empty!</p>
                ) : (
                    <>
                        <div className='row'>
                            {cartItems.map((item) => (
                                <div key={item.id} className='col-md-6 mb-4'>
                                    <div className='card shadow-sm'>
                                        <div className='row g-0'>
                                            <div className='col-md-4'>
                                                <img src={item.food.image?.startsWith('http') ? item.food.image : `https://parampara-and-palms.onrender.com${item.food.image}`} className='img-fluid rounded-start w-100' style={{ minHeight: '200px', objectFit: 'cover' }} alt={item.food.item_name} />
                                            </div>
                                            <div className='col-md-8'>
                                                <div className='card-body'>
                                                    <h5 className='card-title'>{item.food.item_name}</h5>
                                                    <p className='card-text text-muted small'>{item.food.description}</p>
                                                    <p className='fw-bold text-success'>₹{item.food.price}</p>
                                                    <div className='d-flex align-items-center mb-2'>
                                                        <button className='btn btn-sm btn-outline-secondary me-2' disabled={item.quantity <= 1} onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                                            <FaMinus />
                                                        </button>
                                                        <span className='fw-bold px-2'>{item.quantity}</span>
                                                        <button className='btn btn-sm btn-outline-secondary ms-2' onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                            <FaPlus />
                                                        </button>
                                                    </div>
                                                    <button className='btn btn-sm btn-outline-danger px-3' onClick={() => deleteCartItem(item.id)}>
                                                        <FaTrash className='me-2' />Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className='card p-4 mt-4 shadow-sm'>
                                <h4>Total: ₹{grandTotal.toFixed(2)}</h4>
                                <div className='text-end'>
                                    <button className='btn btn-success mt-3 px-4' onClick={() => navigate('/payment')}>
                                        <FaShoppingCart className='me-2' /> Proceed To Payment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </PublicLayout>
    );
};

export default Cart;