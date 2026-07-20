import  React , {useState} from 'react'
import {FaUser , FaLock , FaSignInAlt} from 'react-icons/fa';
import '../styles/admin.css'
import{toast , ToastContainer} from 'react-toastify'    
import 'react-toastify/dist/ReactToastify.css'; 
import PublicLayout from '../components/PublicLayout';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');   
    const handleLogin = async (e) => {
        e.preventDefault();

    const response = await fetch('http://localhost:8000/api/admin-login/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if(response.status === 200) {
        toast.success('Admin login successful');
        localStorage.setItem('adminUser', username);
        setTimeout(() => {
        window.location.href = '/admin-dashboard';
        }, 2000);
    } else {
        toast.error('Invalid credentials');
    }
}
  return (
    <PublicLayout>
    <div className='d-flex justify-content-center align-items-center vh-100' marginTop='300px'
    style={{backgroundImage:`url("/images/b5.png")`, backgroundSize:'100% 100%', backgroundRepeat:'no-repeat'}}>
    <div className='card p-4 shadow-lg'>
     <h4 className='text-center mb-4'>
        <FaUser className='me-4'/> Login</h4> 
        <form onSubmit={handleLogin} >
            <div className='mb-3'>
                <label  className='form-label'>Username</label>
                <input type='text' className='form-control' id='username' value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Enter username'/>
            </div>
            <div className='mb-3'>
                <label  className='form-label'>Password</label>
                <input type='password' className='form-control' id='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Enter password' required/>
            </div>
            <button type='submit' className='btn btn-success w-100'><FaSignInAlt className='me-2'/> Login</button>
        </form>
    </div>
    <ToastContainer position='bottom-center' autoClose={3000} hideProgressBar={true} closeOnClick={true} pauseOnHover={true} draggable={true} theme='colored'/>
    </div>
    </PublicLayout>
  )
}

export default AdminLogin