import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const MONNIFY_BASE = process.env.MONNIFY_BASE_URL;
const CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;
const API_KEY = process.env.MONNIFY_API_KEY;
const CLIENT_SECRET = process.env.MONNIFY_CLIENT_SECRET;

// STEP 1: Get Bearer Token
const getAuthToken = async () => {
  const response = await axios.post(
    `${MONNIFY_BASE}/api/v1/auth/login`,
    {},
    {
      auth: {
        username: API_KEY,
        password: CLIENT_SECRET,
      },
    }
  );
  return response.data.responseBody.accessToken;
};

// STEP 2: Initiate Payment
export const initiatePayment = async (req, res) => {
  try {
    const token = await getAuthToken();
    const { userId, amount, email } = req.body;

    const paymentData = {
      amount,
      customerName: "Lalita User",
      customerEmail: email,
      paymentReference: `LALITA-${Date.now()}`,
      paymentDescription: "Lalita Wallet Funding",
      currencyCode: "NGN",
      contractCode: CONTRACT_CODE,
      redirectUrl: "http://localhost:3000/wallet/success",
      paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
    };

    const response = await axios.post(
      `${MONNIFY_BASE}/api/v1/merchant/transactions/init-transaction`,
      paymentData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({
      message: "Payment initiated successfully",
      paymentLink: response.data.responseBody.checkoutUrl,
      transactionReference: response.data.responseBody.transactionReference,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
};
