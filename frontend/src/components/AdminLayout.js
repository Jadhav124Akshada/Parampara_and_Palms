import React ,{useState,useEffect} from 'react'
import AdminSidebar from './AdminSidebar'       
import AdminHeader from './AdminHeader'
import '../styles/admin.css'


const AdminLayout = ({children}) => {
    const[sidebarOpen, setSidebarOpen] = useState(true);
    const[newOrder, setNewOrder] = useState(0);

   useEffect(() => {
        let isMounted = true;

        fetch(`http://localhost:8000/api/dashboard-metrics/`)
            .then(res => res.json())
            .then(data => {
                if (isMounted && data.metrics) {
                    // Pulls parameters cleanly out of the structured key index
                    setNewOrder(data.metrics.newOrders || 0);
                }
            })
            .catch(err => console.error("Live metrics sync failed:", err));

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        const hanfleResize = () => {
            if(window.innerWidth < 768) {
                setSidebarOpen(false); //mobileview
            } else {
                setSidebarOpen(true); //desktopview
            }
        
        }
        hanfleResize();
        window.addEventListener('resize', hanfleResize);
        return () => window.removeEventListener('resize', hanfleResize);
  }, []);
  
const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
}

  return (
    <div className='d-flex'>
       {sidebarOpen && <AdminSidebar/>}

    <div id="page-content-wrapper" className={`w-100 ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
        <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} newOrder={newOrder} />
        <div className="container-fluid mt-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
