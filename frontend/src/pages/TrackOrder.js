import React, { useState, useEffect, useCallback } from 'react';
import PublicLayout from '../components/PublicLayout';
import { useParams } from 'react-router-dom';
import { FaTruck, FaRegFileAlt, FaCheckCircle, FaSearch, FaTimesCircle,  FaInfoCircle } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TrackOrder = () => {
  const { orderNo } = useParams();
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingData, setTrackingData] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Structural tracking pipeline milestones definition
  const milestones = [
    { key: 'confirmed', label: 'Order Confirmed', color: '#17a2b8' },
    { key: 'prepared', label: 'Food Prepared', color: '#ffc107' },
    { key: 'pickup', label: 'Out for Delivery', color: '#fd7e14' },
    { key: 'delivered', label: 'Food Delivered', color: '#28a745' }
  ];

  // Core network request tracking executor
  const runTrackingQuery = useCallback(async (targetOrderNo) => {
    if (!targetOrderNo || !targetOrderNo.trim()) return;

    setLoading(true);
    setSearched(true);
    setTrackingData([]); // Clear out stale historical data before rendering next state

    try {
      const response = await fetch(`http://localhost:8000/api/track/${targetOrderNo.trim()}/`);
      const data = await response.json();

      if (response.ok) {
        setTrackingData(data);
      } else {
        setTrackingData([]);
        // Core Fix: Removed duplicate toast trigger line here.
        // The JSX markup below safely handles showing the elegant inline screen message box instead.
      }
    } catch (error) {
      toast.error("Network error. Unable to fetch status details.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger auto search routine if a path parameter arrives from the URL parameters stack
  useEffect(() => {
    if (orderNo) {
      setOrderNumber(orderNo); // Synchronize search bar input box text matching the navigation slug
      runTrackingQuery(orderNo);
    }
  }, [orderNo, runTrackingQuery]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.warning("Please enter an order number.");
      return;
    }
    runTrackingQuery(orderNumber);
  };

  const getBadgeStyle = (statusKey) => {
    if (!statusKey) return { text: 'Status Updated', bg: '#6c757d' };
    const key = statusKey.toLowerCase();
    
    if (key.includes('confirm')) return { text: 'Order Confirmed', bg: '#17a2b8' };
    if (key.includes('prepar')) return { text: 'Food being Prepared', bg: '#ffc107' };
    if (key.includes('pickup') || key.includes('out') || key.includes('pick')) return { text: 'Out For Delivery', bg: '#fd7e14' };
    if (key.includes('deliver')) return { text: 'Food Delivered', bg: '#28a745' };
    if (key.includes('cancel')) return { text: 'Order Cancelled', bg: '#dc3545' };
    
    return { text: statusKey.toUpperCase(), bg: '#6c757d' };
  };

  const getMilestoneInfo = (statusKey) => {
    return trackingData.find(log => {
      const dbStatus = log.status.toLowerCase();
      if (statusKey === 'pickup') {
        return dbStatus.includes('pickup') || dbStatus.includes('out') || dbStatus.includes('delivery') || dbStatus.includes('pick');
      }
      return dbStatus.includes(statusKey.toLowerCase());
    });
  };

  const isCancelled = trackingData.some(log => log.status.includes('cancel') || log.cancelled);
  const currentActiveStatus = trackingData.length > 0 ? trackingData[trackingData.length - 1] : null;

  return (
    <PublicLayout>
      <ToastContainer position="top-right" autoClose={2500} theme="light" />
      
      <div className="container py-5 min-vh-100 bg-white text-dark rounded shadow-sm mt-3">
        <h3 className="fw-bold mb-4 d-flex align-items-center text-center justify-content-center">
          <FaSearch className="me-2 text-muted" size={24} /> Track Your Order
        </h3>

        {/* Search Input Section */}
        <form onSubmit={handleTrackSubmit} className="row g-2 mb-4 text-center justify-content-center">
          <div className="col-md-6 d-flex">
            <div className="input-group">
              <span className="input-group-text bg-light text-muted">
                <FaRegFileAlt />
              </span>
              <input 
                type="text" 
                className="form-control bg-white text-dark" 
                placeholder="Enter your order number..." 
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary ms-2 px-4 fw-bold d-flex align-items-center">
              <FaTruck className="me-2" /> Track
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : searched && trackingData.length === 0 ? (
          /* Single Elegant Inline User Notification Target Panel */
          <div className="alert alert-secondary text-center fw-bold py-4">
            No active updates found for Order Number: {orderNumber}
          </div>
        ) : searched ? (
          <div>
            
            {/* Cancellation Callout Alert Banner */}
            {isCancelled && (
              <div className="alert alert-danger d-flex align-items-center mb-4 fw-bold shadow-sm">
                <FaTimesCircle className="me-2" size={20} />
                This order was cancelled. Please check the detailed history logs below.
              </div>
            )}

            {/* Dynamic Status Display Box ("Where the order is right now") */}
            {currentActiveStatus && (
              <div className="p-3 mb-4 rounded border shadow-sm" style={{ backgroundColor: '#f8f9fa', borderLeft: `5px solid ${getBadgeStyle(currentActiveStatus.status).bg}` }}>
                <div className="d-flex align-items-center">
                  <FaInfoCircle className="me-2 text-danger" size={20} />
                  <h6 className="mb-0 fw-bold text-dark">
                    Current  Status: &nbsp;
                    <span className="badge p-2 text-white text-uppercase" style={{ backgroundColor: getBadgeStyle(currentActiveStatus.status).bg }}>
                      {getBadgeStyle(currentActiveStatus.status).text}
                    </span>
                  </h6>
                </div>
                
              </div>
            )}

            {/* Timeline Graphic Block */}
            <h5 className="text-primary fw-bold mb-4 mt-4 d-flex align-items-center">
              <span className="me-2">≡</span> Order Status Timeline
            </h5>

            <div className="position-relative my-5">
              <div 
                className="position-absolute top-50 start-0 w-100 bg-light" 
                style={{ height: '4px', zIndex: 1, transform: 'translateY(-50%)' }}
              ></div>

              <div className="row position-relative" style={{ zIndex: 2 }}>
                {milestones.map((milestone, idx) => {
                  const logMatch = getMilestoneInfo(milestone.key);
                  const isCompleted = !!logMatch;
                  
                  const isCurrentStep = currentActiveStatus && (
                    currentActiveStatus.status.includes(milestone.key) || 
                    (milestone.key === 'pickup' && currentActiveStatus.status.includes('pick'))
                  );

                  return (
                    <div className="col text-center" key={idx}>
                      <div 
                        className="mx-auto d-flex align-items-center justify-content-center shadow-sm"
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: isCompleted ? (isCancelled ? '#6c757d' : milestone.color) : '#e9ecef',
                          color: isCompleted ? 'white' : '#adb5bd',
                          border: isCurrentStep ? '4px solid #fff' : (isCompleted ? 'none' : '2px solid #dee2e6'),
                          outline: isCurrentStep ? `3px solid ${milestone.color}` : 'none',
                          transition: 'all 0.3s'
                        }}
                      >
                        <FaCheckCircle size={22} />
                      </div>
                      <div className={`mt-3 small mb-1 ${isCurrentStep ? 'fw-bold text-primary fs-6' : 'fw-bold text-dark'}`}>
                        {milestone.label}
                      </div>
                      <div className="text-muted fw-normal" style={{ fontSize: '11px' }}>
                        {isCompleted ? (
                          <>
                            <div>{logMatch.status_date.split(',')[0]}</div>
                            <div className="text-dark-50 fw-bold">{logMatch.status_date.split(',')[1]}</div>
                          </>
                        ) : (
                          <span className="text-black-50 opacity-50">Pending</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* History Iteration Log list */}
            <h5 className="fw-bold mb-3 mt-5 text-secondary">Detailed History Logs</h5>
            <div className="border rounded p-3 bg-light shadow-sm">
              {trackingData.map((log) => {
                const badge = getBadgeStyle(log.status);
                return (
                  <div key={log.id} className="mb-3 pb-3 border-bottom last-border-0">
                    <div className="d-flex align-items-center mb-1">
                      <span 
                        className="badge px-3 py-2 text-white fw-bold me-3 text-uppercase"
                        style={{ backgroundColor: badge.bg, fontSize: '11px', borderRadius: '4px' }}
                      >
                        {badge.text}
                      </span>
                    </div>
                    <div className="text-muted ms-1 mt-1" style={{ fontSize: '12px' }}>
                      <strong>Time recorded:</strong> {log.status_date}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <FaTruck size={48} className="mb-3 text-muted opacity-25" />
            <p>Input an order invoice reference number above to display system logs.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default TrackOrder;