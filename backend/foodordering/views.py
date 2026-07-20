from random import random
import traceback
from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view , parser_classes, permission_classes
from rest_framework.response import Response
from .models import *
from .serializers import *
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.hashers import make_password , check_password
import random
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.shortcuts import render
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Q, F, Count,Avg, FloatField
from django.db.models.functions import TruncMonth, TruncDay, Cast
from rest_framework.permissions import AllowAny
from rest_framework import status


@api_view(['POST'])
def admin_login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user is not None and user.is_staff:
        return Response({'message': 'Admin login successful', 'username': user.username}, status=200)
    return Response({'message': 'Invalid credentials'}, status=401)

@api_view(['POST'])
def add_category_api(request):
    category_name = request.data.get('category_name')
    if category_name:
        category.objects.create(category_name=category_name)
        return Response({'message': 'Category has been created'}, status=201)
    return Response({'message': 'Category name is required'}, status=400)

@api_view(['GET'])
def list_category_api(request):
    categories = category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data, status=200)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def add_food_api(request):
    serializer = FoodSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Food item has been added successfully'}, status=201)
    return Response({'message': 'Failed to add food item'}, status=400)


@api_view(['GET'])
def list_food_api(request):
    foods = food.objects.all()
    serializer = FoodSerializer(foods, many=True)
    return Response(serializer.data, status=200)    

@api_view(['GET'])
def search_food_api(request):
    query = request.GET.get('q', '')
    foods = food.objects.filter(item_name__icontains=query)
    serializer = FoodSerializer(foods, many=True)
    return Response(serializer.data, status=200)    

