import os
from pathlib import Path

# Load .env file if python-dotenv is installed
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
env_file = ROOT_DIR / ".env"

try:
    from dotenv import load_dotenv
    load_dotenv(env_file)
except ImportError:
    # Minimal fallback parser if dotenv package is not installed
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

class Settings:
    PROJECT_NAME: str = "NyayaDesk"
    PROJECT_SUBTITLE: str = "Legal Information and Consumer Awareness"
    VERSION: str = "1.0.0"
    ORGANIZATION: str = "NyayaDesk Legal Awareness Initiative"
    
    # Gemini AI Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    _raw_model: str = (os.getenv("GEMINI_MODEL") or "").strip()
    GEMINI_MODEL: str = _raw_model.replace("models/", "") if (_raw_model.startswith("gemini-") or _raw_model.startswith("models/gemini-")) else "gemini-3.1-flash-lite"
    
    # Administration Security Key
    ADMIN_API_KEY: str = os.getenv("ADMIN_API_KEY", "nyayadesk-admin-dev-key")
    
    # Data Paths
    DATA_DIR: Path = ROOT_DIR / "data"
    PROBLEMS_FILE: Path = DATA_DIR / "problems.json"
    RESOURCES_FILE: Path = DATA_DIR / "resources.json"
    KNOWLEDGE_BASE_FILE: Path = DATA_DIR / "knowledge_base.json"
    EVAL_DATASET_FILE: Path = DATA_DIR / "eval_dataset.json"
    
    # RAG Retrieval Configuration
    SIMILARITY_THRESHOLD: float = 0.40
    TOP_K_RETRIEVAL: int = 4
    
    # Disclaimer
    MANDATORY_DISCLAIMER: str = (
        "NyayaDesk provides general legal information for educational and awareness "
        "purposes only. It does not provide legal advice or analyse individual ongoing "
        "cases or disputes."
    )

settings = Settings()
