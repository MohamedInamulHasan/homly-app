# Backend Keep-Warm Strategy

Since the backend is hosted on Render's free tier, it spins down after 15 minutes of inactivity. To prevent this, we have implemented a keep-warm strategy using GitHub Actions.

## How it Works

A GitHub Action workflow defined in `.github/workflows/keep-warm.yml` runs a cron job every 14 minutes.
This job sends a simple HEAD request (`curl -I`) to your backend API endpoint:
`https://homly-backend-8616.onrender.com/api/products?limit=1`

This traffic is sufficient to signal to Render that the service is active, preventing it from sleeping.

## Configuration

If you change your backend URL in the future, you must update the URL in `.github/workflows/keep-warm.yml`.

1. Open `.github/workflows/keep-warm.yml`
2. Locate the `run` command step.
3. Update the URL to your new backend endpoint.

```yaml
run: |
  curl -I https://your-new-backend-url.com/api/products?limit=1
  echo "Ping sent to backend to prevent sleeping"
```

## Verification

To verify it is working:
1. Go to the "Actions" tab in your GitHub repository.
2. Look for the "Keep Warm" workflow.
3. Check the logs of the latest run to ensure it executed successfully.
