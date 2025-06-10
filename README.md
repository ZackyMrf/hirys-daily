# Daily Hirys

A daily check-in dApp that rewards users for consistent engagement on the Irys blockchain.

![Daily Hirys](https://img.shields.io/badge/Daily-Hirys-7E46F2?style=for-the-badge&logo=ethereum)

---

## Overview

**Daily Hirys** is a decentralized application (dApp) built on the Irys blockchain, designed to encourage daily user engagement. Users connect their MetaMask wallet, claim daily login rewards, and build streaks for consecutive check-ins.

---

## Features

- **Daily Check-in:** Claim your "Daily Hirys" once every 24 hours.
- **Streak Tracking:** Build and maintain consecutive daily login streaks.
- **Leaderboard:** See who else has checked in today and their current streaks.
- **Visual Rewards:** Enjoy celebratory animations and effects when claiming.
- **Persistence:** Your streak data is stored both on-chain and locally.
- **Responsive Design:** Works across desktop and mobile devices.

---

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Blockchain Interaction:** ethers.js
- **Smart Contract:** Solidity
- **Development Environment:** Hardhat
- **Network:** Irys Testnet

---

## Getting Started

### Prerequisites

- Node.js (v16+)
- MetaMask wallet
- Some IRYS tokens for gas fees

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zackymrf/irys-daily-login.git
   cd irys-daily-login/hirysDaily
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file with your private key (for contract deployment only):**
   ```
   PRIVATE_KEY=your_private_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Visit [http://localhost:5173](http://localhost:5173) to see the app running.

---

## Smart Contract

The core functionality is powered by a simple Solidity smart contract:

```solidity
// contracts/DailyLogin.sol
contract DailyLogin {
    mapping(address => uint256) public lastLoginTs;
    event Login(address indexed user, uint256 timestamp);

    function dailyLogin() external {
        require(block.timestamp - lastLoginTs[msg.sender] >= 1 days, "Already logged in today");
        lastLoginTs[msg.sender] = block.timestamp;
        emit Login(msg.sender, block.timestamp);
    }
}
```

---

## Deploying the Contract

1. **Compile the contract:**
   ```bash
   npx hardhat compile
   ```

2. **Deploy to Irys Testnet:**
   ```bash
   npx hardhat run scripts/deploy.js --network irysTestnet
   ```

3. **Update the contract address:**
   Replace `CONTRACT_ADDRESS` in `App.jsx` with your deployed contract address.

---

## Usage

1. **Connect Wallet:** Click "Connect Wallet" to link your MetaMask to the app.
2. **Daily Check-in:** Once connected, click "Claim Daily Hirys" to check in for the day.
3. **View Streaks:** See your current and best streaks on your dashboard.
4. **View Leaderboard:** Check who else has claimed their daily Hirys.

---

## Streak Mechanics

- **Streak Initiation:** First claim starts your streak at 1.
- **Streak Continuation:** Claiming on consecutive days increases your streak.
- **Streak Breaking:** Missing a day resets your streak to 1 on your next claim.
- **Streak Storage:** Your streak data is stored in localStorage for persistence.

---

## Deployment

The app is deployed using Vercel.  
You can visit the live version at:  
[https://irys-daily-login.vercel.app](https://irys-daily-login.vercel.app)

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built for the Irys ecosystem
- Character designs by [Character Designer]
- Special thanks to the Irys developer community

---

Created by [Zackymrf](https://github.com/zackymrf)
