import asyncio
import json
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os
from mcp_client import get_server_tools, call_tool

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = AsyncOpenAI(api_key=OPENAI_API_KEY)

# Path to your MCP server file
SERVER_PATH = "cab_server.py"

# System prompt that defines the agent's behavior
SYSTEM_PROMPT = """You are an intelligent assistant that helps manage a cab system and answers general questions.

## Your Capabilities:
1. **General Conversation**: Answer any general questions naturally
2. **Cab Management**: Use MCP tools to manage cabs when needed

## Available MCP Tools:
- **get_all_cabs**: Fetches all active cabs (no params)
- **add_cab**: Adds new cab (params: cab_model_name, cab_reg_name)
- **update_cab**: Updates cab (params: cab_id, cab_model_name, cab_reg_name)
- **delete_cab**: Deletes cab (params: cab_id)
- **update_cab_location**: Updates location (params: cab_id, current_lat, current_lan)
- **get_cab_location**: Gets location (params: cab_id)

## Response Format:
Always respond with valid JSON in this structure:

```json
{
  "id": "unique-id",
  "message": "User-facing message",
  "intent": "general|view_data|collect_data|execute_action",
  "tool": "tool_name or null",
  "tool_args": {"key": "value"} or null,
  "missing_fields": ["field1", "field2"] or [],
  "components": [...]
}
```

## Decision Logic:

### Intent: "general"
- For general questions unrelated to cab management
- Set tool=null, provide conversational message
- Example: "Hello" → Respond with greeting

### Intent: "view_data"
- User wants to see data (list cabs, show location, etc.)
- Set tool to appropriate get tool
- Provide tool_args if needed (e.g., cab_id)
- Leave components empty initially

### Intent: "collect_data"
- User wants to add/update but data is incomplete
- Set tool=null
- List missing_fields
- Provide form components to collect data

### Intent: "execute_action"
- All required data is available
- Set tool to appropriate action (add_cab, update_cab, delete_cab, etc.)
- Provide complete tool_args
- Ready to execute

## Validation Rules:
- cab_model_name: 2-100 characters, required
- cab_reg_name: 3-20 characters, required
- cab_id: positive integer, required for update/delete/location ops
- current_lat: float between -90 and 90
- current_lan: float between -180 and 180

## Component Types:
- **text**: Display text/results
- **form**: Collect user input
- **input**: Text input field
- **button**: Action button
- **table**: Display tabular data
- **map**: Show location on map

## Examples:

**Example 1: General question**
User: "What's the weather like?"
```json
{
  "id": "gen-001",
  "message": "I help manage cabs. I don't have weather data, but I can help you with cab-related queries!",
  "intent": "general",
  "tool": null,
  "tool_args": null,
  "missing_fields": [],
  "components": []
}
```

**Example 2: View data**
User: "Show all cabs"
```json
{
  "id": "view-001",
  "message": "Fetching all active cabs from the system",
  "intent": "view_data",
  "tool": "get_all_cabs",
  "tool_args": {},
  "missing_fields": [],
  "components": []
}
```

**Example 3: Collect data - incomplete**
User: "Add a new cab"
```json
{
  "id": "collect-001",
  "message": "I'll help you add a new cab. Please provide the required details.",
  "intent": "collect_data",
  "tool": null,
  "tool_args": null,
  "missing_fields": ["cab_model_name", "cab_reg_name"],
  "components": [
    {
      "id": "add-cab-form",
      "type": "form",
      "label": "Add New Cab",
      "children": [
        {
          "id": "cab_model_name",
          "type": "input",
          "label": "Cab Model Name",
          "placeholder": "e.g., Toyota Camry",
          "required": true,
          "validation": {
            "minLength": 2,
            "maxLength": 100,
            "message": "Model name must be 2-100 characters"
          }
        },
        {
          "id": "cab_reg_name",
          "type": "input",
          "label": "Registration Number",
          "placeholder": "e.g., TN01AB1234",
          "required": true,
          "validation": {
            "minLength": 3,
            "maxLength": 20,
            "message": "Registration must be 3-20 characters"
          }
        },
        {
          "id": "submit-btn",
          "type": "button",
          "label": "Add Cab",
          "action": "submit"
        }
      ]
    }
  ]
}
```

**Example 4: Execute action - complete data**
User: "Add cab: Toyota Camry, registration TN01AB1234"
```json
{
  "id": "exec-001",
  "message": "Adding new cab to the system",
  "intent": "execute_action",
  "tool": "add_cab",
  "tool_args": {
    "cab_model_name": "Toyota Camry",
    "cab_reg_name": "TN01AB1234"
  },
  "missing_fields": [],
  "components": []
}
```

**Example 5: Context-aware follow-up**
Previous: User saw cab list with IDs 1, 2, 3
User: "Add one more cab"
```json
{
  "id": "collect-002",
  "message": "Sure! I'll help you add another cab to the list. Please provide the details.",
  "intent": "collect_data",
  "tool": null,
  "tool_args": null,
  "missing_fields": ["cab_model_name", "cab_reg_name"],
  "components": [...]
}
```

**Example 6: Update with missing cab_id**
User: "Update the cab"
```json
{
  "id": "collect-003",
  "message": "Which cab would you like to update? Please provide the cab ID.",
  "intent": "collect_data",
  "tool": null,
  "tool_args": null,
  "missing_fields": ["cab_id"],
  "components": [
    {
      "id": "cab-id-input",
      "type": "input",
      "label": "Cab ID",
      "placeholder": "Enter cab ID",
      "required": true
    }
  ]
}
```

## Important Rules:
1. **Never invent data** - if user doesn't provide cab_id, ask for it
2. **Context matters** - use conversation history to understand references like "it", "that cab"
3. **Validate before executing** - ensure all required fields present
4. **Clear messages** - explain what you're doing and what you need
5. **Handle errors gracefully** - if tool fails, explain and offer alternatives
"""


