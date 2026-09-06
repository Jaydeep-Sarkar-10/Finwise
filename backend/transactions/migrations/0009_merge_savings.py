# Generated manually

from django.db import migrations
from django.db.models import Sum

def merge_duplicate_savings(apps, schema_editor):
    Savings = apps.get_model('transactions', 'Savings')
    
    # Get all user IDs that have savings records
    user_ids = Savings.objects.values_list('user_id', flat=True).distinct()
    
    for user_id in user_ids:
        # Get all savings for the user ordered by created_at descending (latest first)
        user_savings = Savings.objects.filter(user_id=user_id).order_by('-created_at')
        
        count = user_savings.count()
        if count > 1:
            # Calculate total sum
            total_amount = user_savings.aggregate(total=Sum('amount'))['total']
            
            # Keep the first one (most recent)
            latest_saving = user_savings.first()
            
            # Update its amount
            latest_saving.amount = total_amount
            latest_saving.save(update_fields=['amount'])
            
            # Delete all others
            Savings.objects.filter(user_id=user_id).exclude(id=latest_saving.id).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0008_alter_budget_unique_together'),
    ]

    operations = [
        migrations.RunPython(merge_duplicate_savings),
    ]
