from django.core.management.base import BaseCommand
from transactions.models import Category


DEFAULT_CATEGORIES = [
    ("Food", "utensils"),
    ("Transport", "car"),
    ("Shopping", "shopping-bag"),
    ("Sports & Fitness", "dumbbell"),
    ("Entertainment", "film"),
    ("Bills", "receipt"),
    ("Health", "heart"),
    ("Education", "graduation-cap"),
    ("Travel", "plane"),
    ("Other", "circle"),
]


class Command(BaseCommand):
    help = "Create Finwise default categories"

    def handle(self, *args, **options):
        for name, icon in DEFAULT_CATEGORIES:
            category, created = Category.objects.get_or_create(
                name=name,
                user=None,
                defaults={"icon": icon},
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Created category: {name}")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"Already exists: {name}")
                )

        self.stdout.write(
            self.style.SUCCESS("Default categories setup completed!")
        )