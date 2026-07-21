import React, { useState, useEffect } from 'react'; // Removed unused 'use'
import AdminLayout from '../components/AdminLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlusCircle } from 'react-icons/fa'; 

const EditCategory = () => {
    const [categoryName, setCategoryName] = useState("");
    const { id } = useParams();
    const adminUser = localStorage.getItem("adminUser");
    const navigate = useNavigate();

    useEffect(() => {
        if (!adminUser) {
            navigate('/admin-login');
            return;
        }
        fetch(`https://parampara-and-palms.onrender.com/api/category/${id}/`)
            .then(res => res.json())
            .then(data => setCategoryName(data.category_name))
            .catch(err => console.error("Update error:", err));

            
}, [id], );
       



        const handleUpdate = (e) => {
            e.preventDefault();
            fetch(`https://parampara-and-palms.onrender.com/api/category/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category_name: categoryName }),
        })
            .then(res => res.json())
            .then(data => {
                toast.success(data.message);
                setTimeout(() => {
                navigate('/manage-category');
                }, 2000);
            })
            .catch(err => console.error("Update error:", err));
            }
        


        return (
            <AdminLayout>
                <div className='row'>
                    <div className='col-md-8 '>
                        <div className='p-4 shadow-sm rounded'>
                            <h4 className='mb-4'>
                                <i className='fas fa-edit me-2'></i> Edit Food Category
                            </h4>
                            <form onSubmit={handleUpdate} >
                                <div className='mb-3'>
                                    <label className='form-label'>Category Name</label>
                                    <input type='text' className='form-control' id='categoryName' value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder='Enter category name' />
                                </div>
                                <button type='submit' className='btn btn-success w-100 '><FaPlusCircle className='me-2' /> Update Category</button>
                            </form>
                        </div>
                    </div>

                    <div className='col-md-4 d-flex justify-content-center align-items-center'>
                        <i className='fas fa-utensils ' style={{ fontSize: '428px', color: '#e5e5e5' }}
                        ></i>


                    </div>
                    <ToastContainer position='bottom-center' autoClose={3000} hideProgressBar={true} closeOnClick={true} pauseOnHover={true} draggable={true} theme='colored' />

                </div>
            </AdminLayout>
        )
    }

export default EditCategory
