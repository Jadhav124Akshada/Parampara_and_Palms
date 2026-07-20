import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { FaStar, FaRegStar, FaTrash, FaCommentAlt } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import AdminLayout from '../components/AdminLayout';

const ManageReviews = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // पेजिनेशन स्टेट्स
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    const adminUser = localStorage.getItem("username") || 
                      localStorage.getItem("adminUser") || 
                      localStorage.getItem("adminName");

    useEffect(() => {
        if (!adminUser) {
            toast.error("Unauthorized access. Redirecting to admin login...");
            setTimeout(() => navigate('/admin-login'), 1500);
            return;
        }

        fetch('http://localhost:8000/api/all-reviews/')
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => {
                setReviews(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error downloading reviews list:", err);
                toast.error("Could not sync review tables from server.");
                setLoading(false);
            });
    }, [adminUser, navigate]);

    const handleDeleteActionTrigger = async (reviewId) => {
        if (!window.confirm("Are you sure you want to permanently delete this customer review?")) {
            return;
        }

        try {
            const res = await fetch(`http://localhost:8000/api/review-delete/${reviewId}/`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || "Review removed successfully.");
                setReviews(prevReviews => prevReviews.filter(item => item.id !== reviewId));
            } else {
                toast.error(data.message || "Failed to complete deletion.");
            }
        } catch (error) {
            toast.error("Server connection lost. Please try again later.");
        }
    };

    const buildStarRatingBadges = (score) => {
        const cappedScore = Math.min(5, Math.max(0, parseInt(score || 0)));
        const structuralArray = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= cappedScore) {
                structuralArray.push(<FaStar key={`sol-${i}`} className="me-0.5" style={{ color: '#ffc107' }} />);
            } else {
                structuralArray.push(<FaRegStar key={`reg-${i}`} className="me-0.5 text-muted opacity-50" />);
            }
        }
        return structuralArray;
    };

    // पेजिनेशन लॉजिक
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReviews = reviews.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.max(1, Math.ceil(reviews.length / itemsPerPage));

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center bg-light" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading reviews...</span>
                    </div>
                    <p className="text-muted mt-2 fw-medium">Syncing Reviews Ledger...</p>
                </div>
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                <ToastContainer position="top-right" autoClose={2500} theme="colored" />
                
                <div className="card shadow-sm border-0 rounded-3 p-4 bg-white mx-auto" style={{ maxWidth: '1400px' }}>
                    <div className="d-flex flex-row justify-content-between align-items-center border-bottom pb-3 mb-4">
                        <h4 className="fw-bold m-0 text-dark d-flex align-items-center">
                            <FaCommentAlt className="text-warning me-2" size={22} />
                            Manage Customer Reviews 
                        </h4>
                        
                        <div className="position-relative d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle text-success shadow-sm" style={{ width: '45px', height: '45px' }}>
                            <i className="fas fa-layer-group fs-5"></i>
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white font-monospace" style={{ fontSize: '11px', padding: '4px 7px' }}>
                                {reviews.length}
                            </span>
                        </div>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="alert alert-light border text-center py-5 rounded-3">
                            <p className="text-muted mb-0 fs-5 fst-italic">No user reviews have been recorded in the system yet.</p>
                        </div>
                    ) : (
                        <div className="table-responsive rounded-3 border shadow-sm">
                            <table className="table table-hover align-middle mb-0 bg-white">
                                <thead className="table-dark">
                                    <tr>
                                        <th className="py-3 text-center" style={{ width: '80px' }}>S.No.</th>
                                        <th className="py-3">Food Item</th>
                                        <th className="py-3">Customer Name</th>
                                        <th className="py-3" style={{ width: '140px' }}>Rating</th>
                                        <th className="py-3">Comment / Feedback</th>
                                        <th className="py-3" style={{ width: '180px' }}>Submitted On</th>
                                        <th className="py-3 text-center" style={{ width: '100px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentReviews.map((rev, index) => (
                                        <tr key={rev.id} className="hover-row-light">
                                            <td className="fw-semibold text-muted text-center">{indexOfFirstItem + index + 1}</td>
                                            <td className="fw-bold text-dark">{rev.food_name}</td>
                                            <td className="text-secondary small fw-semibold">{rev.user_name}</td>
                                            <td>
                                                <div className="d-flex align-items-center" title={`${rev.rating} Stars`}>
                                                    {buildStarRatingBadges(rev.rating)}
                                                </div>
                                            </td>
                                            <td>
                                                <p className="text-dark m-0 text-wrap small lh-base" style={{ maxWidth: '400px', wordBreak: 'break-word' }}>
                                                    {rev.comment || <span className="text-muted fst-italic opacity-50">No text comment provided.</span>}
                                                </p>
                                            </td>
                                            <td className="text-muted small fw-medium">{rev.created_at}</td>
                                            <td className="text-center">
                                                <button 
                                                    className="btn btn-sm btn-outline-danger p-2 border-0 rounded-circle"
                                                    onClick={() => handleDeleteActionTrigger(rev.id)}
                                                    title="Delete Inappropriate Review"
                                                    style={{ lineHeight: 0 }}
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-4 text-center">
                        <nav aria-label="Reviews navigation">
                            <ul className="pagination justify-content-center mb-2 shadow-sm d-inline-flex">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link text-dark fw-bold" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
                                </li>
                                <li className="page-item disabled">
                                    <span className="page-link text-dark fw-bold border-0">Page {currentPage} of {totalPages}</span>
                                </li>
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link text-dark fw-bold" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
                
                <style>{`
                    .hover-row-light { transition: background-color 0.15s ease; }
                    .hover-row-light:hover { background-color: #fafafa !important; }
                    .table-responsive { overflow-x: auto; }
                    th { letter-spacing: 0.3px; font-weight: 600 !important; font-size: 13.5px; }
                    td { font-size: 13.5px; }
                `}</style>
            </div>
        </AdminLayout>
    );
};

export default ManageReviews;