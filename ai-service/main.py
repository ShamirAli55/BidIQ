from fastapi import FastAPI
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
    response = ollama.embeddings(model='nomic-embed-text:latest', prompt=text)
    return response['embedding']

class MatchRequest(BaseModel):
    requirementText: str

@app.post("/match")
def match_requirement(req: MatchRequest):
    vector = embedding(req.requirementText)
    results = chroma_collection.query(query_embeddings=[vector], n_results=3)
    return results


# --- Win-probability model setup ---
win_model = joblib.load("./models/logistic_model.pkl")
FEATURE_COLUMNS = win_model.feature_names_in_.tolist()

class BidStatsRequest(BaseModel):
    score_percent: float
    response_time_hrs: float
    compliance_percent: float
    doc_pages: int
    gaps_found: int
    sector: str

@app.post("/predict")
def predict_win(req: BidStatsRequest):
    row = pd.DataFrame(0, index=[0], columns=FEATURE_COLUMNS)
    row["score_(%)"] = req.score_percent
    row["response_time_(hrs)"] = req.response_time_hrs
    row["compliance_%"] = req.compliance_percent
    row["doc_pages"] = req.doc_pages
    row["gaps_found"] = req.gaps_found

    sector_col = f"sector_{req.sector}"
    if sector_col in row.columns:
        row[sector_col] = 1

    prediction = win_model.predict(row)[0]
    probability = win_model.predict_proba(row)[0][1]

    return {
        "prediction": "Win" if prediction == 1 else "Loss",
        "winProbability": round(float(probability), 3),
    }
    