import React, { useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { FaCreditCard, FaLock, FaShieldAlt, FaMobileAlt, FaMoneyBillWave, FaUniversity } from 'react-icons/fa';

const Payment = () => {
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    const [paymentmode, setPaymentMode] = useState('cod');
    const [address, setAddress] = useState('');
    const [upiId, UpiId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
        cardHolder: ''
    });

    const handleCardChange = (e) => {
        let { name, value } = e.target;
        if (name === 'cardNumber') {
            value = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().substr(0, 19);
        } else if (name === 'expiry') {
            value = value.replace(/\D/g, '').replace(/^(\d{2})/, '$1/').substr(0, 5);
        } else if (name === 'cvv') {
            value = value.replace(/\D/g, '').substr(0, 4);
        }
        setCardDetails({ ...cardDetails, [name]: value });
    };

    const handlePlaceOrder = async () => {
        if (!address.trim()) {
            toast.error('Please enter a delivery address');
            return;
        }

        if (paymentmode === 'online') {
            const { cardNumber, expiry, cvv } = cardDetails;
            if (!cardNumber || !expiry || !cvv) {
                toast.error('Please fill in all card details');
                return;
            }
        } else if (paymentmode === 'upi' && !upiId.trim()) {
            toast.error('Please enter a valid UPI ID');
            return;
        }

        // Simulate Gateway Processing UI (Myntra Style)
        setIsProcessing(true);
        setProcessingStep('Initializing secure connection...');

        setTimeout(() => {
            setProcessingStep('Authorizing payment with bank...');
        }, 1200);

        setTimeout(async () => {
            setProcessingStep('Finalizing order...');
            try {
                const response = await fetch('https://parampara-and-palms.onrender.com/api/place_order/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userID: userId,
                        address: address,
                        paymentmode: paymentmode === 'upi' ? 'online' : paymentmode,
                        cardNumber: paymentmode === 'online' ? cardDetails.cardNumber : '',
                        expiry: paymentmode === 'online' ? cardDetails.expiry : '',
                        cvv: paymentmode === 'online' ? cardDetails.cvv : '',
                    }),
                });

                const data = await response.json();
                setIsProcessing(false);

                if (response.status === 201) {
                    toast.success('Order Placed Successfully!');
                    setTimeout(() => navigate('/my-orders'), 1500);
                } else {
                    toast.error(data.message || 'Payment failed. Try again.');
                }
            } catch (error) {
                setIsProcessing(false);
                toast.error('Server error. Please try again later.');
            }
        }, 2800);
    };

    return (
        <PublicLayout>
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Gateway Processing Modal Overlay */}
            {isProcessing && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex',
                    justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: '#fff'
                }}>
                    <div className="spinner-border text-light mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                    <h4 className="fw-bold">Processing Secure Transaction</h4>
                    <p className="text-light opacity-75">{processingStep}</p>
                    <p className="small text-muted mt-2"><FaLock className="me-1" /> 256-bit Bank Grade Security</p>
                </div>
            )}

            <div className='container py-5'>
                <div className="text-center mb-4">
                    <h3 className='fw-bold'><FaShieldAlt className="text-success me-2" /> Safe & Secure Payments</h3>
                    <p className="text-muted small">Powered by Parampara & Palms Secure Gateway</p>
                </div>

                <div className='row justify-content-center'>
                    <div className='col-md-10 col-lg-8'>
                        <div className='card p-4 shadow-sm border-0 bg-white rounded-4'>
                            
                            {/* Address Section */}
                            <div className='mb-4'>
                                <label className='form-label fw-bold text-secondary small text-uppercase'>1. Delivery Address</label>
                                <textarea 
                                    className='form-control bg-light border-0 p-3'
                                    rows='2' 
                                    placeholder='Enter your house no, street, landmark, city...'
                                    value={address} 
                                    onChange={(e) => setAddress(e.target.value)}
                                ></textarea>
                            </div>

                            <hr className="my-4" />

                            {/* Payment Options Heading */}
                            <label className='form-label fw-bold text-secondary small text-uppercase mb-3'>2. Select Payment Mode</label>

                            <div className='row g-3 mb-4'>
                                {/* COD Option */}
                                <div className='col-md-4'>
                                    <div 
                                        className={`p-3 border rounded-3 text-center cursor-pointer transition ${paymentmode === 'cod' ? 'border-success bg-success bg-opacity-10 fw-bold' : 'border-light bg-light'}`}
                                        onClick={() => setPaymentMode('cod')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <FaMoneyBillWave size={24} className="text-success mb-2" />
                                        <div>Cash on Delivery</div>
                                    </div>
                                </div>

                                {/* UPI Option */}
                                <div className='col-md-4'>
                                    <div 
                                        className={`p-3 border rounded-3 text-center cursor-pointer transition ${paymentmode === 'upi' ? 'border-success bg-success bg-opacity-10 fw-bold' : 'border-light bg-light'}`}
                                        onClick={() => setPaymentMode('upi')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <FaMobileAlt size={24} className="text-primary mb-2" />
                                        <div>UPI (GPay/PhonePe)</div>
                                    </div>
                                </div>

                                {/* Card Option */}
                                <div className='col-md-4'>
                                    <div 
                                        className={`p-3 border rounded-3 text-center cursor-pointer transition ${paymentmode === 'online' ? 'border-success bg-success bg-opacity-10 fw-bold' : 'border-light bg-light'}`}
                                        onClick={() => setPaymentMode('online')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <FaCreditCard size={24} className="text-warning mb-2" />
                                        <div>Credit / Debit Card</div>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Sub-forms based on payment mode */}
                            {paymentmode === 'upi' && (
                                <div className='p-3 bg-light rounded-3 mb-4 border'>
                                    <label className='form-label small fw-bold'>Enter UPI ID / VPA</label>
                                    <input 
                                        type='text' className='form-control' 
                                        placeholder='username@okhdfcbank / username@ybl' 
                                        value={upiId} onChange={(e) => UpiId(e.target.value)} 
                                    />
                                    <div className="form-text text-muted small mt-1">A collect request will be sent to your UPI app.</div>
                                </div>
                            )}

                            {paymentmode === 'online' && (
                                <div className='p-4 bg-light rounded-3 mb-4 border'>
                                    <div className='row g-3'>
                                        <div className='col-12'>
                                            <label className='form-label small fw-bold'>Cardholder Name</label>
                                            <input 
                                                type='text' name="cardHolder" className='form-control' 
                                                placeholder='Akshada Jadhav' 
                                                value={cardDetails.cardHolder} onChange={handleCardChange} 
                                            />
                                        </div>
                                        <div className='col-12'>
                                            <label className='form-label small fw-bold'>Card Number</label>
                                            <input 
                                                type='text' name="cardNumber" className='form-control font-monospace' 
                                                placeholder='4532 •••• •••• 8921' maxLength="19"
                                                value={cardDetails.cardNumber} onChange={handleCardChange} 
                                            />
                                        </div>
                                        <div className='col-md-6'>
                                            <label className='form-label small fw-bold'>Valid Through (Expiry)</label>
                                            <input 
                                                type='text' name="expiry" className='form-control' 
                                                placeholder='MM/YY' maxLength="5"
                                                value={cardDetails.expiry} onChange={handleCardChange}
                                            />
                                        </div>
                                        <div className='col-md-6'>
                                            <label className='form-label small fw-bold'>CVV</label>
                                            <input 
                                                type='password' name="cvv" className='form-control' 
                                                placeholder='CVV' maxLength="4"
                                                value={cardDetails.cvv} onChange={handleCardChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button className='btn btn-success btn-lg w-100 fw-bold py-3 mt-2 shadow-sm rounded-pill' onClick={handlePlaceOrder}>
                                <FaLock className="me-2" /> Pay Securely & Place Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

export default Payment;