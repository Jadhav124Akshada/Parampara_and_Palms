import React, { useState } from 'react';

const CancelOrderModal = ({ show, handleClose, orderNumber, paymentMode }) => {
    const [remark, setRemark] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Front-end validation guard
        if (!remark.trim()) {
            setError('Please provide a reason for cancellation.');
            return;
        }

        try {
            const response = await fetch(`https://parampara-and-palms.onrender.com/api/order-cancelled/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order_number: orderNumber,
                    remark: remark.trim()
                })
            });

            const result = await response.json();

            if (response.ok) {
                let successMsg = result.message || 'Order cancelled successfully.';
                
                // If payment was online, append refund timelines banner message text
                if (paymentMode && paymentMode.toLowerCase() === 'online') {
                    successMsg += "\nSince you paid online, your amount will be refunded to your account within 2 days.";
                }

                setMessage(successMsg);
                setRemark('');
                
                // Optional: Reload parent windows after a small window gap to lock UI
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setError(result.message || 'Failed to cancel order.');
            }
        } catch (err) {
            setError('Something went wrong. Server error.');
            console.error(err);
        }
    };

    // Inline conditional style mapping simulation since we are managing display properties programmatically
    const modalStyle = show ? { display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' } : { display: 'none' };

    return (
        <div className={`modal fade ${show ? 'show' : ''}`} style={modalStyle} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title fw-bold">Cancel Order: #{orderNumber}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose} aria-label="Close"></button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body py-4">
                            {/* Success Alert Stack Box */}
                            {message && (
                                <div className="alert alert-success fw-bold whitespace-pre" role="alert">
                                    {message}
                                </div>
                            )}

                            {/* Main Interactive Form Inputs (Hidden if already successfully cancelled) */}
                            {!message && (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold text-secondary">Reason for Cancellation</label>
                                        <textarea 
                                            className="form-control" 
                                            rows="4" 
                                            placeholder="Enter reason here..." 
                                            value={remark}
                                            onChange={(e) => setRemark(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>

                                    {/* Error Stack Display Label */}
                                    {error && (
                                        <div className="text-danger small fw-bold mt-2">
                                            <i className="fas fa-exclamation-circle me-1"></i>{error}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        
                        <div className="modal-footer bg-light">
                            <button type="button" className="btn btn-secondary px-4 fw-bold" onClick={handleClose}>
                                Close
                            </button>
                            {!message && (
                                <button type="submit" className="btn btn-danger px-4 fw-bold">
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CancelOrderModal;