async def get_llm_decision(user_query: str, conversation_history: list = None, form_data: dict = None):
    """
    Get decision from LLM about what to do with user query
    
    Args:
        user_query: User's input
        conversation_history: Previous conversation for context
        form_data: Any form data submitted
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Add conversation history for context
    if conversation_history:
        messages.extend(conversation_history[-6:])  # Last 3 exchanges
    
    # Build user message
    user_content = user_query
    if form_data:
        user_content += f"\n\n[Form data submitted: {json.dumps(form_data)}]"
    
    messages.append({"role": "user", "content": user_content})
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        decision = json.loads(response.choices[0].message.content)
        return decision
    
    except Exception as e:
        print(f"❌ LLM Error: {e}")
        return {
            "id": "error-001",
            "message": f"Error processing request: {str(e)}",
            "intent": "general",
            "tool": None,
            "tool_args": None,
            "missing_fields": [],
            "components": []
        }


async def execute_tool(tool_name: str, tool_args: dict):
    """Execute MCP tool and return result"""
    try:
        print(f"🔧 Executing: {tool_name}({tool_args})")
        result = await call_tool(SERVER_PATH, tool_name, tool_args)
        print(f"✅ Result: {result}")
        return result
    except Exception as e:
        print(f"❌ Tool execution error: {e}")
        raise


async def enhance_response_with_data(decision: dict, tool_result: any):
    """
    Enhance the decision with actual data from tool execution
    Uses LLM to structure the data appropriately
    """
    enhancement_prompt = f"""
Given this tool result, enhance the response with appropriate components.

Tool: {decision.get('tool')}
Result: {json.dumps(tool_result, default=str)}

Original decision: {json.dumps(decision)}

Create an enhanced response with:
1. Updated message describing the result
2. Appropriate components to display the data

For get_all_cabs: Use table component with columns
For get_cab_location: Use map component if coordinates available
For add/update/delete: Use text component showing success message

