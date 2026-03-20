# Telegram Notification Setup (100% Free & Reliable)

This method uses a custom Telegram Bot. It is free, instant, and very reliable.

## Step 1: Create Your Bot
1.  Open Telegram app.
2.  Search for **`@BotFather`** (the official bot builder).
3.  Click **Start** (or type `/start`).
4.  Send the command: `/newbot`
5.  Follow the prompts:
    *   **Name**: Call it something like `Homly Admin Alerts`.
    *   **Username**: Must end in `bot` (e.g., `HomlyAlertsCheck123Bot`).
6.  BotFather will give you a **Token** (looks like `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`).
    *   **Copy this Token.**

## Step 2: Get Your Chat ID
1.  Search for **`@userinfobot`** in Telegram.
2.  Click **Start**.
3.  It will reply with your details. Copy the **Id`** (a number like `123456789`).

## Step 3: Configure Backend
1.  Open your backend `.env` file.
2.  Add/Update these lines:
    ```env
    TELEGRAM_BOT_TOKEN=paste_your_token_here
    TELEGRAM_CHAT_ID=paste_your_chat_id_here
    ```

## Step 4: Start Your Bot
1.  Search for **your bot's username** (the one you created in Step 1).
2.  Click **Start**. (IMPORTANT: You must start the conversation or the bot can't message you).
