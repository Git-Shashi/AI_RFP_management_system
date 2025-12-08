const { model } = require('../config/ai');

// Parse natural language RFP description into structured format
async function parseRFPFromText(userInput) {
  try {
    const prompt = `You are an expert procurement assistant. Parse the following natural language RFP request into a structured JSON format.

User Request: "${userInput}"

Extract and return ONLY valid JSON with this exact structure (no markdown, no code blocks, just JSON):
{
  "title": "Brief title for this RFP",
  "description": "Full description of what needs to be procured",
  "budget": <number>,
  "deadline": "YYYY-MM-DD",
  "requirements": {
    "items": [{"name": "item name", "quantity": number, "specifications": "details"}],
    "deliveryTimeline": "timeline details",
    "warranty": "warranty requirements",
    "paymentTerms": "payment terms"
  },
  "paymentTerms": "payment terms string",
  "warrantyPeriod": "warranty period string"
}

If any field is not mentioned, use reasonable defaults or null. Budget should be a number. Date should be in YYYY-MM-DD format.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response - remove markdown code blocks if present
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(cleanedText);
    return parsed;
  } catch (error) {
    console.error('Error parsing RFP:', error);
    throw new Error('Failed to parse RFP from text');
  }
}

// Parse vendor email response into structured proposal data
async function parseVendorProposal(emailContent, rfpDetails) {
  try {
    const prompt = `You are an expert procurement analyst. Parse this vendor's email response to an RFP into structured data.

RFP Details:
${JSON.stringify(rfpDetails, null, 2)}

Vendor Email:
"${emailContent}"

Extract and return ONLY valid JSON (no markdown, no code blocks):
{
  "totalPrice": <number or null>,
  "itemizedPricing": [{"item": "name", "price": number, "quantity": number}],
  "deliveryTime": "delivery timeline",
  "terms": "terms and conditions mentioned",
  "warranty": "warranty details",
  "paymentTerms": "payment terms offered",
  "additionalNotes": "any other important information"
}

If information is not provided, use null for that field.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    
    return parsed;
  } catch (error) {
    console.error('Error parsing vendor proposal:', error);
    throw new Error('Failed to parse vendor proposal');
  }
}

// Compare proposals and generate AI recommendation
async function compareProposals(rfp, proposals) {
  try {
    const prompt = `You are an expert procurement advisor. Analyze these vendor proposals for an RFP and provide a recommendation.

RFP Details:
Title: ${rfp.title}
Budget: $${rfp.budget}
Requirements: ${JSON.stringify(rfp.requirements)}

Vendor Proposals:
${proposals.map((p, idx) => `
Vendor ${idx + 1} (${p.vendor.name}):
- Total Price: $${p.totalPrice || 'Not specified'}
- Delivery Time: ${p.deliveryTime || 'Not specified'}
- Terms: ${p.terms || 'Not specified'}
- Parsed Data: ${JSON.stringify(p.parsedData)}
`).join('\n')}

Provide your analysis in the following JSON format (no markdown, no code blocks):
{
  "summary": "Brief overall summary of all proposals",
  "comparison": [
    {
      "vendorName": "Vendor name",
      "score": <number 0-100>,
      "pros": ["pro 1", "pro 2"],
      "cons": ["con 1", "con 2"]
    }
  ],
  "recommendation": {
    "recommendedVendor": "Vendor name",
    "reasoning": "Detailed explanation of why this vendor is recommended",
    "considerations": "Important factors to consider before making final decision"
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleanedText);
    
    return analysis;
  } catch (error) {
    console.error('Error comparing proposals:', error);
    throw new Error('Failed to compare proposals');
  }
}

// Generate individual proposal summary and score
async function generateProposalSummary(proposal, rfp) {
  try {
    const prompt = `Analyze this vendor proposal against the RFP requirements and provide a summary and score.

RFP Budget: $${rfp.budget}
RFP Requirements: ${JSON.stringify(rfp.requirements)}

Proposal:
Total Price: $${proposal.totalPrice || 'Not specified'}
Delivery Time: ${proposal.deliveryTime || 'Not specified'}
Parsed Data: ${JSON.stringify(proposal.parsedData)}

Return JSON only (no markdown):
{
  "summary": "2-3 sentence summary of this proposal",
  "score": <number 0-100 based on how well it meets requirements>,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const summary = JSON.parse(cleanedText);
    
    return summary;
  } catch (error) {
    console.error('Error generating proposal summary:', error);
    return {
      summary: 'Unable to generate summary',
      score: 50,
      strengths: [],
      weaknesses: []
    };
  }
}

module.exports = {
  parseRFPFromText,
  parseVendorProposal,
  compareProposals,
  generateProposalSummary
};