@api_view(['GET'])
def random_food_api(request):
    foods = list(food.objects.all())
    random.shuffle(foods)
    random_foods = food.objects.order_by('?')[:9]
    serializer = FoodSerializer(random_foods, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def register_user_api(request):
    # फ्रंटएंड के दोनों पॉसिबल Casing कीज़ ('Firstname'/'firstName') को एक्सेप्ट करने के लिए सेफ्टी चेक
    first_name = request.data.get('Firstname') or request.data.get('firstName') or request.data.get('first_name')
    last_name = request.data.get('Lastname') or request.data.get('lastName') or request.data.get('last_name')
    email = request.data.get('Email') or request.data.get('email')
    mobile = request.data.get('MobileNo') or request.data.get('mobileNumber') or request.data.get('mobile')
    password = request.data.get('Password') or request.data.get('password')

    if not all([first_name, last_name, email, mobile, password]):
        return Response({'message': 'Registration failed. All fields are required.'}, status=400)
    
    if User.objects.filter(email=email).exists() or User.objects.filter(mobile_number=mobile).exists():
        return Response({'message': 'Email or Mobile Number already registered'}, status=400)
    
    User.objects.create(
        first_name=first_name,
        last_name=last_name,
        mobile_number=mobile, 
        email=email,
        password=make_password(password) 
    )
    return Response({'message': 'Registration Successful'}, status=201)

# ==========================================
# 🔐 2. यूज़र लॉगिन API (सुरक्षित और अपडेटेड)
# ==========================================
@api_view(['POST'])
def login_user_api(request):
    # 'Emailcont' के साथ-साथ 'email' या 'identifier' को भी चेक करें ताकि रिक्वेस्ट मिस न हो
    identifier = request.data.get('Emailcont') or request.data.get('email') or request.data.get('identifier')
    password = request.data.get('Password') or request.data.get('password')
    
    if not identifier or not password:
        return Response({"message": "Email/Username and Password are required."}, status=400)
        
    try:    
        # ईमेल या मोबाइल नंबर दोनों में से किसी से भी लॉगिन की अनुमति दें
        user = User.objects.get(Q(email__iexact=identifier) | Q(mobile_number=identifier))        
        
        if check_password(password, user.password):
            return Response({
                'message': 'Login Successfully',
                "userId": user.id,
                "userName": f"{user.first_name} {user.last_name}" 
            }, status=200)
        else:
            return Response({"message": "Invalid Credentials"}, status=401)
            
    except User.DoesNotExist:
        return Response({'message': 'Invalid Credentials'}, status=401)
    except Exception as e:
        return Response({'message': f'An error occurred: {str(e)}'}, status=500)



@api_view(['GET'])
def food_detail_api(request, id):
    foods = get_object_or_404(food, id=id)
    serializer = FoodSerializer(foods)
    return Response(serializer.data)


@api_view(['POST'])
def add_to_cart_api(request):
    user_id = request.data.get('userID') 
    food_id = request.data.get('foodID')
    
    try:    
    
        user_obj = User.objects.get(id=user_id)    
        food_obj = food.objects.get(id=food_id)    
        item, created = cart.objects.get_or_create(
            User = user_obj,
            food = food_obj,
            is_order_placed = False,
            defaults = {'quantity': 1}
        )
        
        if not created:
            item.quantity += 1
            item.save()
            
        return Response({"message": "Food Added To Cart Successfully"}, status=200)
            
    except Exception as e:
        return Response({'message': str(e)}, status=400)

@api_view(['GET'])
def get_cart_item_api(request, user_id):
    cart_items = cart.objects.filter(User_id=user_id, is_order_placed=False).select_related('food')
    serializers = CartOrderSerializer(cart_items, many=True)
    return Response(serializers.data)

@api_view(['PUT'])
def upadate_cart_quntity_api(request):
    order_id = request.data.get('OrderId') 
    quantity = request.data.get('quantity')
    
    try:    

        cart_item = cart.objects.get(id=order_id, is_order_placed=False)    
        cart_item.quantity = quantity   
        cart_item.save()
        return Response({"message": "Quantity Updated Successfully"}, status=200)
            
    except Exception as e:
        return Response({'message': str(e)}, status=400)
    
@api_view(['DELETE'])
def delete_cart_item_api(request, order_id):
    try:    
        cart_item = cart.objects.get(id=order_id, is_order_placed=False)    
        cart_item.delete()
        return Response({"message": "Item Deleted From Cart"}, status=200)
            
    except Exception as e:
        return Response({'message': str(e)}, status=400)


def make_uniqe_order_number():
    while True:
        num = str(random.randint(10000000, 99999999))
        if not OrderAddress.objects.filter(order_number=num).exists():
            return num
@api_view(['POST'])
def place_order_api(request):
    user_id = request.data.get('userID') 
    address = request.data.get('address')
    payment_mode = request.data.get('paymentmode') 
    
    try:    
        cart_items = cart.objects.filter(User_id=user_id, is_order_placed=False)
        
        if not cart_items.exists():
            return Response({"message": "Cart is empty"}, status=400)

        order_number = make_uniqe_order_number()
        
        # 1. Update cart items
        cart_items.update(order_number=order_number, is_order_placed=True)
        
        OrderAddress.objects.create(
            User_id = user_id, 
            order_number = order_number,
            address = address
        )
        
        PaymentDetail.objects.create(
            User_id = user_id, # Changed from user_id
            order_number = order_number,
            payment_mode = payment_mode,
            card_number = request.data.get('cardNumber') if payment_mode == 'online' else None,
            expiry_date = request.data.get('expiry') if payment_mode == 'online' else None,
            cvv = request.data.get('cvv') if payment_mode == 'online' else None,
        )
        
        return Response({"message": "Order Placed Successfully!", "order_no": order_number}, status=201)
            
    except Exception as e:
        print(f"Checkout Error: {e}") 
        return Response({'message': str(e)}, status=400)


@api_view(['GET'])
def orders_api(request, user_id):
    orders = OrderAddress.objects.filter(User_id=user_id).order_by('-id')
    serializers = MyOrderListSerializer(orders, many=True)
    return Response(serializers.data)


@api_view(['GET'])
def by_order_number_api(request, order_number):
        orders = cart.objects.filter(order_number=order_number, is_order_placed=True).select_related('food')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
   

@api_view(['GET'])
def get_order_address_api(request, order_number):
        address = OrderAddress.objects.get(order_number=order_number)
        serializer = OrderAddressSerializer(address)
        return Response(serializer.data)


@api_view(['GET'])

def get_invoice_api(request, order_number):
    orders = cart.objects.filter(order_number=order_number, is_order_placed=True).select_related('food')
    address = OrderAddress.objects.select_related('User').get(order_number=order_number)
    
    try:
        payment = PaymentDetail.objects.get(order_number=order_number)
    except PaymentDetail.DoesNotExist:
        payment = None

    grand_total = 0
    order_data = []
    for order in orders:
        total_price = order.food.price * order.quantity
        grand_total += total_price
        order_data.append({
            'food': order.food,
            'quantity': order.quantity,
            'total_price': total_price
        })

    return render(request, 'invoice.html', {
        'order_number': order_number,
        'order_data': order_data,
        'address': address,
        'payment': payment,
        'grand_total': grand_total,
    })

@api_view(['GET'])
def get_user_profile_api(request, user_id):
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user)
        return Response(serializer.data)



