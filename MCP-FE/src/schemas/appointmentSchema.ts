import { ChatSchema } from "../types/schemaTypes";

export const appointmentSchema: ChatSchema = {
  id: "appointment-booking",
  message: "Great! Let me help you book an appointment. Please fill out the details below:",
  components: [
    {
      id: "appointment-form",
      type: "form",
      children: [
        {
          id: "full-name",
          type: "input",
          inputType: "text",
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true,
          validation: {
            minLength: 2,
            message: "Name must be at least 2 characters"
          }
        },
        {
          id: "email",
          type: "input",
          inputType: "email",
          label: "Email Address",
          placeholder: "your.email@example.com",
          required: true,
          validation: {
            pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            message: "Please enter a valid email address"
          }
        },
        {
          id: "phone",
          type: "input",
          inputType: "tel",
          label: "Phone Number",
          placeholder: "+1 (555) 000-0000",
          required: true,
          validation: {
            minLength: 10,
            message: "Please enter a valid phone number"
          }
        },
        {
          id: "appointment-date",
          type: "date",
          dateType: "datetime",
          label: "Preferred Date & Time",
          required: true
        },
        {
          id: "service-type",
          type: "select",
          label: "Service Type",
          required: true,
          options: [
            { value: "consultation", label: "Consultation" },
            { value: "follow-up", label: "Follow-up" },
            { value: "procedure", label: "Procedure" },
            { value: "emergency", label: "Emergency" }
          ]
        },
        {
          id: "location",
          type: "map",
          label: "Preferred Location (Optional)",
          placeholder: "Select location on map"
        },
        {
          id: "notifications",
          type: "switch",
          label: "Send SMS Notifications",
          defaultValue: true
        },
        {
          id: "notes",
          type: "text",
          label: "Additional Notes",
          placeholder: "Any special requirements or notes...",
          multiline: true,
          rows: 3
        }
      ],
      apiConfig: {
        endpoint: "https://api.example.com/appointments",
        method: "POST",
        headers: { "Authorization": "Bearer token123" }
      }
    }
  ]
};
