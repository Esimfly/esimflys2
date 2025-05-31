import fetch from "node-fetch";

export default async function handler(req, res) {
  const { iccid } = req.query;
  if (!iccid) return res.status(400).json({ status: false, message: "ICCID مطلوب" });

  try {
    // تسجيل الدخول
    const loginResponse = await fetch("https://esimcard.com/api/developer/reseller/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "dream-bh@hotmail.com",
        password: "37774188??Abc",
      }),
    });
    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    if (!token) return res.status(401).json({ status: false, message: "فشل تسجيل الدخول" });

    // استدعاء usage
    const usageResponse = await fetch(`https://esimcard.com/api/developer/reseller/my-sim/${iccid}/usage`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    const usageData = await usageResponse.json();
    console.log("Usage data:", usageData);

    // استدعاء الحزم bundles
    const bundlesResponse = await fetch(`https://esimcard.com/api/developer/reseller/my-bundles`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    const bundlesData = await bundlesResponse.json();
    console.log("Bundles data:", bundlesData.data);

    // بحث مرن عن الحزمة الخاصة بـ ICCID
    const matchedBundle = bundlesData.data.find(bundle =>
      bundle.sim.iccid === iccid ||
      bundle.sim.iccid.includes(iccid) ||
      iccid.includes(bundle.sim.iccid)
    );

    console.log("Matched bundle:", matchedBundle);

    const expiryDate = matchedBundle ? matchedBundle.date_expiry : null;

    res.json({
      status: true,
      data: {
        initial_data_quantity: usageData.data?.initial_data_quantity || 0,
        rem_data_quantity: usageData.data?.rem_data_quantity || 0,
        expiry_date: expiryDate,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "حدث خطأ في الخادم" });
  }
}
