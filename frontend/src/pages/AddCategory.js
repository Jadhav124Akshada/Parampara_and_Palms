import React ,{useState} from 'react'
import AdminLayout from '../components/AdminLayout'
import {FaUser , FaLock , FaSignInAlt, FaPlusCircle} from 'react-icons/fa';
import{toast , ToastContainer} from 'react-toastify'    
import 'react-toastify/dist/ReactToastify.css'; 

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState('')
 

 const handleSubmit = async (e) => {
        e.preventDefault(); 
        try { 
    const response = await fetch('http://localhost:8000/api/add-category/', {
          method: 'POST',
          headers: {'Content-Type': 'application/json', },
          body: JSON.stringify({category_name : categoryName}),
      });
      const data = await response.json();
      if(response.status === 201) {
          toast.success('Category added successfully');
          setCategoryName('');
        
      } else {
          toast.error('Something went wrong');
      }
    } catch (error) {  
        toast.error('An error occurred while adding category');
    }
 }
  
  return (
    <AdminLayout>
    <div className='row'>
        <div className='col-md-8 '>
            <div className='p-4 shadow-sm rounded'>
                <h4 className='mb-4'>
                <i className='fas fa-edit me-2'></i>Add Food Category
                </h4>
                <form onSubmit={handleSubmit} >
                            <div className='mb-3'>
                                <label  className='form-label'>Category Name</label>
                                <input type='text' className='form-control' id='categoryName' value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder='Enter category name'/>
                            </div>
                            <button type='submit' className='btn btn-success w-100 '><FaPlusCircle className='me-2'/> Add Category</button>
                        </form>
            </div>
        </div>

        <div className='col-md-4 d-flex justify-content-center align-items-center'>
            <i className='fas fa-utensils 'style={{fontSize: '428px', color:'#e5e5e5'}  }
       ></i>
         

        </div>
        <ToastContainer position='bottom-center' autoClose={3000} hideProgressBar={true} closeOnClick={true} pauseOnHover={true} draggable={true} theme='colored'/>
    
    </div>
    </AdminLayout>
  )
}

export default AddCategory
