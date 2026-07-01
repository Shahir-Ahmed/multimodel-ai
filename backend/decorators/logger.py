import logging
from functools import wraps
from pathlib import Path
import asyncio
import inspect

def logger(func):
    """Decorator to log the execution of both sync and async functions."""
    if inspect.iscoroutinefunction(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            print(f"Executing {func.__name__}")
            result = await func(*args, **kwargs)
            print(f"Finished executing {func.__name__}")
            return result
        return wrapper
    else:
        @wraps(func)
        def wrapper(*args, **kwargs):
            print(f"Executing {func.__name__}")
            result = func(*args, **kwargs)
            print(f"Finished executing {func.__name__}")
            return result
        return wrapper