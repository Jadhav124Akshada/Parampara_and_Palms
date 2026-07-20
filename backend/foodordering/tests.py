from django.test import TestCase
from .models import category


class CategoryDeleteApiTests(TestCase):
    def test_delete_category_endpoint_removes_the_category(self):
        category_obj = category.objects.create(category_name='Test Category')

        response = self.client.delete(f'/api/category/{category_obj.id}/')

        self.assertEqual(response.status_code, 200)
        self.assertFalse(category.objects.filter(id=category_obj.id).exists())
