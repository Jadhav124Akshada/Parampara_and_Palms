import{BrowserRouter as Router,Route,Routes, BrowserRouter} from 'react-router-dom'
import Home from './pages/home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AddCategory from './pages/AddCategory';  
import ManageCategory from './pages/ManageCategory';
import AddFood from './pages/AddFood';
import ManageFood from './pages/ManageFood';
import SearchPage from './pages/SearchPage';
import Register from './components/Register';
import Login from './components/Login';
import FoodDetail from './pages/FoodDetail';
import Cart from './pages/Cart';
import Payment from './pages/Payment';  
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import NotConfirm from './pages/NotConfirm';
import Confirm from './pages/Confirm';
import Pickup from './pages/Pickup';
import Delivered from './pages/Delivered';
import BeingPrepare from './pages/BeingPrepare';
import Cancelled from './pages/Cancelled';
import AllOrders from './pages/AllOrders';
import OrderReport from './pages/OrderReport';
import ViewOrder from './pages/ViewOrder';
import SearchOrder from './pages/SearchOrder';
import EditCategory from './pages/EditCategory';
import EditFood from './pages/EditFood';
import ManageUser from './pages/ManageUser';
import { CartProvider } from './context/CartContext';
import FoodList from './pages/FoodList';
import { WishlistProvider } from './context/WishlistContext';
import Wishlist from './pages/Wishlist';
import TrackOrder from './pages/TrackOrder';
import ManageReviews from './pages/ManageReviews';
function App() {
  return (
    <WishlistProvider>
    <CartProvider>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/admin-login' element={<AdminLogin/>}/>
        <Route path='/admin-dashboard' element={<AdminDashboard/>}/>
        <Route path='/add-category' element={<AddCategory/>}/>
        <Route path='/manage-category' element={<ManageCategory/>}/>
        <Route path='/edit-category/:id' element={<EditCategory/>}/>
        <Route path='/add-food' element={<AddFood/>}/>
        <Route path='/manage-food' element={<ManageFood/>}/>
        <Route path='/search' element={<SearchPage/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/food/:id' element={<FoodDetail/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/payment' element={<Payment/>}/>
        <Route path='/my-orders' element={<MyOrders/>}/>
        <Route path='/order-details/:order_number' element={<OrderDetails/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/change-password' element={<ChangePassword/>}/>
        <Route path='/confirmed' element={<Confirm/>}/>
        <Route path='/not-confirmed' element={<NotConfirm/>}/>
        <Route path='/pickup' element={<Pickup/>}/>
        <Route path='/delivered' element={<Delivered/>}/>
        <Route path='/being-prepared' element={<BeingPrepare/>}/>
        <Route path='/cancelled' element={<Cancelled/>}/>
        <Route path='/all-orders' element={<AllOrders/>}/>
        <Route path='/order-report' element={<OrderReport/>}/>
        <Route path='/food-order-details/:orderNumber' element={<ViewOrder/>}/>
        <Route path='/search-orders' element={<SearchOrder/>}/>
        <Route path= '/edit-category/:id' element={<ManageCategory/>}/>
        <Route path= '/edit-food/:id' element={<EditFood/>}/>
        <Route path='/manage-users' element={<ManageUser/>}/>
        <Route path='/food-menu' element={<FoodList/>}/>
        <Route path='/wishlist' element={<Wishlist/>}/>
        <Route path="/track-order/:orderNo" element={<TrackOrder />} />
        <Route path='/track-order' element={<TrackOrder/>}/>
        <Route path='/manage-reviews' element={<ManageReviews/>}/>

      </Routes>
    </BrowserRouter>
    </CartProvider>
    </WishlistProvider>

  );
}

export default App;
