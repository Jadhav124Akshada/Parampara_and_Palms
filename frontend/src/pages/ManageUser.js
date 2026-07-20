import React, { useState, useEffect } from 'react'; 
import AdminLayout from '../components/AdminLayout';
import { Link, useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageUser = () => {
    const adminUser = localStorage.getItem("adminUser");
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);       
    const [itemsPerPage] = useState(10);                     

    useEffect(() => {
        if (!adminUser) {
            navigate('/admin-login');
            return;
        }
        fetch('http://localhost:8000/api/users/') 
            .then(res => res.json())
            .then(data => {
                const fetchedData = Array.isArray(data) ? data : (data.users || []);
                setUsers(fetchedData);
                setAllUsers(fetchedData);
            })
            .catch(err => console.error("Fetch error:", err));
    }, [adminUser, navigate]);

    const handleSearch = (s) => {
        const keyword = s.toLowerCase();
        setCurrentPage(1); 
        
        if (!keyword) {
            setUsers(allUsers);
        } else {
            const filtered = allUsers.filter(user => 
                (user.first_name && user.first_name.toLowerCase().includes(keyword)) || 
                (user.last_name && user.last_name.toLowerCase().includes(keyword)) || 
                (user.email && user.email.toLowerCase().includes(keyword)) ||
                (user.mobile_number && user.mobile_number.includes(keyword))
            );
            setUsers(filtered);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            fetch(`http://localhost:8000/api/users/${id}/`, {
                method: 'DELETE'
            })
            .then(res => res.json())
            .then(data => {
                toast.success(data.message || "User deleted successfully");
                const updatedUsers = users.filter(user => user.id !== id);
                setUsers(updatedUsers);
                setAllUsers(prev => prev.filter(user => user.id !== id));
                const totalPagesAfterDelete = Math.ceil(updatedUsers.length / itemsPerPage);
                if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
                    setCurrentPage(totalPagesAfterDelete);
                }
            })
            .catch(err => toast.error("Failed to delete user"));
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;                  
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;              
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem); 
    const totalPages = Math.ceil(users.length / itemsPerPage) || 1;

    return (
        <AdminLayout>
            <ToastContainer position='bottom-center' theme='colored' />
            
            <div className="container-fluid py-2">
                <h3 className='text-center text-dark mb-4'>
                    <i className='fas fa-users me-2'></i>Manage Registered Users
                </h3>
                
                <h5 className='text-end text-muted mb-3'>
                    <i className='fas fa-database me-1'></i>Total Users
                    <span className='ms-2 badge bg-success'>{users.length}</span>
                </h5>

                <div className='mb-3 d-flex justify-content-between align-items-center'>
                    <input type='text' 
                        className='form-control w-25' 
                        placeholder='Search users...'
                        onChange={(e) => handleSearch(e.target.value)} 
                    />
                    <CSVLink data={allUsers} className='btn btn-success' filename={'registered_users.csv'}>
                        <i className='fas fa-file-csv me-2'></i>Export To CSV
                    </CSVLink>
                </div>

                <div className="table-responsive shadow-sm rounded-3">
                    <table className='table table-bordered table-striped table-hover align-middle mb-0'>
                        <thead className='table-dark'>
                            <tr>
                                <th style={{ width: '80px' }}>S.No</th>
                                <th>Full Name</th>
                                <th>Email Address</th>
                                <th>Mobile Number</th>
                                <th>Registration Date</th>
                                <th className="text-center" style={{ width: '150px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted fst-italic">No users found.</td>
                                </tr>
                            ) : (
                                currentUsers.map((user, index) => (
                                    <tr key={user.id || index}>
                                        <td className="fw-semibold text-muted">{indexOfFirstItem + index + 1}</td>
                                        <td className="fw-bold">{`${user.first_name || ''} ${user.last_name || ''}`}</td>
                                        <td className="font-monospace small">{user.email}</td>
                                        <td>{user.mobile_number || <span className="text-muted small">N/A</span>}</td>
                                        <td className="text-muted small">{user.reg_date ? new Date(user.reg_date).toLocaleString() : "N/A"}</td>
                                        
                                        <td className="text-center">
                                            <button onClick={() => handleDelete(user.id)} className='btn btn-danger btn-sm rounded-2'>
                                                <i className='fas fa-trash-alt me-1'></i>Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* पेजिनेशन कंट्रोल - हमेशा दिखाई देगा */}
                <div className="mt-4 text-center">
                    <nav aria-label="Users navigation">
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
        </AdminLayout>
    );
};

export default ManageUser;