import React, { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout'
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const Profile = () => {
    const userId = localStorage.getItem("userId");
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        mobile_number: '',
        reg_date: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }
        fetch(`http://localhost:8000/api/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                setFormData(data);

            })
    }, [userId]);

    const handleChange = (e) => {
        setFormData({...formData,[e.target.name]:e.target.value})
          
    }
     const handleSubmit = async (e) => {
                    e.preventDefault(); 
              
                    try { 
                const response = await fetch(`http://localhost:8000/api/update/${userId}/`, {
                      method: 'PUT',
                        headers: {'Content-Type': 'application/json', },
                         body: JSON.stringify({first_name:formData.first_name, last_name:formData.last_name}),
                  });
        
                  const data = await response.json();
                  if(response.status === 200) {
                      toast.success(' Profile Updated successfully');
                     
                    
                  } else {
                      toast.error('Something went wrong');
                  }
                } catch (error) {  
                    toast.error('An error occurred ');
                }
             };

    return (
        <PublicLayout>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className='container py-5'>
              <h3 className='text-center  mb-4'>
                <i className='fas fa-user-circle me-2'></i>My Profile</h3>
                <form onSubmit={handleSubmit} className='card p-4 shadow-sm'>
                    <div className='row'>
                        <div className='col-md-6 mb-3'>
                            <label className='mb-1'>First Name</label>
                            <input type='text' className='form-control' name='first_name' value={formData.first_name} onChange={handleChange}/>
                        </div>
                         <div className='col-md-6 mb-3'>
                            <label className='mb-1'>Last Name</label>
                            <input type='text' className='form-control' name='last_name' value={formData.last_name} onChange={handleChange}/>
                        </div>
                         <div className='col-md-6 mb-3'>
                            <label className='mb-1'>Email</label>
                            <input type='email' className='form-control'  value={formData.email} disabled/>
                        </div>
                         <div className='col-md-6 mb-3'>
                            <label className='mb-1'>Mobile Number</label>
                            <input type='text' className='form-control'  value={formData.mobile_number} disabled/>
                        </div>
                         <div className='col-md-6 mb-3'>
                            <label className='mb-1'>Registration Date</label>
                            <input type='text' className='form-control'  value={new Date(formData.reg_date).toLocaleDateString()} disabled/>
                        </div>

                    </div>
                    <button type='submit' className='btn btn-success mt-3 fw-bold'>
                        <i className='fas fa-save me-2'></i> Update Profile
                    </button>

                </form>
            </div>



        </PublicLayout>

    )
}

export default Profile;
