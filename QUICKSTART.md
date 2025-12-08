# Quick Start Guide

## Prerequisites Checklist
- [ ] Node.js v18+ installed
- [ ] PostgreSQL installed and running
- [ ] Gmail account ready
- [ ] Gemini API key obtained

## Setup Steps (5 minutes)

### 1. Database Setup
```bash
# Create database
createdb rfp_database
```

### 2. Backend Setup
```bash
cd backend

# Install packages (already done)
# npm install

# Configure environment
nano .env
# Add your:
# - DATABASE_URL
# - EMAIL_USER & EMAIL_APP_PASSWORD
# - GEMINI_API_KEY

# Setup Prisma
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
```

### 3. Frontend Setup
```bash
cd frontend
# npm install (already done)
# .env already configured
```

### 4. Run Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 5. Access Application
Open browser: http://localhost:5173

## Testing the Complete Flow

### Step 1: Create RFP
1. Go to "RFPs" page
2. Click "Create RFP"
3. Enter natural language (example below)
4. Click "Create with AI"

**Example Input:**
```
I need to procure 20 laptops with 16GB RAM, Intel i7 processor, 
and 512GB SSD for our new office. Budget is $35,000 total. 
Need delivery within 45 days. Payment terms should be net 30, 
and we need at least 1 year warranty on all items.
```

### Step 2: Add Vendors
1. Go to "Vendors" page
2. Click "Add Vendor"
3. Add your own email as test vendor
4. Add 2-3 more vendors (can use other emails you control)

### Step 3: Send RFP
1. Open your created RFP
2. Click "Send to Vendors"
3. Select vendors
4. Click "Send RFP"

### Step 4: Reply as Vendor
1. Check your email
2. Reply to the RFP email (keep [RFP-xxx] in subject!)
3. Write proposal like:

**Example Vendor Reply:**
```
Dear Procurement Team,

We are pleased to submit our proposal for your laptop procurement request.

Pricing:
- 20 Laptops (Dell Latitude 5430, 16GB RAM, Intel i7, 512GB SSD): $1,200 each
- Total: $24,000

Delivery: We can deliver all items within 30 days of order confirmation.

Terms: Net 30 payment terms accepted. All laptops include 3-year warranty.

We look forward to working with you.

Best regards,
Tech Supply Co.
```

### Step 5: Wait for AI Processing
- Wait 30-60 seconds
- Check backend terminal logs
- You should see: "📧 New email from..."

### Step 6: View Parsed Proposal
1. Refresh the RFP detail page
2. See the automatically parsed proposal
3. View AI-generated summary and score

### Step 7: Add More Proposals
- Reply from 2-3 different vendor emails
- Each with different pricing and terms

### Step 8: Compare with AI
1. On RFP detail page
2. Click "Compare with AI"
3. See AI analysis, scores, and recommendation

## Project Structure Overview

```
backend/
├── src/
│   ├── config/          # Database, email, AI configs
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── services/        # Business logic (AI, email)
│   ├── middleware/      # Error handling, rate limiting
│   └── server.js        # Express app
└── prisma/
    ├── schema.prisma    # Database schema
    └── seed.js          # Sample data

frontend/
├── src/
│   ├── components/ui/   # shadcn components
│   ├── pages/           # React pages
│   ├── services/        # API calls
│   └── App.jsx          # Main app
└── index.html
```

## Key Files to Review

### Backend
- `src/services/aiService.js` - AI prompts and parsing logic
- `src/services/emailReceiver.js` - Email polling and processing
- `src/controllers/rfpController.js` - RFP business logic
- `prisma/schema.prisma` - Database models

### Frontend
- `src/App.jsx` - Routing and layout
- `src/pages/RFPDetailPage.jsx` - Complete RFP workflow
- `src/pages/Dashboard.jsx` - Overview page
- `src/services/rfpService.js` - API client

## Common Issues & Solutions

### Issue: Email not receiving
**Solution**: 
- Check Gmail app password is correct (16 characters, no spaces)
- Ensure reply keeps [RFP-xxx] in subject
- Check backend logs for IMAP errors
- Try manually checking email in Gmail

### Issue: AI parsing fails
**Solution**:
- Verify Gemini API key is valid
- Check if you've exceeded API quota
- Ensure proposal email has clear pricing information
- Check backend logs for detailed error

### Issue: Database connection error
**Solution**:
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in backend/.env
- Ensure database exists: `psql -l | grep rfp`
- Re-run migrations: `npm run prisma:migrate`

### Issue: Frontend can't reach backend
**Solution**:
- Verify backend is running on port 5000
- Check CORS settings in backend/src/server.js
- Verify VITE_API_URL in frontend/.env

## Demo Script for Video

### Intro (30 seconds)
- Show dashboard
- Explain the problem: manual RFP process is slow

### RFP Creation (1 minute)
- Click "Create RFP"
- Paste natural language description
- Show AI parsing it into structured format
- Highlight extracted budget, deadline, requirements

### Vendor Management (30 seconds)
- Go to Vendors page
- Show existing vendors
- Add one new vendor quickly

### Send RFP (1 minute)
- Open RFP detail
- Click "Send to Vendors"
- Select multiple vendors
- Show email being sent
- Check actual Gmail inbox

### Email Processing (1.5 minutes)
- Open email, show RFP content
- Compose vendor response with pricing
- Keep [RFP-xxx] in subject
- Send reply
- Show backend logs catching the email
- Show AI parsing the proposal
- Refresh UI, show parsed proposal appears

### AI Comparison (1.5 minutes)
- Show multiple proposals received
- Click "Compare with AI"
- Show AI-generated scores
- Show pros/cons for each vendor
- Show final recommendation

### Code Walkthrough (2-3 minutes)
- Show aiService.js prompts
- Show emailReceiver.js polling logic
- Show Prisma schema
- Show React component structure
- Highlight key architectural decisions

## Performance Notes

- Email polling: 30-second intervals (configurable)
- AI parsing: ~2-5 seconds per proposal
- Database queries: Optimized with Prisma includes
- Frontend: React Query caching reduces API calls

## Security Considerations (For Production)

⚠️ This is a demo. For production:
- Add authentication (JWT, OAuth)
- Implement rate limiting per user
- Sanitize all user inputs
- Use environment-specific configs
- Add request validation
- Implement HTTPS
- Add logging and monitoring
- Handle PII data properly
- Add email verification
- Implement CSRF protection

## Next Steps After Demo

1. Add more vendors
2. Create multiple RFPs
3. Test different proposal formats
4. Experiment with AI prompts
5. Check database content with Prisma Studio:
   ```bash
   cd backend
   npm run prisma:studio
   ```

## Support & Resources

- Prisma Docs: https://www.prisma.io/docs
- Gemini API: https://ai.google.dev/docs
- shadcn/ui: https://ui.shadcn.com
- React Query: https://tanstack.com/query

---

**You're all set! 🚀**

Start the servers and begin your demo!
