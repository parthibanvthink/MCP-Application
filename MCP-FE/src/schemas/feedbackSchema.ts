import { ChatSchema } from "../types/schemaTypes";

export const feedbackSchema: ChatSchema = {
  id: "feedback-collection",
  message: "We'd love to hear your feedback! Your input helps us improve our services.",
  components: [
    {
      id: "feedback-form",
      type: "form",
      children: [
        {
          id: "overall-rating",
          type: "rating",
          label: "Overall Experience",
          required: true,
          maxRating: 5
        },
        {
          id: "service-quality",
          type: "select",
          label: "Service Quality",
          required: true,
          options: [
            { value: "excellent", label: "Excellent" },
            { value: "good", label: "Good" },
            { value: "average", label: "Average" },
            { value: "poor", label: "Poor" }
          ]
        },
        {
          id: "recommend",
          type: "switch",
          label: "Would you recommend us to others?",
          defaultValue: false
        },
        {
          id: "feedback-text",
          type: "text",
          label: "Your Feedback",
          placeholder: "Tell us about your experience...",
          multiline: true,
          rows: 4,
          required: true,
          validation: {
            minLength: 10,
            message: "Please provide at least 10 characters of feedback"
          }
        },
        {
          id: "contact-email",
          type: "input",
          inputType: "email",
          label: "Email (for follow-up)",
          placeholder: "your.email@example.com"
        }
      ],
      apiConfig: {
        endpoint: "https://api.example.com/feedback",
        method: "POST"
      }
    }
  ]
};
