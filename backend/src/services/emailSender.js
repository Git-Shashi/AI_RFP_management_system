const { transporter } = require('../config/email');

// Send RFP email to vendors
async function sendRFPEmail(rfp, vendors) {
  const results = [];

  for (const vendor of vendors) {
    try {
      const emailContent = `
Dear ${vendor.name},

You have been invited to submit a proposal for the following RFP:

RFP Title: ${rfp.title}

Description:
${rfp.description}

Budget: $${rfp.budget}

Deadline: ${new Date(rfp.deadline).toLocaleDateString()}

Requirements:
${JSON.stringify(rfp.requirements, null, 2)}

Payment Terms: ${rfp.paymentTerms || 'To be negotiated'}
Warranty Period: ${rfp.warrantyPeriod || 'To be negotiated'}

Please reply to this email with your proposal including:
- Itemized pricing
- Delivery timeline
- Terms and conditions
- Warranty details
- Any additional information

Please include "[RFP-${rfp.id}]" in your email subject line when responding.

Best regards,
Procurement Team
      `.trim();

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: vendor.email,
        subject: `RFP Invitation: ${rfp.title} [RFP-${rfp.id}]`,
        text: emailContent,
      };

      const info = await transporter.sendMail(mailOptions);
      
      results.push({
        vendorId: vendor.id,
        vendorEmail: vendor.email,
        success: true,
        messageId: info.messageId,
      });

      console.log(`Email sent to ${vendor.email}: ${info.messageId}`);
    } catch (error) {
      console.error(`Failed to send email to ${vendor.email}:`, error);
      results.push({
        vendorId: vendor.id,
        vendorEmail: vendor.email,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}

module.exports = {
  sendRFPEmail,
};
