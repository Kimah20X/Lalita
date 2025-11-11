import axios from "axios";

class MonnifyService {
  constructor() {
    this.baseURL = process.env.MONNIFY_BASE_URL || "https://sandbox.monnify.com";
    this.apiKey = process.env.MONNIFY_API_KEY;
    this.secretKey = process.env.MONNIFY_SECRET_KEY;
    this.contractCode = process.env.MONNIFY_CONTRACT_CODE;
  }

  async getAuthToken() {
    try {
      console.log('🔑 Getting Monnify auth token...');
      
      const credentials = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString('base64');
      
      const response = await axios.post(
        `${this.baseURL}/api/v1/auth/login`,
        {},
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('✅ Auth response:', response.data);

      if (!response.data.responseBody?.accessToken) {
        throw new Error('No access token in response');
      }

      return response.data.responseBody.accessToken;
    } catch (error) {
      console.error('❌ Monnify auth failed:', error.response?.data || error.message);
      throw new Error(`Authentication failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async initializeTransaction(transactionData) {
    try {
      console.log('🚀 Initializing transaction...', transactionData);

      const authToken = await this.getAuthToken();

      const payload = {
        amount: transactionData.amount,
        customerName: transactionData.customerName,
        customerEmail: transactionData.customerEmail,
        paymentReference: transactionData.paymentReference,
        paymentDescription: transactionData.paymentDescription || `Deposit - ${transactionData.paymentReference}`,
        currencyCode: "NGN",
        contractCode: this.contractCode,
        redirectUrl: `${process.env.APP_URL || 'http://localhost:5000'}/payment/callback`,
        paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
      };

      console.log('📦 Monnify payload:', payload);

      const response = await axios.post(
        `${this.baseURL}/api/v1/merchant/transactions/init-transaction`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      console.log('✅ Transaction initialized:', response.data);
      
      if (!response.data.responseBody) {
        throw new Error('No response body from Monnify');
      }

      return response.data.responseBody;
    } catch (error) {
      console.error('❌ Transaction initialization failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
}

// Create singleton instance
const monnify = new MonnifyService();
export default monnify;
