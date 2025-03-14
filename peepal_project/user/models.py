from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True, verbose_name="Email адрес")
    user_role = models.CharField(
        max_length=20,
        choices=(
            ('user', 'User'),
            ('moderator', 'Moderator'),
            ('admin', 'Admin'),
        ),
        default='user',
        verbose_name="Роль пользователя"
    )
    language = models.CharField(
        max_length=10,
        default='ru',
        verbose_name="Язык пользователя"
    )
    subscription = models.BooleanField(
        default=False,
        verbose_name="Согласие на рассылку"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата регистрации"
    )

    # Переопределяем связи, чтобы избежать конфликта с auth.User
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='Группы, к которым относится пользователь.',
        verbose_name='группы'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions_set',
        blank=True,
        help_text='Разрешения, принадлежащие пользователю.',
        verbose_name='разрешения пользователя'
    )

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
        db_table = "peepal_user"