@api_view(['PUT'])
def update_user_profile_api(request, user_id):
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile Updated Successfully!"}, status=200)
        return Response(serializer.errors,status=400)


@api_view(['POST'])
def change_password_api(request, user_id):
    try:
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        user = User.objects.get(id=user_id)
        if not check_password(current_password, user.password):
            return Response({"message": "Current password is incorrect"}, status=400)
        user.password = make_password(new_password)
        user.save()
        return Response({"message": "Password changed successfully!"}, status=200)
        
    except User.DoesNotExist:
        return Response({"message": "User not found"}, status=404)
    except Exception as e:
        return Response({"message": str(e)}, status=500)
    
@api_view(['GET'])
def not_confirmed_orders_api(request):
    orders = OrderAddress.objects.filter(order_final_status__isnull=True).order_by('-order_time')
    serializers = OrderSummarySerializer(orders, many=True)
    return Response(serializers.data)

@api_view(['GET'])
def confirmed_orders_api(request):
    orders = OrderAddress.objects.filter(order_final_status="Order Confirmed").order_by('-order_time')
    serializers = OrderSummarySerializer(orders, many=True)
    return Response(serializers.data)


@api_view(['GET'])
def being_prepared_orders_api(request):
    orders = OrderAddress.objects.filter(order_final_status="Order Being Prepared").order_by('-order_time')
    serializers = OrderSummarySerializer(orders, many=True)
    return Response(serializers.data)


@api_view(['GET'])
def food_picked_up_api(request):
    orders = OrderAddress.objects.filter(order_final_status="Order Picked Up").order_by('-order_time')
    serializers = OrderSummarySerializer(orders, many=True)
    return Response(serializers.data)


@api_view(['GET'])
def food_delivered_api(request):
    orders = OrderAddress.objects.filter(order_final_status="Order Delivered").order_by('-order_time')
    serializers = OrderSummarySerializer(orders, many=True)
    return Response(serializers.data)


@api_view(['GET'])
def order_cancelled_api(request):
    orders = OrderAddress.objects.filter(order_final_status="Order Cancelled").order_by('-order_time')
    serializers = OrderSummarySerializer(orders, many=True)
    return Response(serializers.data)


@api_view(['GET'])
def all_orders_api(request):
    orders = OrderAddress.objects.all().order_by('-order_time')
    serializers = OrderSummarySerializer(orders, many=True)
    return Response(serializers.data)


@api_view(['POST'])
def order_between_dates_api(request):
    form_date = request.data.get('form_date')
    to_date = request.data.get('to_date')
    status = request.data.get('status')
    orders = OrderAddress.objects.filter(order_time__date__range=[form_date, to_date])
    if status == 'not-confirmed':
        orders = orders.filter(order_final_status__isnull=True)
    elif status != 'all':
        orders = orders.filter(order_final_status=status)
    orders = orders.order_by('-order_time')
    serializers = OrderSummarySerializer(orders, many=True)
    return Response(serializers.data)



@api_view(['GET'])
def view_order_details_api(request, order_number):
    try:
        order_address = OrderAddress.objects.select_related('User').get(order_number=order_number)
        order_food = cart.objects.filter(order_number=order_number).select_related('food')
        tracking = FoodTracking.objects.filter(order_number=order_number).order_by('-status_date')
        
        return Response({
            'order': OrderDetailsSerializer(order_address).data,
            'food': OrderFoodSerializer(order_food, many=True).data,
            'tracking': FoodTrackingSerializer(tracking, many=True).data
        })
    except OrderAddress.DoesNotExist:
        return Response({"message": "Order not found"}, status=404)
    except Exception as e:
        return Response({"message": str(e)}, status=500)



