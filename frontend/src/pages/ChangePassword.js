import React, { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const ChangePassword = () => {
    const userId = localStorage.getItem("userId");
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) {
            navigate('/login');
        }
    }, [userId, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New password and confirm password do not match');
            return;
        }

        try {
            const response = await fetch(`https://parampara-and-palms.onrender.com/api/change_password/${userId}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Fixed typo here: current_password
                body: JSON.stringify({ 
                    current_password: formData.currentPassword, 
                    new_password: formData.newPassword 
                }),
            });

            const data = await response.json();
            if (response.status === 200) {
                toast.success('Password changed successfully');
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.message || 'Something went wrong');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    return (
        <PublicLayout>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className='container py-5'>
                <div className='row justify-content-center'>
                    <div className='col-md-5'>
                        <div className='card shadow-sm p-4 '>
                            <h3 className='text-center mb-4 fw-bold'>
                                <i className='fas fa-lock me-2 '></i>Change Password
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className='mb-3'>
                                    <label className='form-label'>Current Password</label>
                                    <input type='password' name='currentPassword' value={formData.currentPassword} onChange={handleChange} className='form-control' required />
                                </div>
                                <div className='mb-3'>
                                    <label className='form-label'>New Password</label>
                                    <input type='password' name='newPassword' value={formData.newPassword} onChange={handleChange} className='form-control' required />
                                </div>
                                <div className='mb-4'>
                                    <label className='form-label'>Confirm New Password</label>
                                    <input type='password' name='confirmPassword' value={formData.confirmPassword} onChange={handleChange} className='form-control' required />
                                </div>
                                <button type='submit' className='btn btn-success w-100 fw-bold'>
                                   <i className='fas fa-check-circle me-2'></i> Update Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ChangePassword;