# 🤖 AI-Powered RFP Management System

An intelligent web application that automates the **Request for Proposal (RFP)** process using AI. Create RFPs from natural language, manage vendors, and automatically process & compare vendor proposals.

## 🎯 Project Overview

This system helps procurement managers streamline the RFP workflow by:
- Converting plain English into structured RFPs using AI
- Sending RFPs to vendors via email
- Automatically processing vendor proposals from email replies
- Using AI to analyze and compare proposals
- Providing intelligent recommendations for the best vendor

Built as a demonstration of modern full-stack development with AI integration.

## ✨ Key Features

- **🤖 Natural Language RFP Creation**: Type requirements in plain English; AI generates structured RFP
- **📧 Email Integration**: Send RFPs to vendors via Gmail with one click
- **🧠 AI Proposal Processing**: Automatically parses vendor email replies into structured data
- **⚖️ Intelligent Comparison**: AI analyzes all proposals and recommends the best option
- **📊 Analytics Dashboard**: Visual insights with best proposal recommendations
- **👥 Vendor Management**: Complete CRUD operations for vendor database

## 🛠 Tech Stack

**Backend**
- Node.js + Express.js
- PostgreSQL (Neon Cloud)
- Prisma ORM
- Google Gemini 2.5 Flash AI
- Gmail IMAP/SMTP (nodemailer)

**Frontend**
- React 18 + Vite
- TailwindCSS + shadcn/ui
- TanStack Query (React Query)
- React Router v6

## 📋 Prerequisites

