from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json

# Import your agent
from agent import handle_chat

app = FastAPI(title="Cab Management AI Assistant API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    form_data: Optional[Dict[str, Any]] = None
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    id: str
    message: str
    intent: str
    tool: Optional[str]
    tool_args: Optional[Dict[str, Any]]
    missing_fields: List[str]
    components: List[Dict[str, Any]]
    tool_result: Optional[Any] = None
    conversation_id: str

# In-memory conversation storage (use Redis in production)
conversations = {}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint - handles user queries and returns structured responses
    
    Example requests:
    
    1. General query:
    {
        "message": "Hello, how are you?"
    }
    
    2. View data:
    {
        "message": "Show me all cabs"
    }
    
    3. Add cab - initial request:
    {
        "message": "I want to add a new cab"
    }
    
    4. Add cab - with form data:
    {
        "message": "Add the cab",
        "form_data": {
            "cab_model_name": "Toyota Camry",
            "cab_reg_name": "TN01AB1234"
        }
    }
    
    5. Contextual follow-up:
    {
        "message": "Add one more",
        "conversation_id": "conv-123"
    }
    """
    try:
        # Get or create conversation history
        conversation_id = request.conversation_id or f"conv-{len(conversations)}"
        conversation_history = conversations.get(conversation_id, [])
        
        # Process the chat
        response, updated_history = await handle_chat(
            user_query=request.message,
            form_data=request.form_data,
            conversation_history=conversation_history
        )
        
        # Store updated conversation
        conversations[conversation_id] = updated_history[-20:]  # Keep last 20 messages
        
        # Add conversation_id to response
        response["conversation_id"] = conversation_id
        
        return response
    
    except Exception as e:
        print(f"❌ Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/conversation/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """Clear a conversation history"""
    if conversation_id in conversations:
        del conversations[conversation_id]
        return {"message": "Conversation cleared", "conversation_id": conversation_id}
    return {"message": "Conversation not found", "conversation_id": conversation_id}


@app.get("/")
async def root():
    """API health check"""
    return {
        "status": "running",
        "service": "Cab Management AI Assistant",
        "endpoints": {
            "chat": "POST /chat",
            "clear": "DELETE /conversation/{id}",
            "docs": "GET /docs"
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)