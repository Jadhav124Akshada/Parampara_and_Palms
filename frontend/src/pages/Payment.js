import React, { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const Payment = () => {
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    // FIXED: Initialized as string 'cod' instead of []
    const [paymentmode, setPaymentMode] = useState('cod'); 
    const [address, setAddress] = useState('');
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiry: '',
        cvv: ''
    });

    // Helper to handle card input changes
    const handleCardChange = (e) => {
        setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async () => {
        // 1. Validate Address
        if (!address.trim()) {
            toast.error('Please enter a delivery address');
            return;
        }

        // 2. Validate Card if Online
        if (paymentmode === 'online') {
            const { cardNumber, expiry, cvv } = cardDetails;
            if (!cardNumber || !expiry || !cvv) {
                toast.error('Please fill in all card details');
                return;
            }
        }

        try {
            const response = await fetch('https://parampara-and-palms.onrender.com/api/place_order/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userID: userId,
                    address: address,
                    paymentmode: paymentmode,
                    // Only send card details if payment is online
                    cardNumber: paymentmode === 'online' ? cardDetails.cardNumber : '',
                    expiry: paymentmode === 'online' ? cardDetails.expiry : '',
                    cvv: paymentmode === 'online' ? cardDetails.cvv : '',
                }),
            });

            const data = await response.json();

            if (response.status === 201) {
                toast.success('Order Placed Successfully!'); // Fixed success message
                setTimeout(() => {
                    navigate('/my-orders');
                }, 2000);
            } else {
                toast.error(data.message || 'Something went wrong');
            }
        } catch (error) {
            toast.error('Server error. Please try again later.');
        }
    };

    return (
        <PublicLayout>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className='container py-5'>
                <h3 className='text-center mb-4  fw-bold'>
                    <i className='fas fa-credit-card me-2'></i> Checkout & Payment
                </h3>

                <div className='row justify-content-center'>
                    <div className='col-md-10 col-lg-8'>
                        <div className='card p-4 shadow-sm border-0 bg-light'>
                            
                            <div className='mb-4'>
                                <label className='form-label fw-bold'>Delivery Address</label>
                                <textarea 
                                    className='form-control'
                                    rows='3' 
                                    placeholder='Enter your full delivery address'
                                    value={address} 
                                    onChange={(e) => setAddress(e.target.value)}
                                ></textarea>
                            </div>

                            <div className='mb-3'>
                                <div className='form-check mb-2'>
                                    <input className='form-check-input' type='radio' name='payMode' id='cod'
                                        value='cod' checked={paymentmode === 'cod'}
                                        onChange={() => setPaymentMode('cod')} />
                                    <label className='form-check-label' htmlFor='cod'>Cash on Delivery</label>
                                </div>

                                <div className='form-check mb-3'>
                                    <input className='form-check-input' type='radio' name='payMode' id='online'
                                        value='online' checked={paymentmode === 'online'}
                                        onChange={() => setPaymentMode('online')} />
                                    <label className='form-check-label' htmlFor='online'>Online Payment</label>
                                </div>
                            </div>

                            {paymentmode === 'online' && (
                                <div className='row g-3 mb-4'>
                                    <div className='col-md-6'>
                                        <label className='form-label small fw-bold'>Card Number</label>
                                        <input 
                                            type='text' name="cardNumber" className='form-control' 
                                            placeholder='1234 **** **** ****' 
                                            value={cardDetails.cardNumber} onChange={handleCardChange} 
                                        />
                                    </div>
                                    <div className='col-md-3'>
                                        <label className='form-label small fw-bold'>Expiry</label>
                                        <input 
                                            type='text' name="expiry" className='form-control' 
                                            placeholder='MM/YY' autoComplete="off" 
                                            value={cardDetails.expiry} onChange={handleCardChange}
                                        />
                                    </div>
                                    <div className='col-md-3'>
                                        <label className='form-label small fw-bold'>CVV</label>
                                        <input 
                                            type='password' name="cvv" className='form-control' 
                                            placeholder='***' 
                                            value={cardDetails.cvv} onChange={handleCardChange}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* FIXED: Added onClick handler */}
                            <button className='btn btn-success btn-lg w-100 fw-bold py-2 mt-2' onClick={handlePlaceOrder}>
                                <i className="fas fa-check-circle me-2"></i> Confirm & Place Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

export default Payment;