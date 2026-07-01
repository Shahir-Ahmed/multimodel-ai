from functools import wraps
import asyncio
import time
import inspect

def retry(_func=None, *, retries=3, delay=1):
    """Decorator to retry functions on failure.

    Can be used as:
        @retry          – uses default retries=3, delay=1
        @retry()        – same as above
        @retry(retries=5, delay=2)  – custom values
    """
    def decorator(func):
        if inspect.iscoroutinefunction(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                for attempt in range(1, retries + 1):
                    try:
                        return await func(*args, **kwargs)
                    except Exception as e:
                        print(f"Attempt {attempt} failed with error: {e}")
                        if attempt < retries:
                            print(f"Retrying in {delay} seconds...")
                            await asyncio.sleep(delay)
                        else:
                            print(f"All {retries} attempts failed.")
                            raise
            return wrapper
        else:
            @wraps(func)
            def wrapper(*args, **kwargs):
                for attempt in range(1, retries + 1):
                    try:
                        return func(*args, **kwargs)
                    except Exception as e:
                        print(f"Attempt {attempt} failed with error: {e}")
                        if attempt < retries:
                            print(f"Retrying in {delay} seconds...")
                            time.sleep(delay)
                        else:
                            print(f"All {retries} attempts failed.")
                            raise
            return wrapper

    # Support both @retry and @retry(...) usage
    if _func is not None:
        return decorator(_func)
    return decorator
