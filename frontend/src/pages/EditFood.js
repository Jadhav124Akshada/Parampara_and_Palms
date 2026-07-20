import React, { useState, useEffect } from 'react'; 
import AdminLayout from '../components/AdminLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlusCircle } from 'react-icons/fa'; 

const EditFood = () => {
    const { id } = useParams();
    const adminUser = localStorage.getItem("adminUser");
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        category: '',
        item_name: '',
        description: '', 
        quantity: '',   
        price: '',
        image: '',
        is_available: true, // Swapped string initializing fallback out for explicit true boolean
    });

    useEffect(() => {
        if (!adminUser) {
            navigate('/admin-login');
            return;
        }

        // Fetch the existing food data to populate the form fields
        fetch(`http://localhost:8000/api/edit-food/${id}/`)
            .then(res => res.json())
            .then(data => {
                setFormData({
                    category: data.category || '',
                    item_name: data.item_name || '',
                    description: data.description || '',
                    quantity: data.quantity || '',
                    price: data.price || '',
                    is_available: data.is_available ?? true, // FIXED: Now populates correct data from database
                    image: data.image || '' // Stores initial string image URL securely
                });
            })
            .catch(err => console.error("Fetch food error:", err));

        // Fetch categories for the select dropdown list
        fetch(`http://localhost:8000/api/categories/`)
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error("Fetch categories error:", err));    
    }, [id, adminUser, navigate]);
           
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            image: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        const result = new FormData();
        result.append('category', formData.category);
        result.append('item_name', formData.item_name);
        result.append('description', formData.description);
        result.append('quantity', formData.quantity);
        result.append('price', formData.price);
        result.append('is_available', formData.is_available ? 'true' : 'false'); // FIXED: Enforce absolute backend conversion checking by passing explicitly as 1 or 0
        // FIXED: Enforce absolute backend conversion checking by passing explicitly as 1 or 0
        result.append('is_available', formData.is_available ? 'true' : 'false');
        
        // Only append image if a new file was actually selected (instanceof File)
        if (formData.image instanceof File) {
            result.append('image', formData.image);
        }

        try { 
            const response = await fetch(`http://localhost:8000/api/edit-food/${id}/`, {
                method: 'PUT',
                body: result,  
            });

            const data = await response.json();
            
            if (response.status === 200) {
                toast.success(data.message || 'Food item updated successfully');
                setTimeout(() => {
                    navigate('/manage-food');
                }, 2000);
            } else {
                toast.error(data.message || 'Something went wrong');
            }
        } catch (error) {  
            toast.error('An error occurred while updating the food item');
        }
    };
          
    return (
        <AdminLayout>
            <div className='row'>
                <div className='col-md-8'>
                    <div className='p-4 shadow-sm rounded bg-white'>
                        <h4 className='mb-4'>
                            <i className='fas fa-edit me-2'></i> Edit Food Item
                        </h4>
                        <form onSubmit={handleSubmit} encType='multipart/form-data'>
                            <div className='mb-3'>
                                <label className='form-label'>Food Category Name</label>
                                <select 
                                    name='category' 
                                    className='form-select' 
                                    value={formData.category} 
                                    onChange={handleChange} 
                                    required
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className='mb-3'>
                                <label className='form-label'>Food Item Name</label>
                                <input name='item_name' type='text' className='form-control' value={formData.item_name} onChange={handleChange} placeholder='Enter item name' required />
                            </div>
                            
                            <div className='mb-3'>
                                <label className='form-label'>Description</label>
                                <textarea name='description' className='form-control' value={formData.description} onChange={handleChange} placeholder='Enter description' required />
                            </div>
                            
                            <div className='mb-3'>
                                <label className='form-label'>Quantity</label>
                                <input name='quantity' type='text' className='form-control' value={formData.quantity} onChange={handleChange} placeholder='e.g. 2 pcs / Large' required />
                            </div>
                            
                            <div className='mb-3'>
                                <label className='form-label'>Price (₹)</label>
                                <input name='price' type='number' className='form-control' step='0.01' value={formData.price} onChange={handleChange} placeholder='Enter price' required />
                            </div>
                            
                            <div className='mb-3 form-check form-switch'>
                                <input 
                                    name='is_available' 
                                    type='checkbox' 
                                    className='form-check-input' 
                                    checked={formData.is_available} 
                                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })} 
                                />
                                <label className='form-check-label ms-2'>{formData.is_available ? 'Available' : 'Not Available'}</label>
                            </div>

                            <div className='mb-3'>
                                <label className='form-label'>Image</label>
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <input name='image' type='file' accept='image/*' className='form-control' onChange={handleFileChange} />
                                    </div>
                                    <div className="col-md-6 d-flex justify-content-center">
                                        {formData.image && (
                                            <img 
                                                // FIXED: Generates direct structural local Blob window URLs if a File exists, fallback to Django root
                                                src={formData.image instanceof File ? URL.createObjectURL(formData.image) : `http://localhost:8000${formData.image}`}  
                                                alt="Food item preview"
                                                className='img-fluid rounded border' 
                                                style={{ maxHeight: '100px', objectFit: 'cover', padding: '5px' }} 
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <button type='submit' className='btn btn-success w-100'>
                                <FaPlusCircle className='me-2' /> Update Food Item
                            </button>
                        </form>
                    </div>
                </div>

                <div className='col-md-4 d-flex justify-content-center align-items-center'>
                    <i className='fas fa-pizza-slice' style={{ fontSize: '300px', color: '#e5e5e5' }}></i>
                </div>
            </div>
            
            <ToastContainer position='bottom-center' autoClose={3000} hideProgressBar={true} closeOnClick={true} pauseOnHover={true} draggable={true} theme='colored'/>
        </AdminLayout>
    );
};

export default EditFood;