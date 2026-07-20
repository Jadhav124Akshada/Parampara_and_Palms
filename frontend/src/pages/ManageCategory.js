import React, { useState, useEffect } from 'react'; 
import AdminLayout from '../components/AdminLayout';
import { Link } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageCategory = () => {
    const [categories, setCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetch('http://localhost:8000/api/categories/')
            .then(res => res.json())
            .then(data => {
                const fetchedData = Array.isArray(data) ? data : (data.categories || []);
                setCategories(fetchedData);
                setAllCategories(fetchedData);
            })
            .catch(err => console.error("Fetch error:", err));
    }, []);

    const handleSearch = (s) => {
        const keyword = s.toLowerCase();
        setCurrentPage(1);
        if (!keyword) {
            setCategories(allCategories);
        } else {
            const filtered = allCategories.filter(cat => 
                cat.category_name.toLowerCase().includes(keyword)
            );
            setCategories(filtered);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            fetch(`http://localhost:8000/api/category/${id}/`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                toast.success("Category deleted");
                const updated = categories.filter(cat => cat.id !== id);
                setCategories(updated);
                setAllCategories(prev => prev.filter(cat => cat.id !== id));
            })
            .catch(err => toast.error("Failed to delete"));
        }
    };

    // गणना (Math.max(1, ...)) यह सुनिश्चित करता है कि कम से कम 1 पेज हमेशा रहे
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));

    return (
        <AdminLayout>
            <ToastContainer position='bottom-center' theme='colored' />
            <div className="container-fluid py-2" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <h3 className='text-center text-dark mb-4'><i className='fas fa-list-alt me-1'></i>Manage Food Categories</h3>
                
                <h5 className='text-end text-muted'>
                    Total: <span className='badge bg-success'>{categories.length}</span>
                </h5>

                <div className='mb-3 d-flex justify-content-between'>
                    <input type='text' className='form-control w-25' placeholder='Search...' onChange={(e) => handleSearch(e.target.value)} />
                    <CSVLink data={allCategories} className='btn btn-success' filename={'categories.csv'}>Export CSV</CSVLink>
                </div>

                <div className="table-responsive shadow-sm rounded-3 flex-grow-1">
                    <table className='table table-bordered table-striped table-hover'>
                        <thead className='table-dark'>
                            <tr>
                                <th>S.No</th>
                                <th>Category Name</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCategories.map((cat, index) => (
                                <tr key={cat.id}>
                                    <td>{indexOfFirstItem + index + 1}</td>
                                    <td>{cat.category_name}</td>
                                    <td className="text-center">
                                        <button onClick={() => handleDelete(cat.id)} className='btn btn-danger btn-sm'>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* यह हिस्सा अब टेबल के नीचे हमेशा दिखेगा */}
                <div className="mt-auto py-4 text-center">
                    <nav>
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link fw-bold text-dark"  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
                            </li>
                            <li className="page-item disabled">
                                <span className="page-link text-dark fw-bold">Page {currentPage} of {totalPages}</span>
                            </li>
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link fw-bold text-dark" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManageCategory;