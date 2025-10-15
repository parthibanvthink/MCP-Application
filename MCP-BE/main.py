from fastapi import FastAPI, Request
from agent import handle_chat
from fastapi.middleware.cors import CORSMiddleware
 
# Create tables
 
app = FastAPI()
 
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173/",
    "*",
]
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # allow specific frontend URL(s)
    allow_credentials=True,
    allow_methods=["*"],     # allow all methods (GET, POST, etc.)
    allow_headers=["*"],     # allow all headers
)
# Chat endpoint
@app.post("/chat")
async def chat(req: Request):
    data = await req.json()
    message = data.get("message", "")
    response = handle_chat(message)
    return response