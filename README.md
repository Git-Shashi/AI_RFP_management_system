# AI-Powered RFP Management System

An intelligent procurement management system that uses AI to streamline the RFP (Request for Proposal) workflow - from creation to vendor comparison.

## 🚀 Features

- **AI-Powered RFP Creation**: Describe your procurement needs in natural language, and AI structures it into a complete RFP
- **Vendor Management**: Maintain a database of vendors with contact information
- **Automated Email Distribution**: Send RFPs to selected vendors via email
- **Intelligent Email Parsing**: Automatically receive and parse vendor proposals from emails using AI
- **AI-Powered Comparison**: Compare multiple proposals with AI-generated insights, scores, and recommendations
- **Real-time Dashboard**: Track all RFPs, vendors, and proposals in one place

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **TanStack Query (React Query)** - Server state management
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **shadcn/ui** - UI components (built on Radix UI)
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Backend
- **Node.js** with **Express** - Server framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **Nodemailer** - Email sending (SMTP)
- **imap-simple** - Email receiving (IMAP)
- **Google Gemini 2.0 Flash** - AI/LLM integration
- **Helmet** - Security middleware
- **express-rate-limit** - Rate limiting

## 📋 Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **Gmail account** (for email sending/receiving)
- **Google Gemini API key** (free at https://makersuite.google.com/app/apikey)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd AI_RFP_management_system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Configuration below)

# Setup database
createdb rfp_database  # Create PostgreSQL database

# Run Prisma migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Seed database with sample data
npm run prisma:seed
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env if needed (default: http://localhost:5000/api)
```

## ⚙️ Environment Configuration

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/rfp_database?schema=public"

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-specific-password
EMAIL_IMAP_HOST=imap.gmail.com
EMAIL_IMAP_PORT=993
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-here
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## 📧 Email Configuration Guide

### Gmail Setup (Recommended for Demo)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account → Security
   - Under "2-Step Verification", find "App passwords"
   - Generate a new app password for "Mail"
   - Copy the 16-character password
3. **Update .env**:
   - Set `EMAIL_USER` to your Gmail address
   - Set `EMAIL_APP_PASSWORD` to the generated app password

### How Email Receiving Works

- The backend polls your Gmail inbox every **30 seconds**
- It looks for emails with `[RFP-{id}]` in the subject line
- When found, it:
  1. Extracts the RFP ID
  2. Identifies the vendor by email
  3. Uses AI (Gemini) to parse the proposal
  4. Stores structured data in the database
  5. Generates an AI summary and score

### Testing Email Flow

1. Create an RFP in the system
2. Send it to a vendor (can be your own email)
3. Reply to that email with proposal details (keep `[RFP-xxx]` in subject)
4. Wait up to 30 seconds
5. Check the backend logs and refresh the RFP detail page

## 🏃 Running the Application

### Development Mode

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Server runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:5173

## 📚 API Documentation

### Base URL
`http://localhost:5000/api`

### Endpoints

#### RFPs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/rfps` | Create RFP from natural language |
| GET | `/rfps` | Get all RFPs |
| GET | `/rfps/:id` | Get single RFP |
| PUT | `/rfps/:id` | Update RFP |
| DELETE | `/rfps/:id` | Delete RFP |
| POST | `/rfps/:id/send` | Send RFP to vendors |

**Example: Create RFP**
```json
POST /api/rfps
{
  "userInput": "I need 20 laptops with 16GB RAM and 15 monitors. Budget $50,000. Delivery in 30 days."
}

Response:
{
  "success": true,
  "rfp": {
    "id": "uuid",
    "title": "Laptop and Monitor Procurement",
    "budget": 50000,
    "deadline": "2025-01-07"
  }
}
```

#### Vendors

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/vendors` | Create vendor |
| GET | `/vendors` | Get all vendors |
| GET | `/vendors/:id` | Get single vendor |
| PUT | `/vendors/:id` | Update vendor |
| DELETE | `/vendors/:id` | Delete vendor |

#### Proposals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/proposals` | Get all proposals |
| GET | `/proposals/rfp/:rfpId` | Get proposals for an RFP |
| GET | `/proposals/rfp/:rfpId/compare` | AI comparison of proposals |

## 🎯 Key Design Decisions

### 1. Database Schema
- **RFP**: Stores structured RFP data with JSON requirements field
- **Vendor**: Simple vendor master with contact info
- **RFPVendor**: Junction table tracking which vendors received which RFPs
- **Proposal**: Stores both raw email content and AI-parsed structured data

### 2. AI Integration Strategy
- **RFP Creation**: Gemini parses natural language into structured JSON
- **Email Parsing**: Gemini extracts pricing, terms, delivery info from messy emails
- **Proposal Scoring**: Individual AI-generated scores (0-100) for each proposal
- **Comparison**: Gemini analyzes all proposals together and provides recommendation

### 3. Email Architecture
- **IMAP Polling**: Simple, reliable, no webhooks needed
- **Subject Line Matching**: Uses `[RFP-{id}]` pattern for correlation
- **Vendor Identification**: Matches email sender to vendor database

## 🤖 AI Tools Used During Development

### Tools Used
- **GitHub Copilot**: Code completion and boilerplate generation
- **Claude/ChatGPT**: Architecture decisions, API design, prompt engineering

### What They Helped With
- **Boilerplate**: Express routes, React components, Prisma schema
- **Prompt Engineering**: Crafting effective prompts for Gemini
- **UI Components**: shadcn component integration
- **Documentation**: README structure

### Learnings
- AI excels at structured data extraction from unstructured text
- Clear, detailed prompts with examples produce better results
- Iterative prompt refinement is essential

## 🔮 Assumptions Made

1. **Single User**: No authentication/authorization needed
2. **Email Format**: Vendors keep `[RFP-xxx]` in subject when replying
3. **Gmail**: Using Gmail for both sending and receiving
4. **Polling**: 30-second intervals sufficient for demo
5. **Currency**: All amounts in USD

## ⚠️ Known Limitations

1. Email polling delay (up to 30 seconds)
2. No attachment parsing yet
3. Single currency support
4. Basic AI scoring (subjective)

## 📝 Seed Data

Run: `npm run prisma:seed`

Creates:
- 3 Sample Vendors
- 1 Sample RFP ($50,000 laptop/monitor procurement)

## 🐛 Troubleshooting

### Email Not Receiving
- Check Gmail app password
- Ensure 2FA enabled
- Verify `[RFP-xxx]` in subject

### Database Connection
- Verify PostgreSQL running
- Check DATABASE_URL
- Run migrations

---

**Note**: Demonstration project for educational purposes.
