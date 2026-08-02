import pymongo
from dotenv import load_dotenv
import os
import chromadb
import ollama

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

mongo_client = pymongo.MongoClient(MONGO_URI)  
db = mongo_client["bidiq"]
mongo_collection = db["capabilities"] 

chroma_client = chromadb.PersistentClient(path="../chroma_store/")
chroma_collection = chroma_client.get_or_create_collection(name="capabilities") 


def embedding(text):
    response = ollama.embeddings(model='nomic-embed-text:latest', prompt=text)
    return response['embedding']


def add_docs_to_db(ids, texts):
    embeddings = []
    metadatas = []

    for text in texts:
        vector = embedding(text)
        embeddings.append(vector)
        metadatas.append({"source": "capability_library", "char_length": len(text)})

    chroma_collection.add(
        documents=texts,
        embeddings=embeddings,
        ids=ids,
        metadatas=metadatas
    )


ids = []
texts = []

for q in mongo_collection.find({}):
    ids.append(q['capId'])
    texts.append(f"{q['domain']} — {q['projectSummary']} — {q['certification']}")

add_docs_to_db(ids, texts)
mongo_client.close()

print(f"Stored {chroma_collection.count()} capability records in Chroma")

# query
query_text = "experience with government cybersecurity infrastructure"
query_vector = embedding(query_text)

results = chroma_collection.query(
    query_embeddings=[query_vector],
    n_results=3
)
print(results)