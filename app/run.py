import sys
from pathlib import Path
import uvicorn

# Ensure the parent directory is in sys.path so 'app' is recognized as a package
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True, app_dir=str(ROOT_DIR))
