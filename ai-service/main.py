from fastapi import FastAPI
from pydantic import BaseModel
import chromadb
import ollama

app = FastAPI()
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