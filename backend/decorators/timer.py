import time
from functools import wraps
import asyncio
import inspect 

def timer(func):
    """Decorator to measure execution time of both sync and async functions."""
    if inspect.iscoroutinefunction(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.perf_counter()
            result = await func(*args, **kwargs)
            end_time = time.perf_counter()
            print(f"Function {func.__name__} took {end_time - start_time:.4f} seconds to execute.")
            return result
        return wrapper
    else:
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.perf_counter()
            result = func(*args, **kwargs)
            end_time = time.perf_counter()
            print(f"Function {func.__name__} took {end_time - start_time:.4f} seconds to execute.")
            return result
        return wrapper