@api_view(['POST'])
def update_order_status_api(request):
    order_num = request.data.get('order_number') 
    new_status = request.data.get('status')
    remark = request.data.get('remark')

    try:
        address_record = OrderAddress.objects.get(order_number=order_num)
        address_record.order_final_status = new_status
        address_record.save()
        FoodTracking.objects.create(
            User=address_record.User,
            order_number=order_num,  
            status=new_status,
            remark=remark,
            order_cancelled_by_user=False
        )
        return Response({"message": "Status updated successfully!"}, status=200)
    except OrderAddress.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)
    except Exception as e:
        print(f"Error: {e}") 
        return Response({"error": str(e)}, status=500)
    

@api_view(['GET'])
def search_orders_api(request):
    query = request.GET.get('q', '')
    if query:
        orders = OrderAddress.objects.filter(order_number__icontains=query).order_by('-order_time')
    else:
        orders = []
    serializer = OrderSummarySerializer(orders, many=True)
    return Response(serializer.data, status=200) 


@api_view(['GET', 'PUT', 'DELETE'])
def category_details_api(request, id):
    try:
        category_obj = category.objects.get(id=id)
    except category.DoesNotExist:
        return Response({'message': 'Category not found'}, status=404)
        
    if request.method == 'GET':
        serializer = CategorySerializer(category_obj)
        return Response(serializer.data, status=200)
        
    elif request.method == 'PUT':
        serializer = CategorySerializer(category_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Category updated successfully'}, status=200)
        return Response(serializer.errors, status=400)
        
    elif request.method == 'DELETE':
        try:
            category_obj.delete()
            return Response({'message': 'Category deleted successfully'}, status=200)
        except Exception as e:
            return Response({'message': f'Database deletion blocked: {str(e)}'}, status=500)
        


@api_view([ 'DELETE'])
def delete_food_api(request, id):
    try:
        food_obj= food.objects.get(id=id)
        food_obj.delete()
        return Response({'message': 'Food item deleted successfully'}, status=200)
    except food.DoesNotExist:
        return Response({'message': 'Food item not found'}, status=404)



@api_view(['GET', 'PUT'])
@parser_classes([MultiPartParser, FormParser])
def edit_food_api(request, id):
    try:
        food_obj = food.objects.get(id=id)
    except food.DoesNotExist:
        return Response({'message': 'Food item not found'}, status=404)
        
    if request.method == 'GET':
        serializer = FoodSerializer(food_obj)
        return Response(serializer.data, status=200)
        
    elif request.method == 'PUT':
        data = request.data.copy()
        if 'image' not in request.FILES:
            data['image'] = food_obj.image
            if 'is_available'  in data :
                data['is_available'] = data['is_available'].lower() == 'true'
        serializer = FoodSerializer(food_obj, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Food item   updated successfully'}, status=200)
        return Response(serializer.errors, status=400)
        
@api_view(['GET'])
def list_users_api(request):
    users = User.objects.all().order_by('-reg_date')
    serializer = UserDetailSerializer(users, many=True)
    return Response(serializer.data, status=200)

@api_view(['DELETE'])
def delete_user_api(request, id):
    try:
        user_obj = User.objects.get(id=id)
    except User.DoesNotExist:
        return Response({'message': 'User not found'}, status=404)
        
    try:
        user_obj.delete()
        return Response({'message': 'User deleted successfully'}, status=200)
    except Exception as e:
        # Handles instances where database deletion fails due to active order histories
        return Response({'message': f'Database deletion blocked: {str(e)}'}, status=500)



@api_view(['GET'])
def dashboard_metrics_api(request):
    """
    Unified High-Performance Analytical View for the Admin Dashboard.
    Provides complete state metrics and pure-CSS rendering chart tracking data.
    """
    now = timezone.now()
    
    # ------------------ Date Ranges ------------------
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)
    year_start = today_start - timedelta(days=365)

    # ------------------ Core Database Counts ------------------
    total_users = User.objects.count()
    total_categories = category.objects.count()
    total_food_items = food.objects.count()
    reviews_count = Review.objects.count()
    wishlists_count = Wishlist.objects.count()

    # ------------------ Order Status Lifecycle Counts ------------------
    total_orders = OrderAddress.objects.count()
    new_orders = OrderAddress.objects.filter(Q(order_final_status__isnull=True) | Q(order_final_status="Pending")).count()
    confirmed_orders = OrderAddress.objects.filter(order_final_status="Order Confirmed").count()
    prepared_orders = OrderAddress.objects.filter(order_final_status="Order Being Prepared").count()
    delivered_orders = OrderAddress.objects.filter(order_final_status="Order Delivered").count()
    cancelled_orders = OrderAddress.objects.filter(order_final_status="Order Cancelled").count()

    # ------------------ Time-Based Order Trends ------------------
    today_orders = OrderAddress.objects.filter(order_time__gte=today_start).count()
    week_orders = OrderAddress.objects.filter(order_time__gte=week_start).count()
    month_orders = OrderAddress.objects.filter(order_time__gte=month_start).count()

    # ------------------ Database-Level Revenue Aggregations ------------------
    def calculate_revenue_optimized(queryset):
        aggregation = queryset.aggregate(
            revenue=Sum(F('quantity') * F('food__price'))
        )
        return aggregation['revenue'] or 0.0

    placed_cart_items = cart.objects.filter(is_order_placed=True)

    total_revenue = calculate_revenue_optimized(placed_cart_items)
    today_revenue = calculate_revenue_optimized(placed_cart_items.filter(added_on__gte=today_start))
    week_revenue = calculate_revenue_optimized(placed_cart_items.filter(added_on__gte=week_start))
    month_revenue = calculate_revenue_optimized(placed_cart_items.filter(added_on__gte=month_start))
    year_revenue = calculate_revenue_optimized(placed_cart_items.filter(added_on__gte=year_start))

    # ------------------ Dynamic Chart Queries ------------------
    # 1. Dynamic Monthly Sales Analytics (Last 6 Months)
    six_months_ago = today_start - timedelta(days=180)
    
    monthly_sales_query = (
        cart.objects.filter(is_order_placed=True, added_on__gte=six_months_ago)
        .annotate(month_truncated=TruncMonth('added_on'))
        .values('month_truncated')
        .annotate(calculated_sales=Sum(F('quantity') * F('food__price')))
        .order_by('month_truncated')
    )
    
    monthlySalesData = []
    for item in monthly_sales_query:
        if item['month_truncated']:
            monthlySalesData.append({
                'month': item['month_truncated'].strftime('%b'),
                'sales': float(item['calculated_sales'] or 0.0)
            })

    # 2. Dynamic Top 5 Selling Products Leaderboard
    top_products_query = (
        cart.objects.filter(is_order_placed=True)
        .values('food__item_name')
        .annotate(value=Sum('quantity'))
        .order_by('-value')[:5]
    )
    topProductsData = [{'name': x['food__item_name'], 'value': x['value'] or 0} for x in top_products_query]

    # 3. Dynamic Weekly New Users Registration Trend (Last 7 Days)
    date_field = 'reg_date' if hasattr(User, 'reg_date') else 'date_joined'
    user_filter = {f"{date_field}__gte": week_start}
    
    weekly_users_trend = (
        User.objects.filter(**user_filter)
        .annotate(day_truncated=TruncDay(date_field))
        .values('day_truncated')
        .annotate(new_users_count=Count('id'))
        .order_by('day_truncated')
    )
    
    weeklyUsersData = []
    for x in weekly_users_trend:
        if x['day_truncated']:
            weeklyUsersData.append({
                'day': x['day_truncated'].strftime('%a'), 
                'newUsers': x['new_users_count']
            })

    # ------------------ Unified State Response Payload ------------------
    return Response({
        'metrics': {
            'totalOrders': total_orders,
            'totalRevenue': float(total_revenue),
            'totalUsers': total_users,
            'totalCategories': total_categories,
            'totalFoodItems': total_food_items,
            'newOrders': new_orders,
            'confirmedOrders': confirmed_orders,
            'preparedOrders': prepared_orders,
            'deliveredOrders': delivered_orders,
            'cancelledOrders': cancelled_orders,
            'today_Revenue': float(today_revenue),
            'week_Revenue': float(week_revenue),
            'month_Revenue': float(month_revenue),
            'year_Revenue': float(year_revenue),
            'today_Orders': today_orders,
            'week_Orders': week_orders,
            'month_Orders': month_orders,
            'reviews': reviews_count,
            'wishlists': wishlists_count,
        },
        'charts': {
            'monthlySales': monthlySalesData if monthlySalesData else [{'month': now.strftime('%b'), 'sales': float(month_revenue)}],
            'topProducts': topProductsData if topProductsData else [{'name': 'No Orders Yet', 'value': 0}],
            'weeklyUsers': weeklyUsersData if weeklyUsersData else [{'day': now.strftime('%a'), 'newUsers': 0}],
        }
    }, status=200)


@api_view(['POST'])
def add_Wishlist_api(request):
    user_id = request.data.get('user_id')
    food_id = request.data.get('food_id')
    obj, created = Wishlist.objects.get_or_create(User_id=user_id, food_id=food_id)
    if created:
            return Response({'message': 'Added to wishlist'}, status=201)
    else:
        return Response({'message': 'Already in wishlist'}, status=200)



@api_view(['POST'])
def remove_Wishlist_api(request):
    user_id = request.data.get('user_id')
    food_id = request.data.get('food_id')
    try:
        Wishlist.objects.get(User_id=user_id, food_id=food_id).delete()

        return Response({'message': 'Removed from wishlist'}, status=200)
    except Wishlist.DoesNotExist:
        return Response({'message': 'Item not in wishlist'}, status=404)
    else:
        return Response({'message': 'Already in wishlist'}, status=200)
    

from.serializers import WishlistSerializer  
@api_view(['GET'])
def get_Wishlist_api(request, user_id):
     wishlist_items = Wishlist.objects.filter(User_id=user_id)
     serializer = WishlistSerializer(wishlist_items, many=True)      
     return Response(serializer.data, status=200)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_order_tracking_api(request, order_number):
    try:
        # Fetch tracking logs sorted chronologically from oldest to newest
        tracking_logs = FoodTracking.objects.filter(order_number=order_number).order_by('status_date')
        
        if not tracking_logs.exists():
            return Response({'message': 'No tracking information found for this order number.'}, status=status.HTTP_404_NOT_FOUND)
            
        data = []
        for log in tracking_logs:
            raw_status = log.status.lower().strip()
            
            # Normalization mapping to ensure direct pairing with frontend milestone keys
            clean_status = raw_status
            if "confirm" in raw_status:
                clean_status = "confirmed"
            elif "prepar" in raw_status:
                clean_status = "prepared"
            # FIX: Added "pick" and "up" conditions to catch "order picked up" or "picked up"
            elif "pickup" in raw_status or "out for" in raw_status or ("pick" in raw_status and "up" in raw_status):
                clean_status = "pickup"
            elif "deliver" in raw_status:
                clean_status = "delivered"
            elif "cancel" in raw_status:
                clean_status = "cancelled"

            data.append({
                'id': log.id,
                'status': clean_status,
                'remark': log.remark if hasattr(log, 'remark') and log.remark else 'Status updated',
                'status_date': log.status_date.strftime('%d/%m/%Y, %I:%M:%S %p'),
                'cancelled': getattr(log, 'order_cancelled_by_user', False)
            })
            
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 

@api_view(['POST']) 
@permission_classes([AllowAny])
def order_cancelled_api(request):
    try:
        order_number = request.data.get('order_number') or request.data.get('orderNumber')
        remark = request.data.get('remark', 'Cancelled by customer.')

        if not order_number:
            return Response({'message': 'Order number is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Locate the master order placement record row
        try:
            order_address = OrderAddress.objects.get(order_number=order_number)
        except OrderAddress.DoesNotExist:
            return Response({'message': 'Order record not found.'}, status=status.HTTP_404_NOT_FOUND)

        # 2. Safety Check: Prevent cancellation if the kitchen already cooked it
        current_status = getattr(order_address, 'order_final_status', '')
        if current_status:
            current_status = str(current_status).lower().strip()
            if any(keyword in current_status for keyword in ['prepared', 'pickup', 'delivered', 'cancel', 'picked up']):
                return Response(
                    {'message': f'Cannot cancel. Order is already {order_address.order_final_status}.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 3. Update the order final status field
        order_address.order_final_status = 'cancelled'
        order_address.save()

        # 4. Extract the user from the order_address to fulfill the NOT NULL constraint
        # We try to grab the relationship dynamically based on how your model handles casing
        user_instance = getattr(order_address, 'User', None) or getattr(order_address, 'user', None)
        user_id_val = getattr(order_address, 'User_id', None) or getattr(order_address, 'user_id', None)

        # 5. Inject update event tracking history milestone row entry
        tracking_kwargs = {
            'order_number': order_number,
            'status': 'cancelled',
            'remark': remark,
            'order_cancelled_by_user': True
        }

        # Dynamically attach the user parameter depending on your model field naming structure
        if hasattr(FoodTracking, 'User'):
            tracking_kwargs['User'] = user_instance
        elif hasattr(FoodTracking, 'user'):
            tracking_kwargs['user'] = user_instance
        else:
            # If relationship properties are ambiguous, map the raw column attribute field directly
            if user_id_val is not None:
                tracking_kwargs['User_id'] = user_id_val

        # Create tracking record safely
        FoodTracking.objects.create(**tracking_kwargs)

        return Response({'message': 'Order cancelled successfully.'}, status=status.HTTP_200_OK)

    except Exception as e:
        print("--- CRITICAL BACKEND ERROR ---")
        traceback.print_exc() 
        print("-------------------------------")
        return Response({'message': f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['GET'])
@permission_classes([AllowAny])
def get_food_reviews_api(request, food_id):
    try:
        # फ़ूड आईडी के आधार पर फ़िल्टर करें (नवीनतम पहले)
        reviews_list = Review.objects.filter(food_id=food_id).order_by('-id')
        
        serialized_reviews = []
        for rev in reviews_list:
            # आपके models.py में User फॉरेन की है, इसलिए rev.User का उपयोग होगा
            serialized_reviews.append({
                "id": rev.id,
                "user_id": rev.User.id,
                "user_name": f"{rev.User.first_name} {rev.User.last_name}".strip() or rev.User.email,
                "rating": rev.rating,
                "comment": rev.comment,
                "created_at": rev.created_at.isoformat() if rev.created_at else ""
            })
            
        return Response(serialized_reviews, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': f"Error fetching reviews: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# B. नया रिव्यू जोड़ने के लिए (POST)
@api_view(['POST'])
@permission_classes([AllowAny])
def add_review_api(request, food_id):
    try:
        user_id = request.data.get('user_id') or request.data.get('userId')
        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not user_id:
            return Response({'message': 'User authentication identifier is missing.'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not rating or int(rating) < 1 or int(rating) > 5:
            return Response({'message': 'Please provide a valid rating between 1 and 5.'}, status=status.HTTP_400_BAD_REQUEST)

        # आपके models.py के केसिंग के अनुसार ऑब्जेक्ट्स निकालें
        user_obj = get_object_or_404(User, id=user_id)
        food_obj = get_object_or_404(food, id=food_id) # lowercase 'food'

        # डेटाबेस में बिल्कुल सटीक कॉलम कीज़ के साथ सेव करें
        Review.objects.create(
            User=user_obj,  # uppercase 'User'
            food=food_obj,  # lowercase 'food'
            rating=int(rating),
            comment=str(comment).strip()
        )

        return Response({'message': 'Review submitted successfully!'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        print("--- CRITICAL ERROR ON REVIEW ADDITION ---")
        traceback.print_exc()
        return Response({'message': f"Database Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# C. रिव्यू एडिट/अपडेट करने के लिए (PUT)
@api_view(['PUT'])
@permission_classes([AllowAny])
def edit_review_api(request, review_id):
    try:
        review_obj = get_object_or_404(Review, id=review_id)
        
        rating = request.data.get('rating')
        comment = request.data.get('comment')

        if not rating or int(rating) < 1 or int(rating) > 5:
            return Response({'message': 'Please select a valid rating between 1 and 5.'}, status=status.HTTP_400_BAD_REQUEST)

        review_obj.rating = int(rating)
        review_obj.comment = str(comment).strip()
        review_obj.save()

        return Response({'message': 'Review updated successfully.'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': f"Error updating review: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# D. रिव्यू डिलीट करने के लिए (DELETE)
@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_review_api(request, review_id):
    try:
        review_obj = get_object_or_404(Review, id=review_id)
        review_obj.delete()
        return Response({'message': 'Review deleted successfully.'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': f"Error deleting review: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@permission_classes([AllowAny])
def food_rating_summary_api(request, food_id):
    """
    सटीक फ्लोट एवरेज (जैसे 2.5, 4.2) की गणना करने के लिए टाइपकास्टेड रेटिंग समरी एपीआई।
    """
    try:
        reviews_queryset = Review.objects.filter(food_id=food_id)
        total_reviews = reviews_queryset.count()

        # 🛠️ FIX: इंटीजर रेटिंग को FloatField में कास्ट करें ताकि डेटाबेस हाफ-वैल्यूज (2.5) को न काटे
        avg_aggregate = reviews_queryset.aggregate(
            average=Avg(Cast('rating', FloatField()))
        )
        average_rating = avg_aggregate.get('average') or 0.0

        # स्टार्स ग्रुप बाई काउंट (1 से 5 स्टार तक)
        summary_query = (
            reviews_queryset.values('rating')
            .annotate(star_count=Count('id'))
            .order_by('-rating')
        )

        star_breakdown = {str(stars): 0 for stars in range(1, 6)}
        for entry in summary_query:
            star_val = str(entry.get('rating'))
            if star_val in star_breakdown:
                star_breakdown[star_val] = entry.get('star_count')

        payload_data = {
            "average": round(float(average_rating), 1),  # अब यह सटीक 2.5 या 3.5 भेजेगा
            "total_reviews": total_reviews,
            "breakdown": star_breakdown
        }
        return Response(payload_data, status=status.HTTP_200_OK)

    except Exception as e:
        traceback.print_exc()
        return Response(
            {"message": f"Server error inside summaries: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

@api_view(['GET'])
@permission_classes([AllowAny]) # Change to [IsAdminUser] in production based on your system auth mapping
def list_all_reviews_api(request):
    """
    Fetches all compiled reviews across all menu options from the database,
    ordered chronologically by latest entries first, with optimized foreign key joins.
    """
    try:
        # Use select_related to query parent user and food instances to optimize execution paths
        all_reviews = Review.objects.select_related('User', 'food').all().order_by('-created_at')
        
        serialized_data = []
        for rev in all_reviews:
            serialized_data.append({
                "id": rev.id,
                "food_id": rev.food.id,
                "food_name": rev.food.item_name,
                "user_id": rev.User.id,
                "user_name": f"{rev.User.first_name} {rev.User.last_name}".strip() or rev.User.email,
                "rating": rev.rating,
                "comment": rev.comment,
                "created_at": rev.created_at.strftime('%d/%m/%Y, %I:%M %p') if rev.created_at else ""
            })
            
        return Response(serialized_data, status=status.HTTP_200_OK)
    except Exception as e:
        print("--- DATABASE EXCEPTION FETCHING ALL REVIEWS ---")
        traceback.print_exc()
        return Response({"message": f"Server error aggregating feedback items: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([AllowAny]) # Update to custom permission guards if required
def admin_delete_review_api(request, review_id):
    """
    Enables admin users to directly delete an inappropriate comment record
    from the global database history mapped by primary key indices.
    """
    try:
        review_instance = Review.objects.get(id=review_id)
        review_instance.delete()
        return Response({"message": "Review deleted successfully."}, status=status.HTTP_200_OK)
    except Review.DoesNotExist:
        return Response({"message": "Target review item was not found in the server record context."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": f"Deletion execution failure: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)






        