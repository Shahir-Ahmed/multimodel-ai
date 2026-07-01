"""
Validation decorators for the project.

This module contains reusable decorators that validate
function arguments before execution.
"""

from functools import wraps


def validate_provider(func):
    """
    Validate that the provider is supported.

    Supported providers:
        - gemini
        - groq
    """

    @wraps(func)
    def wrapper(provider, *args, **kwargs):
        provider = provider.lower()

        allowed = {"gemini", "groq"}

        if provider not in allowed:
            raise ValueError(
                f"Unsupported provider '{provider}'. "
                f"Choose one of {allowed}."
            )

        return func(provider, *args, **kwargs)

    return wrapper


def validate_file_extension(extensions):
    """
    Validate file extension.

    Example:
        @validate_file_extension([".pdf"])
        def load_document(path):
            ...
    """

    def decorator(func):

        @wraps(func)
        def wrapper(file_path, *args, **kwargs):

            suffix = file_path.suffix.lower()

            if suffix not in extensions:
                raise ValueError(
                    f"Unsupported file type '{suffix}'. "
                    f"Allowed: {extensions}"
                )

            return func(file_path, *args, **kwargs)

        return wrapper

    return decorator


def validate_not_empty(func):
    """
    Ensure a string argument is not empty.
    """

    @wraps(func)
    def wrapper(text, *args, **kwargs):

        if not str(text).strip():
            raise ValueError("Input cannot be empty.")

        return func(text, *args, **kwargs)

    return wrapper