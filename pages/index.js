import React, { useState, useEffect } from "react";

function Countdown({ expiryDate }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function updateCountdown() {
      const now = new Date().getTime();
      const end = new Date(expiryDate).getTime();
      const distance = end - now;

      if (distance <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiryDate]);

  return <div className="countdown" style={{ marginTop: 10, fontWeight: "bold" }}>{timeLeft}</div>;
}

export default function Home() {
  function getProgressColor(percentage) {
    const red = Math.min(255, Math.floor((percentage / 100) * 255));
    const green = Math.max(0, 255 - red);
    return `rgb(${red}, ${green}, 0)`;
  }

  const [iccid, setIccid] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function checkData() {
    setError(null);
    setResult(null);

    if (!iccid.trim()) {
      setError("Please enter ICCID.");
      return;
    }

    try {
      const response = await fetch(`/api/usage?iccid=${encodeURIComponent(iccid.trim())}`);
      const data = await response.json();

      if (!data.status) {
        setError(data.message || "No data found for this ICCID.");
        return;
      }

      if (!data.data.expiry_date) {
        // افتراضي تاريخ الانتهاء بعد 7 أيام لو غير موجود
        data.data.expiry_date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      setResult(data.data);
    } catch (err) {
      setError("Error fetching data. Please try again later.");
    }
  }

  return (
    <>
      <style>{`
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          margin: 0;
          background-color: #f4f4f4;
          text-align: center;
        }
        .logo-container {
          margin-bottom: 20px;
        }
        .logo-container img {
          width: 160px;
          height: auto;
          border-radius: 10px;
          object-fit: contain;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .container {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          max-width: 500px;
          margin: auto;
          box-shadow: 0 0 10px rgba(3, 143, 236, 0.3);
        }
        input {
          width: 100%;
          padding: 12px;
          font-size: 16px;
          margin: 10px 0;
          border-radius: 8px;
          border: 1px solid #ccc;
        }
        button {
          padding: 10px 20px;
          font-size: 16px;
          background-color: #1100ff;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        #result {
          margin-top: 25px;
        }
        .whatsapp-inline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background-color: #25D366;
          color: white;
          border-radius: 30px;
          font-weight: bold;
          text-decoration: none;
          margin-bottom: 20px;
        }
        .whatsapp-inline img {
          width: 20px;
          height: 20px;
        }
        .progress-bar {
          height: 20px;
          border-radius: 10px;
          background-color: #e0e0e0;
          overflow: hidden;
          margin: 10px 0;
        }
        .progress-bar-fill {
          height: 100%;
          transition: width 0.5s;
        }
        @media (max-width: 600px) {
          .container {
            padding: 15px;
          }
          input, button {
            font-size: 15px;
          }
          .logo-container img {
            width: 120px;
          }
        }
      `}</style>

      <div className="logo-container">
        <img src="https://files.catbox.moe/s83b16.png" alt="Company Logo" />
      </div>

      <a href="https://wa.me/97336636509" target="_blank" rel="noreferrer" className="whatsapp-inline">
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
        WhatsApp
      </a>
      <a
        href="https://www.instagram.com/esim_fly?igsh=YXJlem8wcWE3YWtu"
        target="_blank"
        rel="noreferrer"
        className="whatsapp-inline"
        style={{ backgroundColor: "#E1306C" }}
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" />
        Instagram
      </a>

      <div className="container">
        <h2>Check Data Usage</h2>
        <input
          type="text"
          id="iccid"
          placeholder="89.....Enter ICCID...."
          value={iccid}
          onChange={(e) => setIccid(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") checkData();
          }}
        />
        <button onClick={checkData}>Check</button>

        <div id="result">
          {error && <p style={{ color: "red" }}>{error}</p>}

          {result && (
            <div
              style={{
                background: "#f9f9f9",
                padding: 20,
                borderRadius: 10,
                border: "1px solid #ddd",
                marginTop: 20,
              }}
            >
              <p>
                <strong>ICCID:</strong> {iccid}
              </p>
              <p>
                <strong>Total Data:</strong> {result.initial_data_quantity} GB
              </p>
              <p>
                <strong>Remaining:</strong> {result.rem_data_quantity} GB
              </p>
              <p>
                <strong>Used:</strong> {(
                  result.initial_data_quantity - result.rem_data_quantity
                ).toFixed(2)}{" "}
                GB
              </p>

              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${(
                      ((result.initial_data_quantity - result.rem_data_quantity) /
                        result.initial_data_quantity) *
                      100
                    ).toFixed(1)}%`,
                    backgroundColor: getProgressColor(
                      ((result.initial_data_quantity - result.rem_data_quantity) /
                        result.initial_data_quantity) *
                        100
                    ),
                  }}
                />
              </div>

              <Countdown expiryDate={result.expiry_date} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
