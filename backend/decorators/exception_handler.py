from functools import wraps
import asyncio
import inspect
import logging

def exception_handler(func):
    """Decorator to handle exceptions in both sync and async functions."""
    if inspect.iscoroutinefunction(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                print(f"An error occurred in {func.__name__}: {e}")
                return None
        return wrapper
    else:
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                print(f"An error occurred in {func.__name__}: {e}")
                return None
        return wrapper
