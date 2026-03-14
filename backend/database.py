"""
Database connection pool using psycopg2 + context manager helpers.
All queries use parameterised statements — no string interpolation.
"""
import psycopg2
import psycopg2.extras
from psycopg2 import OperationalError
from contextlib import contextmanager
from backend.config import settings

# Use a simple connection per-request pattern (sufficient for Supabase's
# pooler limits; swap to psycopg2.pool.ThreadedConnectionPool for higher load).
def _get_raw_conn():
    try:
        return psycopg2.connect(
            settings.DATABASE_URL,
            cursor_factory=psycopg2.extras.RealDictCursor,
            sslmode="require",
            connect_timeout=8,
        )
    except OperationalError as exc:
        # Re-raise as OperationalError so FastAPI exception handler can return
        # an actionable 503 message instead of a generic traceback.
        raise OperationalError(str(exc)) from exc


@contextmanager
def get_db():
    """Yield a connection and auto-commit or rollback."""
    conn = _get_raw_conn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
