import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CyberChachaGuardModule", (m) => {
  const guard = m.contract("CyberChachaGuard");
  return { guard };
});
