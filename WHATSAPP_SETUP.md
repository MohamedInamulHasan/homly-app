# WhatsApp Notification Setup (Free via CallMeBot)

This application uses the CallMeBot Free API to send WhatsApp notifications for new orders.

## Setup Instructions

1.  **Add CallMeBot to Contacts**:
    - Add the phone number `+34 644 66 32 62` to your phone contacts. (Name it "CallMeBot")

2.  **Get API Key**:
    - Send the following message to CallMeBot on WhatsApp:
      `I allow callmebot to send me messages`

3.  **Wait for Response**:
    - The bot will reply with your **API Key**.

4.  **Configure Backend**:
    - Open your `.env` file in the `backend` folder.
    - Add/Update the following variables:

    ```env
    # Your phone number in international format (e.g., 919876543210 for India)
    WHATSAPP_PHONE_NUMBER=919876543210

    # The API Key you received from CallMeBot
    WHATSAPP_API_KEY=123456
    ```

5.  **Restart Backend**:
    - Restart your backend server (`npm start` or via Render dashboard) to apply changes.

## Troubleshooting
- If you don't receive the API key, try sending the message again after a few minutes.
- Ensure the phone number in `.env` matches the WhatsApp number you used to get the key.
- **Bot Not Replying?**: The CallMeBot service can sometimes be slow. If you see blue ticks but no reply, wait 1-2 hours or try sending the command `apikey` again later.

## Testing Your Setup

You can test the WhatsApp notification without placing an order:

1.  Open a terminal in the `backend` folder.
2.  Run the test script:
    ```bash
    node debug-whatsapp.js
    ```
3.  If successful, you will receive a test message on WhatsApp.
