import React, { useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Login = () => {
    const [formData, setFormData] = useState({
        Emailcont: '', 
        Password: '',
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value // This updates Emailcont or Password based on input 'name'
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.status === 200) {
                toast.success('Login successful!');
                
                // Saving user info to browser storage
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userName', data.userName);

                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                toast.error(data.message || 'Invalid Credentials');
            }
        } catch (error) {
            toast.error('Server error. Please try again later.');
        }
    };

    return (
        <PublicLayout>
            <ToastContainer position='bottom-center' theme='colored' />
            <div className='container py-5'>
                <div className='row justify-content-center'>
                    <div className='col-md-5 p-4'>
                        <h3 className='text-center mb-4'>
                            <FaSignInAlt className='me-2' /> User Login
                        </h3>
                        <form className='card p-4 shadow-sm' onSubmit={handleSubmit}>
                            <div className='mb-3'>
                                <label className='form-label'>Email or Mobile</label>
                                <input 
                                    name='Emailcont' 
                                    type='text' 
                                    className='form-control' 
                                    value={formData.Emailcont} 
                                    onChange={handleChange} 
                                    placeholder='Enter email or mobile' 
                                    required 
                                />
                            </div>
                            <div className='mb-3'>
                                <label className='form-label'>Password</label>
                                <input 
                                    name='Password' 
                                    type='password' 
                                    className='form-control' 
                                    value={formData.Password} 
                                    onChange={handleChange} 
                                    placeholder='Enter password' 
                                    required 
                                />
                            </div>
                            <div className='d-flex align-items-center mt-3'>
                                <button type="submit" className='btn btn-success px-4'>
                                    Login
                                </button>
                                <span className="fs-4 mx-3 text-muted">/</span>
                                <Link to="/register" className="text-dark text-decoration-none fw-bold">
                                    <FaUserPlus className='me-1' /> Register
                                </Link>
                            </div>
                        </form>
                    </div>
                    
                    <div className='col-md-6 d-flex flex-column align-items-center justify-content-center'>
                        <img src='/images/log.jpg' className='img-fluid rounded' style={{maxHeight:'350px'}} alt="login visual" />
                        <h5 className='mt-4 text-center'>Secure Login for a premium dining experience.</h5>
                        <p className='text-muted small'>Join. Order. Enjoy.</p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default Login;