import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import chromadb
import ollama
import joblib
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# ---------------------------------------------------------------------------
# Configuration — all values driven by environment variables
# ---------------------------------------------------------------------------
CHROMA_STORE_PATH = os.getenv("CHROMA_STORE_PATH", "./chroma_store/")
CHROMA_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "capabilities")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nomic-embed-text:latest")
MODEL_PATH = os.getenv("MODEL_PATH", "./models/bid_outcome_model.pkl")
SCALER_PATH = os.getenv("SCALER_PATH", "./models/scaler.pkl")
N_RAG_RESULTS = int(os.getenv("N_RAG_RESULTS", "3"))

# ---------------------------------------------------------------------------
# RAG matching setup
# ---------------------------------------------------------------------------
chroma_client = chromadb.PersistentClient(path=CHROMA_STORE_PATH)
chroma_collection = chroma_client.get_or_create_collection(name=CHROMA_COLLECTION_NAME)


def embedding(text: str):
    response = ollama.embeddings(model=EMBEDDING_MODEL, prompt=text)
    return response["embedding"]


class MatchRequest(BaseModel):
    requirementText: str


@app.post("/match")
def match_requirement(req: MatchRequest):
    vector = embedding(req.requirementText)
    results = chroma_collection.query(query_embeddings=[vector], n_results=N_RAG_RESULTS)
    return results


# ---------------------------------------------------------------------------
# Win-probability model setup
# ---------------------------------------------------------------------------
loaded_obj = joblib.load(MODEL_PATH)

# Check if the loaded object is a dictionary containing the model/scaler combo
if isinstance(loaded_obj, dict):
    print("Detected combined model dictionary format inside .pkl")
    win_model = loaded_obj["model"]
    scaler = loaded_obj["scaler"]
    FEATURE_COLUMNS = loaded_obj.get("feature_columns")
    TARGET_CLASSES = loaded_obj.get("target_classes", [0, 1])
else:
    # Legacy fit format: load scaler separately
    print("Detected standard model pickle file format")
    win_model = loaded_obj
    scaler = joblib.load(SCALER_PATH)
    if hasattr(scaler, "feature_names_in_"):
        FEATURE_COLUMNS = list(scaler.feature_names_in_)
    else:
        raise RuntimeError(
            "Scaler does not expose feature_names_in_. "
            "Please ensure scaler was trained with Pandas DataFrame headers."
        )
    TARGET_CLASSES = list(win_model.classes_) if hasattr(win_model, "classes_") else [0, 1]

# Derive known sectors dynamically from feature columns
SECTOR_COLUMNS = [col for col in FEATURE_COLUMNS if col.lower().startswith("sector_")]
KNOWN_SECTORS = [col.split("_", 1)[1] for col in SECTOR_COLUMNS]


class BidStatsRequest(BaseModel):
    budget: float
    response_time_hrs: float
    compliance_percent: float
    doc_pages: int
    gaps_found: int
    sector: str
    submission_deadline: str = None


@app.post("/predict")
def predict_win(req: BidStatsRequest):
    # Parse month and quarter from deadline or current time
    month = 8  # fallback defaults
    quarter = 3
    
    date_str = req.submission_deadline
    if date_str:
        try:
            dt = pd.to_datetime(date_str)
            month = dt.month
            quarter = (dt.month - 1) // 3 + 1
        except Exception as e:
            print(f"Error parsing date string '{date_str}': {e}. Using current time fallback.")
            current_time = pd.Timestamp.now()
            month = current_time.month
            quarter = (current_time.month - 1) // 3 + 1
    else:
        current_time = pd.Timestamp.now()
        month = current_time.month
        quarter = (current_time.month - 1) // 3 + 1

    # Build a zero-filled DataFrame with exact columns expected by scaler
    row = pd.DataFrame(0, index=[0], columns=FEATURE_COLUMNS)

    # Dynamic fuzzy matching of input fields to any feature column header
    for col in FEATURE_COLUMNS:
        normalized_col = col.lower().replace(" ", "").replace("_", "").replace("(", "").replace(")", "").replace("%", "")
        
        if "budget" in normalized_col:
            if normalized_col.endswith("m") or "budgetm" in normalized_col:
                row.at[0, col] = req.budget / 1_000_000.0
            else:
                row.at[0, col] = req.budget
        elif "responsetime" in normalized_col:
            row.at[0, col] = req.response_time_hrs
        elif "compliance" in normalized_col:
            row.at[0, col] = req.compliance_percent
        elif "docpages" in normalized_col or "pages" in normalized_col:
            row.at[0, col] = req.doc_pages
        elif "gaps" in normalized_col:
            row.at[0, col] = req.gaps_found
        elif "month" in normalized_col:
            row.at[0, col] = month
        elif "quarter" in normalized_col:
            row.at[0, col] = quarter
        elif "sector" in normalized_col:
            # Extract sector value (e.g. from Selector_Telecom extract Telecom)
            sector_name = col.split("_", 1)[1] if "_" in col else col
            if sector_name.lower().strip() == req.sector.lower().strip():
                row.at[0, col] = 1

    # Transform values via scaler
    row_scaled = scaler.transform(row)
    prediction = win_model.predict(row_scaled)[0]
    probability = win_model.predict_proba(row_scaled)[0][1]

    # Map prediction binary back to human-readable labels inside target_classes if possible,
    # otherwise defaults.
    if isinstance(prediction, (int, float, bool)):
        prediction_idx = int(prediction)
        if 0 <= prediction_idx < len(TARGET_CLASSES):
            readable_prediction = TARGET_CLASSES[prediction_idx]
        else:
            readable_prediction = "Win" if prediction_idx == 1 else "Loss"
    else:
        readable_prediction = str(prediction)

    return {
        "prediction": readable_prediction,
        "winProbability": round(float(probability), 3),
        "knownSectors": KNOWN_SECTORS,
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "embeddingModel": EMBEDDING_MODEL,
        "featureColumns": FEATURE_COLUMNS,
        "knownSectors": KNOWN_SECTORS,
        "targetClasses": TARGET_CLASSES,
    }