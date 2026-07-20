import React, {useEffect,useState} from 'react'
import PublicLayout from '../components/PublicLayout'
import { Link , useLocation } from 'react-router-dom';
import '../styles/home.css'
const SearchPage = () => {
    const query = new URLSearchParams(useLocation().search).get('q') || '';
    const [results, setResults] = useState([]);
     useEffect(() => {
        if (query) {
                fetch(`http://localhost:8000/api/search-food/?q=${query}`)
                    .then(res => res.json())
                    .then(data => {
                        setResults(data);
                    })
                }
    }, [query]);
  return (
    <PublicLayout>
    <div className='container py-4'>
        <h3 className='text-center text-primary'>Result For: {query}</h3>
        <div className='row mt-4'>
            {results.length === 0 ? (
                <p>No Foods Found..</p>
            ) : (
                results.map((food,index)=> (
            <div className='col-md-4 mb-4 '>
                <div className='card hovereffect'>
                    <img src={`http://localhost:8000${food.image}`} className='card-img-top' style={{height:'180px'}}
                    alt={food.item_name}/>
                    <div className='card-body'>
                        <h5 className='card-title'>
                            <Link to="#">{food.item_name}</Link></h5>
                        <p className='card-text'>{food.description?.slice(0, 50)}...</p>
                        <div className='d-flex justify-content-between align-items-center'>
                         <span className='fw-bold'>₹ {food.price}</span>
                         {food.is_available ? (
                            
                         <Link to="#" className='btn btn-sm btn-outline-primary float-end'>
                         <i className='fas fa-shopping-basket me-1'></i>Order Now</Link>
                            ) : (
                                <div title='This Food Item is Currently Unavailable. Please try again later.'>
                                    <button  className='btn btn-sm btn-outline-secondary float-end'>
                         <i className='fas fa-times-circle me-1'></i>Currently Unavailable</button>
                        </div>
                            )}
                    </div>
                </div>
            </div>
            </div>
        ))
            )}
      </div>
    </div>
    
    </PublicLayout>
  )
}

export default SearchPage
