from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import chromadb
import ollama
import joblib
import pandas as pd

app = FastAPI()

# --- RAG matching setup ---
chroma_client = chromadb.PersistentClient(path="./chroma_store/")
chroma_collection = chroma_client.get_or_create_collection(name="capabilities")

def embedding(text):
    # ollama>=0.2.0 uses embed() instead of the removed embeddings()
    response = ollama.embed(model='nomic-embed-text:latest', input=text)
    return response['embeddings'][0]

class MatchRequest(BaseModel):
    requirementText: str

@app.post("/match")
def match_requirement(req: MatchRequest):
    try:
        vector = embedding(req.requirementText)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")
    results = chroma_collection.query(query_embeddings=[vector], n_results=3)
    return results


# --- Win-probability model setup ---
win_model = joblib.load("./models/logistic_model.pkl")
scaler = joblib.load("./models/scaler.pkl")

FEATURE_COLUMNS = [
    'budget', 'response_time_(hrs)', 'compliance_%', 'doc_pages', 'gaps_found',
    'sector_Education', 'sector_Energy', 'sector_Finance', 'sector_Healthcare',
    'sector_IT Services', 'sector_Logistics', 'sector_Telecom',
]

class BidStatsRequest(BaseModel):
    budget: float
    response_time_hrs: float
    compliance_percent: float
    doc_pages: int
    gaps_found: int
    sector: str

@app.post("/predict")
def predict_win(req: BidStatsRequest):
    row = pd.DataFrame(0, index=[0], columns=FEATURE_COLUMNS)
    row["budget"] = req.budget
    row["response_time_(hrs)"] = req.response_time_hrs
    row["compliance_%"] = req.compliance_percent
    row["doc_pages"] = req.doc_pages
    row["gaps_found"] = req.gaps_found

    sector_col = f"sector_{req.sector}"
    if sector_col in row.columns:
        row[sector_col] = 1

    row_scaled = scaler.transform(row)

    prediction = win_model.predict(row_scaled)[0]
    probability = win_model.predict_proba(row_scaled)[0][1]

    return {
        "prediction": "Win" if prediction == 1 else "Loss",
        "winProbability": round(float(probability), 3),
    }