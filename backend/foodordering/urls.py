from django.urls import path
from .views import *
import traceback

urlpatterns = [
    path('admin-login/', admin_login_api),
    path('add-category/', add_category_api),
    path('categories/', list_category_api),
    path('food/', list_food_api),
    path('add-food/', add_food_api),    
    path('search-food/', search_food_api),
    path('random-food/', random_food_api),
    path('register/', register_user_api),
    path('login/', login_user_api),
    path('foods/<int:id>', food_detail_api),
    path('cart/add/', add_to_cart_api),
    path('cart/<int:user_id>/', get_cart_item_api),
    path('cart/update_quantity/', upadate_cart_quntity_api),
    path('cart/delete/<int:order_id>/', delete_cart_item_api),
    path('place_order/', place_order_api),
    path('orders/<int:user_id>/', orders_api),
    path('orders/by_order_number/<str:order_number>/', by_order_number_api),
    path('order_address/<str:order_number>/', get_order_address_api),
    path('invoice/<str:order_number>', get_invoice_api),
    path('user/<int:user_id>/', get_user_profile_api),
    path('update/<int:user_id>/', update_user_profile_api),
    path('change_password/<int:user_id>/', change_password_api),
    path('not-confirmed/', not_confirmed_orders_api),
    path('confirmed/', confirmed_orders_api),
    path('being-prepared/', being_prepared_orders_api),
    path('food-picked-up/', food_picked_up_api),
    path('food-delivered/', food_delivered_api),
    path('order-cancelled/', order_cancelled_api),
    path('all-orders/', all_orders_api),
    path('order-between-dates/', order_between_dates_api),
    path('view_order_details/<str:order_number>/', view_order_details_api),
    path('update-order-status/', update_order_status_api),
    path('search-orders/', search_orders_api),
    path('category/<int:id>/', category_details_api),
    path('delete-food/<int:id>/', delete_food_api),
    path('edit-food/<int:id>/', edit_food_api),
    path('users/', list_users_api),
    path('users/<int:id>/', delete_user_api),
    path('dashboard-metrics/', dashboard_metrics_api),
    path('add-wishlist/', add_Wishlist_api),
    path('remove-wishlist/', remove_Wishlist_api),
    path('wishlist/<int:user_id>/', get_Wishlist_api),
    path('track/<str:order_number>/', get_order_tracking_api),
    path('food_details/<int:id>/', food_detail_api), # Maps to your existing detail view function
    path('reviews/<int:food_id>/', get_food_reviews_api), # Route for pulling the comment logs
    path('reviews/add/<int:food_id>/', add_review_api), # Route for posting a new review
    path('review-edit/<int:review_id>/', edit_review_api), # Route for updating a review
    path('review-delete/<int:review_id>/', delete_review_api), # Route for removing a review
    path('food-rating-summary/<int:food_id>/', food_rating_summary_api),
    path('all-reviews/', list_all_reviews_api),
    path('review-delete/<int:review_id>/', admin_delete_review_api),
    path('chatbot/', ChatbotView.as_view(), name='chatbot'),

]