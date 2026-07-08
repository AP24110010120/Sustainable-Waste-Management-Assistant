import { useState } from "react";
import API from "../services/api";

function WasteScanner() {
    const [item, setItem] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const handleScan = async () => {

        if (!item.trim()) {
            alert("Please enter a waste item.");
            return;
        }

        setLoading(true);
        setResult("");

        try {

            const response = await API.post("/scan", {
                item: item.trim()
            });

            setResult(response.data.guide);

        } catch (error) {

            setResult("Unable to connect to the backend. Please try again.");

        } finally {

            setLoading(false);

        }

    };

    return (
        <div style={{
            maxWidth: "800px",
            margin: "40px auto",
            padding: "25px",
            textAlign: "center",
            fontFamily: "Arial"
        }}>

            <h1>♻️ Sustainable Waste Management Assistant</h1>

            <p>
                Enter the name of a waste item to receive AI-powered disposal guidance.
            </p>

            <input
                type="text"
                placeholder="Example: Plastic Bottle"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                style={{
                    width: "70%",
                    padding: "10px",
                    fontSize: "16px"
                }}
            />

            <button
                onClick={handleScan}
                disabled={loading}
                style={{
                    marginLeft: "10px",
                    padding: "10px 20px",
                    cursor: "pointer"
                }}
            >
                {loading ? "Scanning..." : "Scan"}
            </button>

            <br /><br />

            <textarea
                rows="15"
                style={{
                    width: "100%",
                    padding: "15px",
                    fontSize: "15px"
                }}
                value={result}
                readOnly
            />
        </div>
    );
}

export default WasteScanner;