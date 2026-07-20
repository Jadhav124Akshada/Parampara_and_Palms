import React, { useState } from 'react'
import { FaBars, FaBell, FaChevronLeft, FaChevronRight, FaSignOutAlt, FaUtensils } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const AdminHeader = ({ toggleSidebar , sidebarOpen, newOrder}) => {
  const navigate = useNavigate();
  // 1. Add state to track if the menu is open
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin-login');
  }
  
  const handleNotificationClick = () => {
        if (newOrder > 0) {
            navigate('/not-confirmed'); // Standard route string assigned inside your App.js paths
        }
    };
  // 2. Toggle function
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  return (
    <nav className='navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary  shadow sticky-top'>

        <button className='btn btn-outline-light me-3' onClick={toggleSidebar}>
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      <span className='navbar-brand h1 fw-bold mb-0 d-flex align-items-center'>
        <img src="/images/p.ico" alt="Logo" className="me-2" width="60" height="60"/>
        Parampara & Palms
      </span>

      <button 
        className='navbar-toggler' 
        type='button' 
        onClick={handleNavCollapse} // 3. Use React click handler
      >
        <FaBars />
      </button>

      {/* 4. Use a template literal to toggle the 'show' class */}
      <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id='adminNavbar'>
        <ul className='navbar-nav ms-auto align-items-center d-flex flex-row gap-3 mt-lg-0 mt-3'>
          <li className='nav-item'>
            <button className='btn btn-link text-white position-relative p-2 border-0' onClick={handleNotificationClick} title={newOrder > 0 ? "view new orders" : "no new orders"}>
              <FaBell size={20} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                {newOrder}
              </span>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
              </span>
            </button>
          </li>
          
          <li className='nav-item ms-2'>
            <button className='btn btn-danger d-flex align-items-center gap-2 px-3' onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default AdminHeader