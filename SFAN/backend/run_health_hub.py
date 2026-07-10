import uvicorn
import logging
from backend.main import app
from backend.api import health_verification_hub_api

# Attach the isolated Health Verification Hub module to the existing app dynamically
app.include_router(health_verification_hub_api.router)

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("Starting SFAN Backend with Isolated Health Verification Hub Module")
    uvicorn.run(app, host="127.0.0.1", port=8000)
