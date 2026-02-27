#!/bin/bash
# GCP Initial Setup Script for CT B2C Storefront
# This script sets up the GCP project, enables APIs, creates Artifact Registry, and stores secrets

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  GCP Project Setup${NC}"
echo -e "${BLUE}  CT B2C Storefront${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get GCP Project ID
if [[ -z "$GCP_PROJECT_ID" ]]; then
    echo -e "${YELLOW}Enter your GCP Project ID:${NC}"
    read -r GCP_PROJECT_ID
    export GCP_PROJECT_ID
fi

# Set default region
GCP_REGION=${GCP_REGION:-us-central1}
ARTIFACT_REGISTRY_REPO=${ARTIFACT_REGISTRY_REPO:-ct-b2c-storefront}

echo -e "${BLUE}Configuration:${NC}"
echo -e "  Project ID: ${YELLOW}$GCP_PROJECT_ID${NC}"
echo -e "  Region: ${YELLOW}$GCP_REGION${NC}"
echo -e "  Artifact Registry: ${YELLOW}$ARTIFACT_REGISTRY_REPO${NC}"
echo ""

echo -e "${YELLOW}Continue with setup? (y/n)${NC}"
read -r CONFIRM
if [[ "$CONFIRM" != "y" ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}Step 1/5: Setting default GCP project...${NC}"
gcloud config set project "$GCP_PROJECT_ID" || {
    echo -e "${RED}Failed to set project. Make sure the project exists and you have access.${NC}"
    exit 1
}
echo -e "${GREEN}✓${NC} Project set to $GCP_PROJECT_ID"

echo ""
echo -e "${BLUE}Step 2/5: Enabling required GCP APIs...${NC}"
echo "This may take a few minutes..."

APIS=(
    "artifactregistry.googleapis.com"
    "run.googleapis.com"
    "secretmanager.googleapis.com"
    "cloudbuild.googleapis.com"
    "compute.googleapis.com"
)

for API in "${APIS[@]}"; do
    echo -e "Enabling ${YELLOW}$API${NC}..."
    gcloud services enable "$API" --quiet || {
        echo -e "${RED}Failed to enable $API${NC}"
        exit 1
    }
done
echo -e "${GREEN}✓${NC} All APIs enabled"

echo ""
echo -e "${BLUE}Step 3/5: Creating Artifact Registry repository...${NC}"

# Check if repository already exists
if gcloud artifacts repositories describe "$ARTIFACT_REGISTRY_REPO" \
    --location="$GCP_REGION" &> /dev/null; then
    echo -e "${YELLOW}Repository already exists, skipping...${NC}"
else
    gcloud artifacts repositories create "$ARTIFACT_REGISTRY_REPO" \
        --repository-format=docker \
        --location="$GCP_REGION" \
        --description="CT B2C Storefront Docker images" || {
        echo -e "${RED}Failed to create Artifact Registry repository${NC}"
        exit 1
    }
    echo -e "${GREEN}✓${NC} Artifact Registry created"
fi

# Configure Docker authentication
gcloud auth configure-docker "$GCP_REGION-docker.pkg.dev" --quiet
echo -e "${GREEN}✓${NC} Docker authentication configured"

echo ""
echo -e "${BLUE}Step 4/5: Creating Secret Manager secrets...${NC}"
echo ""
echo -e "${YELLOW}You'll need to provide values for the following secrets:${NC}"

# Function to create or update secret
create_or_update_secret() {
    local SECRET_NAME=$1
    local SECRET_DESCRIPTION=$2
    local SECRET_VALUE=$3
    
    # Check if secret exists
    if gcloud secrets describe "$SECRET_NAME" &> /dev/null; then
        echo -e "${YELLOW}Secret $SECRET_NAME already exists. Update it? (y/n)${NC}"
        read -r UPDATE
        if [[ "$UPDATE" == "y" ]]; then
            echo -n "$SECRET_VALUE" | gcloud secrets versions add "$SECRET_NAME" --data-file=-
            echo -e "${GREEN}✓${NC} Secret $SECRET_NAME updated"
        else
            echo -e "${YELLOW}⊘${NC} Skipping $SECRET_NAME"
        fi
    else
        echo -n "$SECRET_VALUE" | gcloud secrets create "$SECRET_NAME" \
            --data-file=- \
            --replication-policy="automatic"
        echo -e "${GREEN}✓${NC} Secret $SECRET_NAME created"
    fi
}

# Commercetools credentials
echo ""
echo -e "${BLUE}commercetools Configuration:${NC}"
echo -n "Enter CTP_PROJECT_KEY (e.g., c-spire-oe-demo): "
read -r CTP_PROJECT_KEY
create_or_update_secret "CT_PROJECT_KEY" "commercetools project key" "$CTP_PROJECT_KEY"

echo -n "Enter CTP_CLIENT_ID: "
read -r CTP_CLIENT_ID
create_or_update_secret "CT_CLIENT_ID" "commercetools client ID" "$CTP_CLIENT_ID"

echo -n "Enter CTP_CLIENT_SECRET: "
read -rs CTP_CLIENT_SECRET
echo ""
create_or_update_secret "CT_CLIENT_SECRET" "commercetools client secret" "$CTP_CLIENT_SECRET"

echo -n "Enter CTP_AUTH_URL (default: https://auth.us-central1.gcp.commercetools.com): "
read -r CTP_AUTH_URL
CTP_AUTH_URL=${CTP_AUTH_URL:-https://auth.us-central1.gcp.commercetools.com}
create_or_update_secret "CT_AUTH_URL" "commercetools auth URL" "$CTP_AUTH_URL"

echo -n "Enter CTP_API_URL (default: https://api.us-central1.gcp.commercetools.com): "
read -r CTP_API_URL
CTP_API_URL=${CTP_API_URL:-https://api.us-central1.gcp.commercetools.com}
create_or_update_secret "CT_API_URL" "commercetools API URL" "$CTP_API_URL"

CTP_SCOPES="manage_products manage_orders manage_customers manage_carts manage_payments view_published_products"
echo "Using default scopes: $CTP_SCOPES"
create_or_update_secret "CT_SCOPES" "commercetools API scopes" "$CTP_SCOPES"

# Redis URLs
echo ""
echo -e "${BLUE}Redis Configuration:${NC}"
echo "Enter Redis URL for STAGING (Upstash or managed Redis):"
echo -n "Format: redis://default:password@host:port: "
read -rs REDIS_URL_STAGING
echo ""
create_or_update_secret "REDIS_URL_STAGING" "Redis URL for staging" "$REDIS_URL_STAGING"

echo "Enter Redis URL for PRODUCTION:"
echo -n "Format: redis://default:password@host:port: "
read -rs REDIS_URL_PROD
echo ""
create_or_update_secret "REDIS_URL_PROD" "Redis URL for production" "$REDIS_URL_PROD"

echo ""
echo -e "${BLUE}Step 5/5: Granting Secret Manager access to Cloud Run...${NC}"

# Get project number
PROJECT_NUMBER=$(gcloud projects describe "$GCP_PROJECT_ID" --format='value(projectNumber)')
COMPUTE_SA="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
    --member="serviceAccount:$COMPUTE_SA" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet || {
    echo -e "${YELLOW}⚠${NC} Failed to grant Secret Manager access. You may need to do this manually."
}
echo -e "${GREEN}✓${NC} IAM permissions configured"

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "Your GCP project is now configured for deployment."
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Set up Redis (Upstash recommended): ${YELLOW}https://upstash.com/${NC}"
echo -e "2. Add GitHub repository secrets:"
echo -e "   - ${YELLOW}GCP_PROJECT_ID${NC}: $GCP_PROJECT_ID"
echo -e "   - ${YELLOW}GCP_SA_KEY${NC}: Service account JSON key"
echo -e "   - ${YELLOW}PROD_API_URL${NC}: Your production API URL (set after first deploy)"
echo -e "   - ${YELLOW}PROD_WEB_URL${NC}: Your production web URL (set after first deploy)"
echo ""
echo -e "3. Deploy with:"
echo -e "   ${YELLOW}./scripts/deploy-to-gcp.sh staging${NC}"
echo -e "   ${YELLOW}./scripts/deploy-to-gcp.sh production${NC}"
echo ""
echo -e "4. Or push to main branch to trigger GitHub Actions CI/CD"
echo ""
