# 📧 Email Proposal Processing & Analytics Guide

## ✅ What's Been Implemented

### 1. **Automatic Email Processing**
- Backend polls Gmail inbox every 30 seconds
- Looks for emails with `[RFP-{id}]` in subject line
- Extracts proposal content from email body
- Uses AI to parse proposal details (price, delivery, terms)
- Stores in database with AI-generated score and summary
- **Note**: IMAP parsing has some issues with Gmail format, but manual submission works perfectly

### 2. **Manual Proposal Submission API**
Created a robust API endpoint for submitting proposals:
- **Endpoint**: `POST /api/proposals/submit`
- **Body**: `{ rfpId, vendorEmail, proposalText }`
- Parses proposal with AI
- Generates score and summary
- Stores in database
- Returns complete analysis

### 3. **Enhanced Analytics Dashboard**
Shows intelligent comparisons for each RFP:
- **🏆 Recommended Proposal** - Highest AI score (best overall value)
- **💰 Lowest Price** - Best price option
- **Statistics** - Average price, budget utilization, savings
- **Side-by-side comparison** of all proposals per RFP

## 🚀 How to Use

### Method 1: Test with Manual Submission

1. **Get RFP and Vendor Info:**
```bash
cd backend
node testProposal.js list
```

2. **Submit a Test Proposal:**
```bash
node testProposal.js <rfp-id> <vendor-email>
```

Example:
```bash
# First, get the RFP ID from the list command
node testProposal.js ceb7aba8-4e52-4513-a249-922d992ddca2 techsupply@example.com
```

3. **View Results:**
- Go to http://localhost:5173/analytics
- See the new proposal analyzed and ranked
- Check "RFP Analysis with AI Recommendations" section

### Method 2: Via Email (Gmail Reply)

1. **Send RFP to Vendor** (from UI):
   - Go to RFPs page
   - Click on an RFP
   - Click "Send to Vendors"
   - Select vendors and send

2. **Vendor Replies** (via email):
   - Reply to the email with proposal details
   - **IMPORTANT**: Keep `[RFP-{id}]` in the subject line
   - Include: price, delivery time, warranty, terms

3. **Automatic Processing**:
   - Backend polls email every 30 seconds
   - Finds reply with RFP ID in subject
   - Parses with AI
   - Stores in database
   - Generates score and summary

### Method 3: Via API (for Integration)

```bash
curl -X POST http://localhost:5001/api/proposals/submit \
  -H "Content-Type: application/json" \
  -d '{
    "rfpId": "your-rfp-id",
    "vendorEmail": "vendor@example.com",
    "proposalText": "Your proposal text here..."
  }'
```

## 📊 What the Analytics Show

For each RFP, you'll see:

### 🏆 Recommended Proposal (Best Overall)
- Vendor name
- Total price
- AI Score (/100)
- Delivery time
- **Why recommended**: Highest score based on price, delivery, terms, warranty

### 💰 Lowest Price Option
- Vendor name
- Total price
- Delivery time
- **Good if**: Budget is the primary concern

### 📈 Statistics
- Average proposal price
- Lowest proposal price
- Budget utilization percentage
- Potential savings

## 🧪 Test Workflow

### Complete Test Scenario:

1. **Start Servers** (if not running):
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

2. **View Current Data**:
   - Open http://localhost:5173/analytics
   - See 3 existing proposals with recommendations

3. **Add New Proposal**:
```bash
cd backend
node testProposal.js list  # Get RFP ID and vendor email
node testProposal.js <rfp-id> <vendor-email>
```

4. **See Live Updates**:
   - Refresh analytics page
   - New proposal appears
   - AI ranking updates
   - Best proposal might change!

5. **Compare Proposals**:
   - Go to RFPs → Click RFP
   - See all proposals listed
   - Click "Compare with AI" for detailed analysis

## 🎯 Current Status

### ✅ Working Features:
- Manual proposal submission via API
- AI parsing of proposal text
- AI scoring and recommendations  
- Analytics dashboard with best proposal selection
- Side-by-side proposal comparison
- Budget analysis and savings calculation
- Real-time updates when new proposals arrive

### ⚠️ Known Issues:
- IMAP email body retrieval has parsing issues with Gmail
- Workaround: Use manual submission API (works perfectly)
- Email sending works fine (vendors can receive RFPs)

### 📦 Sample Data:
Currently 3 proposals in database:
- **Tech Supply Co**: $28,750 (Score: 85/100) - Best warranty
- **Global Tech**: $31,700 (Score: 75/100) - Premium option
- **OfficeMart**: $27,000 (Score: 80/100) - Lowest price

AI Recommendation: Tech Supply Co (highest score)
Best Price: OfficeMart (saves $23,000 vs budget)

## 🔧 Troubleshooting

### Proposal Not Showing?
```bash
# Check if proposal was created
curl http://localhost:5001/api/proposals

# Manually trigger email poll
curl -X POST http://localhost:5001/api/proposals/poll-emails
```

### Analytics Not Updating?
- Refresh the page
- Check browser console for errors
- Verify backend is running on port 5001

### Email Not Working?
- Use manual submission API instead
- Works identically to email processing
- Same AI analysis and scoring

## 📝 Next Steps

1. Test manual proposal submission
2. View analytics dashboard
3. Compare multiple proposals
4. See AI recommendations in action
5. Test with different price points to see ranking changes

---

**Ready to test!** Run `node testProposal.js list` to get started.
