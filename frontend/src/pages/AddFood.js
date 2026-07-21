import React ,{useState , useEffect} from 'react'
import AdminLayout from '../components/AdminLayout'
import{toast , ToastContainer} from 'react-toastify'    
import 'react-toastify/dist/ReactToastify.css';
import {FaPlusCircle} from 'react-icons/fa';
import { Form } from 'react-router-dom';


const AddFood = () => {
    const [categories, setCategories] = useState([])
        const [formData, setFormData] = useState({
        category: '',
        item_name: '',
        description: '', 
        quantity: '',   
        price: '',
        image: null,
        })

    
        useEffect(() => {
            fetch('https://parampara-and-palms.onrender.com/api/categories/')
                .then(res => res.json())
                .then(data => {
                    setCategories(data);
                })
        }, []); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            image: e.target.files[0]
        }));
    }

     const handleSubmit = async (e) => {
            e.preventDefault(); 
            const result = new FormData();
            result.append('category', formData.category);
            result.append('item_name', formData.item_name);
            result.append('description', formData.description);
            result.append('quantity', formData.quantity);
            result.append('price', formData.price);
            result.append('image', formData.image);
           if (formData.image) {
        result.append('image', formData.image);
    }
            try { 
        const response = await fetch('https://parampara-and-palms.onrender.com/api/add-food/', {
              method: 'POST',
              body: result,  
          });

          const data = await response.json();
          if(response.status === 201) {
              toast.success('Food item added successfully');
              setFormData({
                category: '',
                item_name: '',  
                description: '',
                quantity: '', 
                price: '',
                image: null,
              });
            
          } else {
              toast.error('Something went wrong');
          }
        } catch (error) {  
            toast.error('An error occurred while adding category');
        }
     };
      
  return (
     <AdminLayout>
        <ToastContainer position='bottom-center' autoClose={3000} hideProgressBar={true} closeOnClick={true} pauseOnHover={true} draggable={true} theme='colored'/>
    <div className='row'>
        <div className='col-md-8 '>
            <div className='p-4 shadow-sm rounded'>
                <h4 className='mb-4'>
                <i className='fas fa-edit me-2'></i>Add Food Item
                </h4>
                <form onSubmit={handleSubmit} encType='multipart/form-data'>
                            <div className='mb-3'>
                                <label  className='form-label'>Food Category Name</label>
                                <select name='category' className='form-select'  value={formData.category} onChange={handleChange} required>
                                 <option value="" disabled selected>Select Category</option>
                                 {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                 ))}
                                </select>
                            </div>


                            <div className='mb-3'>
                                <label  className='form-label'>Food Item Name</label>
                                <input name='item_name' type='text' className='form-control'  value={formData.item_name} onChange={handleChange} placeholder='Enter item name'required/>
                            </div>
                             <div className='mb-3'>
                                <label  className='form-label'>Description</label>
                                <textarea name='description' className='form-control'  value={formData.description} onChange={handleChange} placeholder='Enter description'required/>
                            </div>
                             <div className='mb-3'>
                                <label  className='form-label'>Quantity</label>
                                <input name='quantity' type='text' className='form-control'  value={formData.quantity} onChange={handleChange} placeholder='e.g. 2 pcs / Large'required/>
                            </div>
                             <div className='mb-3'>
                                <label  className='form-label'>Price(₹)</label>
                                <input name='price' type='number' className='form-control' step='0.01'  value={formData.price}  onChange={handleChange} placeholder='Enter price'required/>
                            </div>
                             <div className='mb-3'>
                                <label  className='form-label'>Image</label>
                                <input name='image' multiple type='file' accept='image/*' className='form-control' onChange={handleFileChange} />
                            </div>
                            
                            <button type='submit' className='btn btn-success w-100 '><FaPlusCircle className='me-2'/> Add Food Item</button>
                        </form>
            </div>
        </div>

        <div className='col-md-4 d-flex justify-content-center align-items-center'>
            <i className='fas fa-pizza-slice  'style={{fontSize: '428px', color:'#e5e5e5'}  }
       ></i>
         

        </div>
        <ToastContainer position='bottom-center' autoClose={3000} hideProgressBar={true} closeOnClick={true} pauseOnHover={true} draggable={true} theme='colored'/>
    
    </div>
    </AdminLayout>
  )
}

export default AddFood
