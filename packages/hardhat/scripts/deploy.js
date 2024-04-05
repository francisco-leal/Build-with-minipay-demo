// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const SIXTY_SECS = 60;
    const unlockTime = currentTimestampInSeconds + SIXTY_SECS;

    const lockedAmount = hre.ethers.utils.parseEther("0.0001");

    const Lock = await hre.ethers.getContractFactory("Lock");
    const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

    console.log(`Unlock Time: ${unlockTime}`);

    await lock.deployed();

    console.log(
        `Lock with 0.0001 ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
