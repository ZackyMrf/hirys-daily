async function main() {
    const DailyLogin = await ethers.getContractFactory("DailyLogin");
    const login = await DailyLogin.deploy({
      gasLimit: 5000000  // 👈 gas limit manual
    });
    
    // Use waitForDeployment instead of deployed
    await login.waitForDeployment();
    
    // Use getAddress instead of address property
    console.log("Contract deployed to:", await login.getAddress());
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });