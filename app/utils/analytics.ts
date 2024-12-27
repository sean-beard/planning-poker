const getSessionId = () => {
  const sessionKey = "session_id";
  const sessionExpiryKey = "session_expiry";

  const now = new Date().getTime();
  const thirtyMinutesInMs = 30 * 60 * 1000;
  let sessionId = localStorage.getItem(sessionKey);
  let sessionExpiry = parseInt(localStorage.getItem(sessionExpiryKey) || "0");

  if (!sessionId || now > sessionExpiry) {
    sessionId = crypto.randomUUID();
    sessionExpiry = now + thirtyMinutesInMs; // Set expiry for 30 minutes
    localStorage.setItem(sessionKey, sessionId);
    localStorage.setItem(sessionExpiryKey, sessionExpiry.toString());
  } else {
    sessionExpiry = now + thirtyMinutesInMs; // Extend by 30 minutes
    localStorage.setItem(sessionExpiryKey, sessionExpiry.toString());
  }
  return sessionId;
};

interface AnalyticsInput {
  productToken: string;
  apiBaseUrl: string;
}

class Analytics {
  private productToken: string;
  private apiBaseUrl: string;

  constructor({ productToken, apiBaseUrl }: AnalyticsInput) {
    this.productToken = productToken;
    this.apiBaseUrl = apiBaseUrl;
  }

  async trackVisit() {
    const sessionId = getSessionId();

    const analyticsData = {
      product_token: this.productToken,
      visit: {
        page_path: window.location.pathname,
        session_id: sessionId,
        user_agent: navigator.userAgent,
        referrer: document.referrer || "direct",
        created_at: new Date().toISOString(),
      },
    };

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analyticsData),
      });

      if (!response.ok) {
        console.error(
          "Failed to send analytics data",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error sending analytics data", error);
    }
  }
}

export const analytics = new Analytics({
  apiBaseUrl: "https://app-tracker.fly.dev",
  productToken: "3d0b7f4e-f250-4bcd-bd4e-87f54dafa93a",
});