- Node.js v20+ ([Download](https://nodejs.org/))
- Gmail account with 2FA enabled
- Google Gemini API key ([Get free key](https://aistudio.google.com/app/apikey))
- PostgreSQL database (local or [Neon](https://neon.tech) cloud)

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd AI_RFP_management_system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with your credentials
cat > .env << EOF
DATABASE_URL="your-postgres-connection-string"
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Gmail Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password
EMAIL_IMAP_HOST=imap.gmail.com
EMAIL_IMAP_PORT=993
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key
EOF

# Setup database
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5001/api" > .env
```

### 4. Run Application

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

Visit: **http://localhost:5173**

## 📧 Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account → Security
   - Under "2-Step Verification", click "App passwords"
   - Generate a password for "Mail"
   - Copy the 16-character password
3. **Update backend/.env**:
   - Set `EMAIL_USER` to your Gmail address
   - Set `EMAIL_APP_PASSWORD` to the generated app password

## 🎮 How to Use

### Create an RFP
1. Navigate to "RFPs" page
2. Click "Create RFP"
3. Type your requirements in natural language:
   ```
   I need 20 laptops with 16GB RAM and 512GB SSD.
   Budget is $50,000. Delivery needed in 30 days.
   ```
4. AI converts this into a structured RFP with title, budget, deadline, and requirements

### Send RFP to Vendors
1. Add vendors in the "Vendors" page
2. Open an RFP
3. Click "Send to Vendors" and select recipients
4. Email is sent with `[RFP-xxx]` reference in subject

### Receive Proposals
**Option 1: Automatic (Email Reply)**
- Vendors reply to the RFP email (keeping `[RFP-xxx]` in subject)
- System polls Gmail every 30 seconds
- AI automatically parses the proposal and stores in database

**Option 2: Manual Submission**
- Use the test script to submit proposals directly:
```bash
cd backend
node testProposal.js list  # List all RFPs
node testProposal.js <rfp-id> <vendor-email>
```

### View Analytics
- Navigate to "Analytics" page
- See AI-generated recommendations
- View best proposals by score and by price
- Compare delivery times and potential savings

## 📊 Sample Data

The seed script creates:
- **3 Vendors**: Tech Supply, Global Tech, OfficeMart
- **1 RFP**: Office Laptop Procurement ($50,000 budget)
- **Sample Proposals**: Each with AI-generated scores and summaries

## 🎨 Screenshots

### Dashboard
![Dashboard showing RFPs and proposals]

### RFP Creation
![Natural language RFP creation interface]

### Analytics
![AI-powered proposal comparison and recommendations]

## 🏗 Architecture

### Data Flow
1. **User Input** → Natural language description
2. **AI Processing** → Gemini parses into structured RFP
3. **Email Sending** → RFP sent to selected vendors via Gmail
4. **Email Receiving** → System polls Gmail IMAP every 30s
5. **AI Parsing** → Gemini extracts proposal details from email
6. **Storage** → Structured data saved to PostgreSQL
7. **AI Comparison** → Gemini analyzes all proposals together
8. **Recommendation** → Best proposal displayed on analytics dashboard

### Database Schema
- **RFP**: Stores structured RFP with JSON requirements
- **Vendor**: Vendor master data
- **RFPVendor**: Junction table tracking which vendors received which RFPs
- **Proposal**: Stores AI-parsed proposal data with scores

## 🤖 AI Integration

### Gemini 2.5 Flash is used for:
1. **RFP Creation**: Parsing natural language into structured JSON
2. **Email Parsing**: Extracting pricing, terms, delivery from messy emails
3. **Proposal Scoring**: Generating 0-100 scores for each proposal
4. **Comparison**: Analyzing all proposals together and providing recommendations

### Prompt Engineering
- Clear, detailed prompts with examples
- Structured JSON responses for reliability
- Context-aware analysis for comparisons

## 🧪 Testing

### Manual Proposal Submission
```bash
cd backend
node testProposal.js list  # View available RFPs
node testProposal.js <rfp-id> vendor@example.com
```

### API Testing
```bash
# Create RFP
curl -X POST http://localhost:5001/api/rfps \
  -H "Content-Type: application/json" \
  -d '{"userInput": "I need 10 monitors. Budget $5000."}'

# Get all RFPs
curl http://localhost:5001/api/rfps

# Get proposals for an RFP
curl http://localhost:5001/api/proposals/rfp/<rfp-id>
```

## 📝 API Endpoints

### RFPs
- `POST /api/rfps` - Create RFP from natural language
- `GET /api/rfps` - Get all RFPs
- `GET /api/rfps/:id` - Get single RFP
- `POST /api/rfps/:id/send` - Send RFP to vendors

### Vendors
- `POST /api/vendors` - Create vendor
- `GET /api/vendors` - Get all vendors
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### Proposals
- `GET /api/proposals/rfp/:rfpId` - Get proposals for an RFP
- `GET /api/proposals/rfp/:rfpId/compare` - AI comparison of proposals
- `POST /api/proposals/submit` - Manual proposal submission
- `POST /api/proposals/poll-emails` - Trigger email polling

### Analytics
- `GET /api/analytics/overview` - Dashboard statistics
- `GET /api/analytics/recommendations` - AI-powered recommendations

## 🎯 Key Design Decisions

1. **Email Polling vs Webhooks**: Chose IMAP polling for simplicity and Gmail compatibility
2. **Subject Line Matching**: Uses `[RFP-xxx]` pattern to link proposals to RFPs
3. **AI-First Parsing**: Relies on Gemini for flexible, robust parsing instead of rigid regex
4. **Single User**: No authentication layer to keep focus on core AI features
5. **Cloud Database**: Neon PostgreSQL for easy setup and deployment

## 🔮 Assumptions

- Single procurement manager user (no auth needed)
- Vendors reply to RFP emails with original subject line
- All amounts in USD
- Gmail used for both sending and receiving
- English language for AI processing

## ⚠️ Known Limitations

- Email polling has up to 30-second delay
- No file attachment parsing yet
- Single currency support
- Gmail-specific configuration
- No multi-user/tenant support

## 🐛 Troubleshooting

### Emails Not Being Received
- Verify Gmail app password is correct
- Check that 2FA is enabled
- Ensure `[RFP-xxx]` is in reply subject
- Check backend logs for IMAP errors

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Run `npx prisma generate` after schema changes

### AI Not Parsing Correctly
- Verify GEMINI_API_KEY is valid
- Check API quotas at [Google AI Studio](https://aistudio.google.com)
- Review backend logs for AI errors

## 🎥 Demo Video

[Link to demo video will be added here]

## 📜 License

This project is built for educational purposes.

## 👨‍💻 Development Notes

### AI Tools Used During Development
- **GitHub Copilot**: Code completion and boilerplate generation
- **Claude/ChatGPT**: Architecture decisions and prompt engineering

### What AI Helped With
- Express route structure and error handling
- React component scaffolding with shadcn/ui
- Prisma schema design
- Prompt engineering for Gemini
- Documentation structure

### Learnings
- AI excels at structured data extraction from unstructured text
- Clear, detailed prompts with examples produce better results
- Iterative prompt refinement significantly improves AI accuracy
- Email parsing is more complex than expected (Gmail format variations)

---

**Built with ❤️ using React, Node.js, and Google Gemini AI**
