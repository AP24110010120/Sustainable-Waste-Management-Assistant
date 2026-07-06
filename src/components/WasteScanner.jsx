import { useState } from "react";
import API from "../services/api";

function WasteScanner() {

    const [item, setItem] = useState("");
    const [result, setResult] = useState("");

    const handleScan = async () => {

        if (!item) {
            alert("Enter a waste item");
            return;
        }

        try {

            const response = await API.post("/scan", {
                item: item
            });

            setResult(response.data.guide);

        } catch (error) {
            setResult("Error connecting to backend.");
        }

    };

    return (

        <div style={{ padding: "20px" }}>

            <h2>Sustainable Waste Management Assistant</h2>

            <input
                type="text"
                placeholder="Enter waste item"
                value={item}
                onChange={(e) => setItem(e.target.value)}
            />

            <button onClick={handleScan}>
                Scan
            </button>

            <br /><br />

            <textarea
                rows="15"
                cols="80"
                value={result}
                readOnly
            />

        </div>

    );

}

export default WasteScanner;