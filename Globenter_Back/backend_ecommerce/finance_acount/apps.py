from django.apps import AppConfig


class FinanceAcountConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "finance_acount"

    def ready(self):
        import finance_acount.signals  # noqa
