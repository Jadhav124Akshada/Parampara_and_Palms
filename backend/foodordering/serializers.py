from rest_framework import serializers
from .models import *

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = category
        fields = ['id', 'category_name', 'creation_date']

class FoodSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.category_name', read_only=True)
    image = serializers.ImageField(required=False)
    is_available = serializers.BooleanField(required=False, default=True)
    class Meta:
        model = food
        fields = ['id', 'category','category_name', 'item_name', 'description', 'quantity', 'price', 'image', 'is_available', 'creation_date']   

class CartOrderSerializer(serializers.ModelSerializer):
    food = FoodSerializer()
    class Meta:
        model = cart
        fields = ['id', 'food', 'quantity']

class MyOrderListSerializer(serializers.ModelSerializer):
    order_final_status = serializers.SerializerMethodField()
    class Meta:
        model = OrderAddress
        fields = ['order_number', 'order_time', 'order_final_status']
    def get_order_final_status(self, obj):
        return obj.order_final_status or 'Waiting For Restaurant Confirmation'
        
class OrderSerializer(serializers.ModelSerializer):
    food = FoodSerializer()
    class Meta:
        model = cart
        fields = ['food', 'quantity'] 

class OrderAddressSerializer(serializers.ModelSerializer):
    payment_mode = serializers.SerializerMethodField()
    class Meta:
        model = OrderAddress
        fields = ['order_number','address' ,'order_time', 'order_final_status','payment_mode']
    def get_payment_mode(self, obj):
        try:
            payment = PaymentDetail.objects.get(order_number = obj.order_number)
            return payment.payment_mode
        except PaymentDetail.DoesNotExist:
            return None;    

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name','last_name','email','mobile_number','reg_date'] 



class OrderSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderAddress
        fields = ['id', 'order_number', 'order_time']

class OrderDetailsSerializer(serializers.ModelSerializer):
    # 'User' must be capitalized to match your OrderAddress model field
    user_first_name = serializers.CharField(source='User.first_name', read_only=True)
    user_last_name = serializers.CharField(source='User.last_name', read_only=True)
    user_email = serializers.EmailField(source='User.email', read_only=True)
    user_mobile_number = serializers.CharField(source='User.mobile_number', read_only=True)
    
    # Use a SerializerMethodField to calculate the total order price
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderAddress
        fields = [
            'order_number', 'order_time', 'order_final_status', 'address',
            'user_first_name', 'user_last_name', 'user_email', 'user_mobile_number',
            'total_price'
        ]

    def get_total_price(self, obj):
        # Filter cart items matching this order number to calculate sum
        from .models import cart
        items = cart.objects.filter(order_number=obj.order_number)
        return sum(item.food.price * item.quantity for item in items)
    
    
class OrderFoodSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='food.item_name', read_only=True)
    price = serializers.CharField(source='food.price', read_only=True)
    image = serializers.ImageField(source='food.image', read_only=True)
    class Meta:
        model = food
        fields = [ 'item_name','price', 'image' ]

class FoodTrackingSerializer(serializers.ModelSerializer):

    class Meta:
        model = FoodTracking
        fields = [ 'remark','status', 'status_date','order_cancelled_by_user' ]


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'mobile_number', 'reg_date']


class WishlistSerializer(serializers.ModelSerializer):
    
    item_name = serializers.CharField(source='food.item_name', read_only=True)
    price = serializers.DecimalField(source='food.price', max_digits=10, decimal_places=2, read_only=True)
    image = serializers.ImageField(source='food.image', read_only=True)
    description = serializers.CharField(source='food.description', read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['food_id', 'item_name', 'price', 'image', 'description', 'added_on']