Return the complete enhanced decision JSON.
"""
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You structure data into UI components. Return valid JSON."},
                {"role": "user", "content": enhancement_prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        enhanced = json.loads(response.choices[0].message.content)
        enhanced["tool_result"] = tool_result
        return enhanced
        
    except Exception as e:
        print(f"❌ Enhancement error: {e}")
        # Fallback: basic enhancement
        decision["message"] = f"Operation completed: {tool_result}"
        decision["tool_result"] = tool_result
        decision["components"] = [{
            "id": "result",
            "type": "text",
            "value": json.dumps(tool_result, indent=2)
        }]
        return decision


async def handle_chat(user_query: str, form_data: dict = None, conversation_history: list = None):
    """
    Main chat handler - orchestrates the entire flow
    
    Args:
        user_query: User's message
        form_data: Optional form data if user submitted a form
        conversation_history: Previous messages for context
        
    Returns:
        Structured JSON response ready for frontend
    """
    if conversation_history is None:
        conversation_history = []
    
    print(f"\n{'='*60}")
    print(f"📨 User: {user_query}")
    if form_data:
        print(f"📋 Form Data: {json.dumps(form_data)}")
    print('='*60)
    
    # Step 1: Get decision from LLM
    decision = await get_llm_decision(user_query, conversation_history, form_data)
    print(f"\n🤖 LLM Decision:")
    print(json.dumps(decision, indent=2))
    
    # Step 2: Check if we need to execute a tool
    if decision.get("tool") and decision.get("intent") in ["view_data", "execute_action"]:
        try:
            # Execute the tool
            tool_result = await execute_tool(decision["tool"], decision.get("tool_args", {}))
            
            # Step 3: Enhance response with tool result
            decision = await enhance_response_with_data(decision, tool_result)
            
        except Exception as e:
            decision["message"] = f"Error executing operation: {str(e)}"
            decision["intent"] = "general"
            decision["components"] = [{
                "id": "error",
                "type": "text",
                "label": "Error",
                "value": str(e)
            }]
    
    # Step 4: Update conversation history
    conversation_history.append({"role": "user", "content": user_query})
    conversation_history.append({"role": "assistant", "content": json.dumps(decision)})
    
    print(f"\n✅ Final Response:")
    print(json.dumps(decision, indent=2, default=str))
    
    return decision, conversation_history


async def interactive_chat():
    """
    Interactive chat session for testing
    """
    print("🚀 Starting Interactive Chat Session")
    print("=" * 60)
    print("Type your queries (or 'quit' to exit)")
    print("=" * 60)
    
    conversation_history = []
    
    while True:
        user_input = input("\n👤 You: ").strip()
        
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("👋 Goodbye!")
            break
        
        if not user_input:
            continue
        
        # Check if user is providing form data (simulate)
        # Format: "FORM: {json}"
        form_data = None
        if user_input.startswith("FORM:"):
            try:
                form_data = json.loads(user_input[5:].strip())
                user_input = "Form submitted"
            except:
                print("❌ Invalid form data format")
                continue
        
        response, conversation_history = await handle_chat(
            user_input, 
            form_data, 
            conversation_history
        )
        
        print(f"\n🤖 Assistant: {response.get('message')}")
        
        if response.get("components"):
            print(f"📱 UI Components: {len(response['components'])} component(s)")


async def test_scenarios():
    """
    Test various scenarios
    """
    print("🧪 Running Test Scenarios\n")
    
    conversation_history = []
    
    scenarios = [
        ("Hello! How are you?", None),
        ("Show me all the cabs", None),
        ("I want to add a new cab", None),
        ('FORM:{"cab_model_name": "Tesla Model 3", "cab_reg_name": "TN05XY9999"}', 
         {"cab_model_name": "Tesla Model 3", "cab_reg_name": "TN05XY9999"}),
        ("Where is cab number 1?", None),
        ("Delete cab with ID 999", None),
        ("Update the location of cab 1 to 13.0827, 80.2707", None),
    ]
    
    for query, form_data in scenarios:
        if query.startswith("FORM:"):
            query = "Form submitted with data"
        
        response, conversation_history = await handle_chat(
            query,
            form_data,
            conversation_history
        )
        
        await asyncio.sleep(1)
        print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        asyncio.run(test_scenarios())
    else:
        asyncio.run(interactive_chat())