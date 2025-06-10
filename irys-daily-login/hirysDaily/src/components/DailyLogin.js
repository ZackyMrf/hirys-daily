// src/components/DailyLogin.js
import { useState } from "react";
import { ethers } from "ethers";
import abi from "../abi/DailyLoginABI.json";

const CONTRACT_ADDRESS = "alamat_kontrak";

export default function DailyLogin() {
  const [status, setStatus] = useState("");

  const login = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);

      const tx = await contract.dailyLogin();
      setStatus("⏳ Menunggu konfirmasi...");
      await tx.wait();
      setStatus("✅ Berhasil login hari ini!");
    } catch (e) {
      if (e.message.includes("Already logged in")) {
        setStatus("⚠️ Anda sudah login hari ini.");
      } else {
        setStatus("❌ Error: " + e.message);
      }
    }
  };

  return (
    <div>
      <button onClick={login} className="btn">Daily Login</button>
      <p>{status}</p>
    </div>
  );
}
