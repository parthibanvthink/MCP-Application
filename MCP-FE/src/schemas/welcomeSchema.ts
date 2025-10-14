import { ChatSchema } from "../types/schemaTypes";

export const welcomeSchema: ChatSchema = {
  id: "welcome-selection",
  message: "Welcome! How can I help you today?",
  components: [
    {
      id: "action-selection",
      type: "select",
      label: "What would you like to do?",
      required: true,
      options: [
        { value: "appointment", label: "Book an Appointment" },
        { value: "feedback", label: "Provide Feedback" },
        { value: "support", label: "Get Support" },
        { value: "info", label: "Request Information" }
      ],
      validation: {
        required: true,
        message: "Please select an option"
      }
    },
    {
      id: "submit-action",
      type: "button",
      label: "Continue",
      variant: "primary",
      action: "submit"
    }
  ]
};
