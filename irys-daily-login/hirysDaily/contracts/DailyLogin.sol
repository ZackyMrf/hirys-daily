// contracts/DailyLogin.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DailyLogin {
    mapping(address => uint256) public lastLoginTs;
    event Login(address indexed user, uint256 timestamp);

    function dailyLogin() external {
        require(block.timestamp - lastLoginTs[msg.sender] >= 1 days, "Already logged in today");
        lastLoginTs[msg.sender] = block.timestamp;
        emit Login(msg.sender, block.timestamp);
    }
}
