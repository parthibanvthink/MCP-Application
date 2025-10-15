import json
import openai
from mcp.server.fastmcp import FastMCP
 
 
openai.api_key = ""
 
mcp = FastMCP("Demo")
 
# agent.py
try:
    from mcp.server.fastmcp import FastMCP
except ModuleNotFoundError:
    # Mock for local dev
    class FastMCP:
        def __init__(self, *args, **kwargs):
            print("FastMCP mock initialized")
 
        def send(self, data):
            print("Mock send:", data)
 
        def receive(self):
            return {"message": "This is a mock response"}
 
 
@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b
 
 
# Add a dynamic greeting resource
@mcp.resource("greeting://{name}")
def get_greeting(name: str) -> str:
    """Get a personalized greeting"""
    return f"Hello, {name}!"
 
 
# Add a prompt
@mcp.prompt()
def greet_user(name: str, style: str = "friendly") -> str:
    """Generate a greeting prompt"""
    styles = {
        "friendly": "Please write a warm, friendly greeting",
        "formal": "Please write a formal, professional greeting",
        "casual": "Please write a casual, relaxed greeting",
    }
 
    return f"{styles.get(style, styles['friendly'])} for someone named {name}."
 
 
# ===== DB Session =====
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
 
# ===== SYSTEM INSTRUCTION =====
system_instruction = """
You are a user management assistant. Always respond in JSON format suitable for UI rendering. Never respond in plain text.
 
Available tools:
 
1. create_user_form
   - Returns a JSON form schema to create a new user.
   - No inputs required.
   - Output: JSON form with fields: full_name, email, phone.
 
2. create_user
   - Creates a user in the database.
   - Inputs: full_name (string), email (string), phone (string)
   - Output: JSON with status and created user details.
 
3. list_users
   - Lists all users.
   - No inputs required.
   - Output: JSON with status and array of users.
 
4. update_user
   - Updates a user.
   - Inputs: user_id (int), full_name (optional), email (optional), phone (optional)
   - Output: JSON with status and updated user details.
 
5. delete_user
   - Deletes a user.
   - Inputs: user_id (int)
   - Output: JSON with status and message.
 
Rules:
- Decide which tool to call based on the user's message.
- If a form is needed, generate the JSON form in this structure:
 
{
    "id": "<interaction-id>",
    "message": "<message to user>",
    "components": [
        {
            "id": "<form-id>",
            "type": "form",
            "children": [
                {
                    "id": "<field-id>",
                    "type": "input",
                    "inputType": "<text/email/tel/date>",
                    "label": "<Field Label>",
                    "placeholder": "<placeholder text>",
                    "required": true/false,
                    "validation": {
                        "minLength": <number>,
                        "pattern": "<regex>",
                        "message": "<validation message>"
                    }
                },
                ...
            ],
            "apiConfig": {
                "endpoint": "<API endpoint>",
                "method": "POST",
                "headers": {"Authorization": "Bearer <token>"}
            }
        }
    ]
}
- Always return JSON in the above schema style, similar to the 'appointment' example.
- Do not provide explanations or reasoning. Only return valid JSON output.
- If input is JSON like {"action-choice": "create_user", "full_name": "John Doe", "email": "john@example.com", "phone": "1234567890"}, call the appropriate tool with these params.
- If input is plain text like "I want to create a user", generate the JSON form for user creation.
"""
 
 
# ===== INITIALIZE AGENT =====
# user_agent = create_agent(name="user_crud_agent", system_prompt=system_instruction)
 
 
# # ===== TOOLS =====
# @user_agent.tool
# def create_user_form():
#     """Return JSON form for user creation"""
#     form_schema = {
#         "id": "user-create-form",
#         "message": "Please fill out user details:",
#         "components": [
#             {
#                 "id": "user-form",
#                 "type": "form",
#                 "children": [
#                     {"id": "full-name", "type": "input", "label": "Full Name", "required": True},
#                     {"id": "email", "type": "input", "label": "Email Address", "required": True},
#                     {"id": "phone", "type": "input", "label": "Phone Number", "required": True},
#                 ],
#                 "apiConfig": {
#                     "endpoint": "/submit_create_user",
#                     "method": "POST",
#                     "headers": {"Content-Type": "application/json"}
#                 }
#             }
#         ]
#     }
#     return json.dumps(form_schema, indent=2)
 
# @user_agent.tool
# def create_user(full_name: str, email: str, phone: str):
#     db = next(get_db())
#     user = User(full_name=full_name, email=email, phone=phone)
#     db.add(user)
#     db.commit()
#     db.refresh(user)
#     return json.dumps({"status": "success", "user": user.as_dict()})
 
# @user_agent.tool
# def list_users():
#     db = next(get_db())
#     users = db.query(User).all()
#     return json.dumps({"status": "success", "users": [u.as_dict() for u in users]})
 
# @user_agent.tool
# def update_user(user_id: int, full_name: str = None, email: str = None, phone: str = None):
#     db = next(get_db())
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         return json.dumps({"status": "error", "message": "User not found"})
#     if full_name: user.full_name = full_name
#     if email: user.email = email
#     if phone: user.phone = phone
#     db.commit()
#     return json.dumps({"status": "success", "message": "User updated", "user": user.as_dict()})
 
# @user_agent.tool
# def delete_user(user_id: int):
#     db = next(get_db())
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         return json.dumps({"status": "error", "message": "User not found"})
#     db.delete(user)
#     db.commit()
#     return json.dumps({"status": "success", "message": f"User deleted {user_id}"})
 
# ===== HANDLER =====
import json
import openai
 
def handle_chat(message):
    # Ensure the input to OpenAI is always a string
    if isinstance(message, dict):
        user_input = json.dumps(message)  # convert dict to JSON string
    else:
        user_input = str(message)
 
    try:
        # Call OpenAI ChatCompletion
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_input}
            ],
            temperature=0
        )
 
        # Get the assistant message
        content = response.choices[0].message.content
 
        # Convert response string to Python dict
        form_json = json.loads(content)
    except json.JSONDecodeError:
        # If assistant response is not valid JSON, return as a simple message
        form_json = {"message": content}
 
    return form_json