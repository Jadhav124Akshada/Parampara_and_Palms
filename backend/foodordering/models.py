from django.db import models

# Create your models here.
class User(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=254, unique=True)
    mobile_number = models.CharField(max_length=15, unique=True)
    password = models.CharField(max_length=100)
    reg_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class category(models.Model):
    category_name = models.CharField(max_length=100)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.category_name
    
class food(models.Model):
    item_name = models.CharField(max_length=100)
    category = models.ForeignKey(category, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(max_length=500,null=True, blank=True)
    image = models.ImageField(upload_to='food_images/')
    quantity = models.CharField(max_length=100)
    is_available = models.BooleanField(default=True)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.item_name} - {self.quantity}"
    
class cart(models.Model):
    item_name = models.CharField(max_length=100)
    User = models.ForeignKey(User, on_delete=models.CASCADE)
    food = models.ForeignKey(food, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    is_order_placed = models.BooleanField(default=False)
    order_number = models.CharField(max_length=100,null=True)
    added_on = models.DateTimeField(auto_now_add=True, null=True)
    def __str__(self):
        return f"{self.order_number} - {self.User}"
  

class OrderAddress(models.Model):
    User = models.ForeignKey(User, on_delete=models.CASCADE)
    order_number = models.CharField(max_length=100,null=True)
    address = models.TextField()
    order_time = models.DateTimeField(auto_now_add=True)
    order_final_status = models.CharField(max_length=200,null=True)
    def __str__(self):
        return f"{self.order_number} - {self.User}"
    
class FoodTracking(models.Model):
    User = models.ForeignKey(User, on_delete=models.CASCADE)
    order_number = models.CharField(max_length=100, null=True)
    remark = models.CharField(max_length=200,null=True)
    status = models.CharField(max_length=200,null=True)
    status_date = models.DateTimeField(auto_now_add=True)
    order_cancelled_by_user= models.BooleanField(null=True)
    def __str__(self):
        return f"{self.order} - {self.status}"  
    
class PaymentDetail(models.Model):
    PAYMENT_CHOICES = [
        ('COD','Cash on Delivery'),
        ('online','Online Payment')
    ]
    User = models.ForeignKey(User, on_delete=models.CASCADE)
    order_number = models.CharField(max_length=100,null=True)
    payment_mode= models.CharField(max_length=20,null=True)
    card_number = models.CharField(max_length=200,null=True,blank=True)
    expiry_date = models.CharField(max_length=10,null=True,blank=True)
    cvv = models.CharField(max_length=5,null=True,blank=True)
    paymnet_date= models.DateField(auto_now_add=True)
    def __str__(self):
        return f"{self.order_number} - {self.payment_mode}"
    
  

class Review (models.Model):
    User = models.ForeignKey(User, on_delete=models.CASCADE)
    food = models.ForeignKey(food, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(default=1)
    comment = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Review by {self.User.first_name} for {self.food.item_name} - {self.rating} stars"
    

class Wishlist (models.Model):
    User = models.ForeignKey(User, on_delete=models.CASCADE)
    food = models.ForeignKey(food, on_delete=models.CASCADE)
    added_on = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('User','food')
    def __str__(self):
        return f"Review by {self.User.first_name} - {self.food.item_name} " 