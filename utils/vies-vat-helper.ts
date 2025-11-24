import VIESAPI from "viesapi-client";

const viesapi = new VIESAPI("demo", "demo");

viesapi
  .getVIESData("PL1234567890")
  .then((vies) => {

// 👈 Human-readable summary
  })
  .catch((e) => {
    console.error("Error:", e.message);
  });

export default viesapi;