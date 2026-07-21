import React, { useState, useEffect } from 'react'; 
import AdminLayout from '../components/AdminLayout';
import { Link } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageFood = () => {
    const [food, setFood] = useState([]);
    const [allFood, setAllFood] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetch('https://parampara-and-palms.onrender.com/api/food/')
            .then(res => res.json())
            .then(data => {
                const fetchedData = Array.isArray(data) ? data : (data.food || []);
                setFood(fetchedData);
                setAllFood(fetchedData);
            })
            .catch(err => console.error("Fetch error:", err));
    }, []);

    const handleSearch = (s) => {
        const keyword = s.toLowerCase();
        setCurrentPage(1);
        if (!keyword) {
            setFood(allFood);
        } else {
            const filtered = allFood.filter(f => 
                f.item_name.toLowerCase().includes(keyword)
            );
            setFood(filtered);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this food item?")) {
            fetch(`https://parampara-and-palms.onrender.com/api/delete-food/${id}/`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                toast.success(data.message || "Food item deleted successfully");
                const updated = food.filter(item => item.id !== id);
                setFood(updated);
                setAllFood(prev => prev.filter(item => item.id !== id));
            })
            .catch(err => toast.error("Failed to delete food item"));
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFood = food.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.max(1, Math.ceil(food.length / itemsPerPage));

    return (
        <AdminLayout>
            <ToastContainer position='bottom-center' theme='colored' />
            
            {/* फ्लेक्सबॉक्स का उपयोग किया गया है ताकि पेजिनेशन हमेशा नीचे रहे */}
            <div className="container-fluid py-2 d-flex flex-column" style={{ minHeight: '80vh' }}>
                <h3 className='text-center text-dark mb-4'>
                    <i className='fas fa-list-alt me-1'></i>Manage Food Items
                </h3>
                
                <div className='mb-3 d-flex justify-content-between align-items-center'>
                    <input type='text' className='form-control w-25' placeholder='Search food...' onChange={(e) => handleSearch(e.target.value)} />
                    <CSVLink data={allFood} className='btn btn-success' filename={'food_items.csv'}>Export To CSV</CSVLink>
                </div>

                {/* टेबल का एरिया */}
                <div className="table-responsive shadow-sm rounded-3 flex-grow-1">
                    <table className='table table-bordered table-striped table-hover mb-0'>
                        <thead className='table-dark'>
                            <tr>
                                <th>S.No</th>
                                <th>Category Name</th>
                                <th>Food Item Name</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentFood.map((f, index) => (
                                <tr key={f.id || index}>
                                    <td>{indexOfFirstItem + index + 1}</td>
                                    <td>{f.category_name}</td>
                                    <td>{f.item_name}</td>
                                    <td className="text-center">
                                        <Link to={`/edit-food/${f.id}`} className='btn btn-primary btn-sm me-2'>Edit</Link>
                                        <button onClick={() => handleDelete(f.id)} className='btn btn-danger btn-sm'>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* पेजिनेशन सेक्शन: अब यह टेबल के नीचे हमेशा दिखेगा */}
                <div className="mt-4 pb-4 text-center">
                    <nav aria-label="Page navigation">
                        <ul className="pagination justify-content-center shadow-sm d-inline-flex">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link text-dark fw-bold" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
                            </li>
                            <li className="page-item disabled">
                                <span className="page-link text-dark fw-bold">Page {currentPage} of {totalPages}</span>
                            </li>
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link text-dark fw-bold" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManageFood;