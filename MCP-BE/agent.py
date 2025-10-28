import os
import json
import httpx
from dotenv import load_dotenv
from openai import OpenAI
 
load_dotenv()
 
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
CAB_API_URL = os.getenv("CAB_API_URL", "http://localhost:8000/api/cab_details/")
CAB_MCP_TOKEN = os.getenv("CAB_MCP_TOKEN")
 
client = OpenAI(api_key=OPENAI_API_KEY)
 
system_prompt = """
You are a JSON-based assistant that helps manage users and cabs.
Always return a **valid JSON** response suitable for frontend schema rendering.
 
You are a helpful assistant that generates structured JSON responses in the ChatSchema format.
 
All responses must strictly be in **valid JSON** matching this structure:
 
### ✅ Response Format
 
{
  "id": "unique-id",
  "message": "Short user-facing message or instruction",
  "components": [
    {
      "id": "unique-component-id",
      "type": "form | select | button | input | text | rating | list | map | switch | date | etc.",
      "label": "Visible label for the UI element",
      "required": true | false,
      "options": [
        { "value": "string", "label": "string" }
      ],
      "children": [ ...nested components... ],
      "validation": {
        "minLength": number,
        "maxLength": number,
        "pattern": "regex-string",
        "message": "validation message"
      },
      "apiConfig": {
        "endpoint": "https://api.example.com/path",
        "method": "GET | POST | PUT | DELETE",
        "headers": { "Authorization": "Bearer token" }
      }
    }
  ]
}
 
Available tools:
 
1️⃣ get_all_cabs
    - Returns all cabs. (call cab roster backend)
    - Params: none
 
2️⃣ add_cab
    - Generates a JSON form to add a cab
      Example:
      {
        "id": "add-cab",
        "message": "Please provide cab details",
        "components": [
          {"id": "cab_model_name", "type": "input", "label": "Cab Model Name", "required": true},
          {"id": "cab_reg_name", "type": "input", "label": "Cab Registration Number", "required": true}
        ],
        "tool": "add_cab"
      }
 
Rules:
- If the query clearly requires fetching cab details → respond with {"tool": "get_all_cabs"}
- Never send plain text. Always wrap everything in valid JSON.
- Decide which tool to call based on the user's message.
- If a form is needed, generate the JSON form in this structure
- Always output a **complete JSON object** — no text outside the JSON.
- `message` should describe the purpose of the interaction.
- Use realistic labels, placeholders, and options.
- Include `apiConfig` when the UI requires data submission or retrieval.
- Do not include explanations or comments.
- Follow the examples provided below for structure consistency.
- Always return JSON in the above schema style, similar to the 'appointment' example.
- Do not provide explanations or reasoning. Only return valid JSON output.
- every response must be wrapped in a JSON object with a "message" key.
 
"""
 
async def get_cabs_from_backend():
    headers = {"Authorization": f"Bearer {CAB_MCP_TOKEN}"}
    async with httpx.AsyncClient() as client:
        resp = await client.get(CAB_API_URL, headers=headers)
        resp.raise_for_status()
        return resp.json()
 
async def handle_chat(user_input: str):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ],
        temperature=0
    )
 
    content = response.choices[0].message.content.strip()
 
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        return {"message": "Sorry, invalid response format from model."}
 
    # Step 2: If it requested a tool call — execute it
    if parsed.get("tool") == "get_all_cabs":
        cabs = await get_cabs_from_backend()
        return {
            "message": "Here are all available cabs:",
            "components": [
                {
                    "id": "list",
                    "type": "list",
                    "label": "Available Cabs",
                    "list": cabs
                }
            ],
        }
 
    return parsed