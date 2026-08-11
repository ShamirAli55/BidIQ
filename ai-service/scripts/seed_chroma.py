import os
import csv
import chromadb
import ollama
from dotenv import load_dotenv

load_dotenv()

CHROMA_STORE_PATH = os.getenv("CHROMA_STORE_PATH", "./chroma_store/")
CHROMA_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "capabilities")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nomic-embed-text:latest")
# Path to the CSV from the ai-service directory
CSV_PATH = os.getenv("CAPABILITY_CSV_PATH", "../backend/src/data/Capability_Library.csv")

chroma_client = chromadb.PersistentClient(path=CHROMA_STORE_PATH)

# Delete and recreate collection to ensure a clean re-seed
try:
    chroma_client.delete_collection(name=CHROMA_COLLECTION_NAME)
    print(f"Deleted existing collection: {CHROMA_COLLECTION_NAME}")
except Exception:
    pass

chroma_collection = chroma_client.create_collection(name=CHROMA_COLLECTION_NAME)


def embedding(text: str):
    response = ollama.embeddings(model=EMBEDDING_MODEL, prompt=text)
    return response["embedding"]


def build_chunk_text(row: dict) -> str:
    """Convert a bid history row into a rich natural-language chunk for embedding."""
    return (
        f"Bid {row['Bid ID']} | Client: {row['Client']} | Sector: {row['Sector']} | "
        f"Budget: {row['Budget']} ({row['Budget_M']}M PKR) | "
        f"Outcome: {row['Outcome']} | Score: {row['Score (%)']}% | "
        f"Compliance: {row['Compliance %']}% | Gaps Found: {row['Gaps Found']} | "
        f"Response Time: {row['Response Time (hrs)']} hrs | Doc Pages: {row['Doc Pages']} | "
        f"Submission: {row['Submission Date']} | Bid Manager: {row['Bid Manager']}"
    )


# Read CSV
rows = []
with open(CSV_PATH, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)

print(f"Loaded {len(rows)} records from CSV. Generating embeddings...")

ids = []
texts = []
embeddings = []
metadatas = []

for row in rows:
    bid_id = row["Bid ID"].strip()
    chunk = build_chunk_text(row)

    vec = embedding(chunk)

    ids.append(bid_id)
    texts.append(chunk)
    embeddings.append(vec)
    metadatas.append({
        "sector": row["Sector"].strip(),
        "outcome": row["Outcome"].strip(),
        "client": row["Client"].strip(),
        "compliance": row["Compliance %"].strip(),
        "score": row["Score (%)"].strip(),
    })

    print(f"  Embedded {bid_id}")

# Batch upsert into ChromaDB
chroma_collection.add(
    ids=ids,
    documents=texts,
    embeddings=embeddings,
    metadatas=metadatas,
)

print(f"\n✅ Stored {chroma_collection.count()} bid records in ChromaDB collection '{CHROMA_COLLECTION_NAME}'")

# Sanity-check query
print("\n🔍 Running sanity-check query...")
query_text = "IT services compliance government sector high score win"
query_vector = embedding(query_text)
results = chroma_collection.query(query_embeddings=[query_vector], n_results=3)
for doc in results["documents"][0]:
    print(f"  → {doc[:120]}...")