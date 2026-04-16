from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from faker import Faker
import random

from products.models import Category, Brand, Tag, Product, ProductImage


User = get_user_model()


class Command(BaseCommand):
    help = "Seed the database with fake products, categories, brands, and tags"

    def handle(self, *args, **kwargs):
        fake = Faker()

        # ---------------------------------------------------------
        # 1️⃣  Create a default user (owner)
        # ---------------------------------------------------------
        user, _ = User.objects.get_or_create(username="paiman", defaults={"email": "paiman@example.com"})
        self.stdout.write(self.style.SUCCESS(f"✅ Using owner: {user.username}"))

        # ---------------------------------------------------------
        # 2️⃣  Create Categories
        # ---------------------------------------------------------
        categories = []
        for _ in range(5):
            category, _ = Category.objects.get_or_create(
                name=fake.word().capitalize(),
                defaults={"description": fake.sentence()},
            )
            categories.append(category)
        self.stdout.write(self.style.SUCCESS("✅ Categories created."))

        # ---------------------------------------------------------
        # 3️⃣  Create Brands
        # ---------------------------------------------------------
        brands = []
        for _ in range(5):
            brand, _ = Brand.objects.get_or_create(
                name=fake.company(),
                defaults={"description": fake.text()},
            )
            brands.append(brand)
        self.stdout.write(self.style.SUCCESS("✅ Brands created."))

        # ---------------------------------------------------------
        # 4️⃣  Create Tags
        # ---------------------------------------------------------
        tags = []
        for _ in range(8):
            tag, _ = Tag.objects.get_or_create(name=fake.word().capitalize())
            tags.append(tag)
        self.stdout.write(self.style.SUCCESS("✅ Tags created."))

        # ---------------------------------------------------------
        # 5️⃣  Create Products
        # ---------------------------------------------------------
        for _ in range(20):  # number of products to create
            category = random.choice(categories)
            brand = random.choice(brands)

            product = Product.objects.create(
                name=fake.sentence(nb_words=3),
                description=fake.paragraph(),
                price=round(random.uniform(10.0, 500.0), 2),
                stock=random.randint(5, 100),
                color=random.choice(["Red", "Blue", "Green", "Black", "White"]),
                size=random.choice(["S", "M", "L", "XL"]),
                badge=random.choice(["New", "Sale", "Hot", "Limited"]),
                gender=random.choice(["male", "female", "kids", "all"]),
                brand=brand,
                category=category,
                owner=user,
                wholesale_price=round(random.uniform(5.0, 300.0), 2),
                min_order_qty=random.randint(1, 5),
                unit=random.choice(["piece", "pack", "pair"]),
                status=random.choice(["active", "inactive", "draft"]),
                featured=random.choice([True, False]),
                custom_fields={
                    "material": random.choice(["Gold", "Silver", "Plastic", "Wood"]),
                    "origin": fake.country(),
                },
            )

            # assign random tags
            product.tags.set(random.sample(tags, random.randint(1, 3)))

            # Create fake images
            for i in range(random.randint(1, 3)):
                ProductImage.objects.create(
                    product=product,
                    image=f"products/images/sample_{random.randint(1,5)}.jpg",
                    alt_text=fake.word(),
                    is_main=(i == 0),
                    order=i,
                )

        self.stdout.write(self.style.SUCCESS("🎉 20 Fake products created successfully!"))
