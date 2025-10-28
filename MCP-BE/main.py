# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from agent import handle_chat

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    message = body.get("message", "")
    if not message:
        return {"status": "error", "message": "Missing 'message' in request body"}
    return await handle_chat(message)
