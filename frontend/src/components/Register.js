import React, { useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { toast, ToastContainer } from 'react-toastify';    
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';        

const Register = () => {
    const [formData, setFormData] = useState({
        Firstname: '',
        Lastname: '',
        Email: '', 
        MobileNo: '',   
        Password: '',
        Repeatpassword: '',
    });
    
    const navigate = useNavigate();
     
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        const { Firstname, Lastname, Email, MobileNo, Password, Repeatpassword } = formData;

        // 🛠️ FIX: पासवर्ड मिसमैच होने पर रिक्वेस्ट को यहीं रोकें (Return Guard)
        if (Password !== Repeatpassword) {
            toast.error('Password and Confirm Password do not match');
            return; 
        }

        try { 
            const response = await fetch('http://localhost:8000/api/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Firstname, Lastname, Email, MobileNo, Password }),
            });
    
            const data = await response.json();

            if (response.status === 201) {
                toast.success('Registered successfully!');
                setFormData({
                    Firstname: '',
                    Lastname: '',
                    Email: '', 
                    MobileNo: '',   
                    Password: '',
                    Repeatpassword: '',
                });
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                // 🛠️ FIX: बैकएंड से आने वाले सटीक वैलिडेशन मैसेज को स्क्रीन पर दिखाएं
                toast.error(data.message || 'Something went wrong');
            }
        } catch (error) {  
            toast.error('An error occurred during connection');
        }
    };
          
    return (
        <PublicLayout>
            <ToastContainer position='bottom-center' autoClose={3000} hideProgressBar={true} closeOnClick={true} pauseOnHover={true} draggable={true} theme='colored'/>
        
            <div className='container py-5'>
                <div className='row shadow-lg rounded-4 bg-white overflow-hidden'>
                    <div className='col-md-6 p-5'>
                        <h3 className='mb-4 fw-bold text-dark text-center'>
                            <i className='fas fa-user-plus me-2 text-success'></i>User Registration
                        </h3>
                        <form onSubmit={handleSubmit}> 
                            <div className='mb-3'>
                                <input name='Firstname' type='text' className='form-control p-2.5' value={formData.Firstname} onChange={handleChange} placeholder='First Name' required/>
                            </div>
                            <div className='mb-3'>
                                <input name='Lastname' type='text' className='form-control p-2.5' value={formData.Lastname} onChange={handleChange} placeholder='Last Name' required/>
                            </div>
                            <div className='mb-3'>
                                <input name='Email' type='email' className='form-control p-2.5' value={formData.Email} onChange={handleChange} placeholder='Email Address' required/>
                            </div>
                            <div className='mb-3'>
                                <input name='MobileNo' type='text' className='form-control p-2.5' value={formData.MobileNo} onChange={handleChange} placeholder='Mobile Number' required/>
                            </div>
                            <div className='mb-3'>
                                <input name='Password' type='password' className='form-control p-2.5' value={formData.Password} onChange={handleChange} placeholder='Enter Password' required/>
                            </div>
                            <div className='mb-3'>
                                <input name='Repeatpassword' type='password' className='form-control p-2.5' value={formData.Repeatpassword} onChange={handleChange} placeholder='Repeat Password' required/>
                            </div>
                            <button className='btn btn-success w-100 py-2 fw-bold mt-2 shadow-sm'>
                                <i className='fas fa-user-check me-2'></i>Submit Registration
                            </button>
                        </form>    
                    </div>
                    <div className='col-md-6 d-flex align-items-center justify-content-center bg-light border-start'>
                        <div className='p-4 text-center'>
                            <img src='/images/regi.jpg' className='img-fluid rounded' style={{ maxHeight: '320px', objectFit: 'cover' }} alt="Registration visual" />
                            <h5 className='mt-4 fw-bold text-secondary'>Secure registration for a premium dining experience.</h5>
                            <p className='text-muted small'>Join. Order. Enjoy.</p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default Register;