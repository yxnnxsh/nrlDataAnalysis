// Retrieves data directly from the NRL website

const puppeteer = require("puppeteer");
const fs = require("fs");

const scrappingDetails = [
  {
    statLabel: "Points",
    API_endpoint: 76,
  },
  {
    statLabel: "Tries",
    API_endpoint: 38,
  },
  {
    statLabel: "Goals",
    API_endpoint: 1000034,
  },
  {
    statLabel: "Linebreaks",
    API_endpoint: 30,
  },
  {
    statLabel: "Post Contact Metres",
    API_endpoint: 1000112,
  },
  {
    statLabel: "Line Engaged",
    API_endpoint: 1000025,
  },
  {
    statLabel: "Tackle Breaks",
    API_endpoint: 29,
  },
  {
    statLabel: "Try Assists",
    API_endpoint: 35,
  },
  {
    statLabel: "Offloads",
    API_endpoint: 28,
  },
  {
    statLabel: "Linebreak Assists",
    API_endpoint: 31,
  },
  {
    statLabel: "All Receipts",
    API_endpoint: 1000028,
  },
  {
    statLabel: "Conversions",
    API_endpoint: 1000209,
  },
  {
    statLabel: "Kick Metres",
    API_endpoint: 32,
  },
  {
    statLabel: "All Kicks",
    API_endpoint: 33,
  },
  {
    statLabel: "40/20",
    API_endpoint: 82,
  },
  {
    statLabel: "Tackles",
    API_endpoint: 3,
  },
  {
    statLabel: "Missed Tackles",
    API_endpoint: 4,
  },
  {
    statLabel: "Charge Downs",
    API_endpoint: 1000000,
  },
  {
    statLabel: "All Runs",
    API_endpoint: 1000038,
  },
  {
    statLabel: "Run Metres",
    API_endpoint: 1000037,
  },
  {
    statLabel: "Dummy Half Runs",
    API_endpoint: 81,
  },
  {
    statLabel: "Kick Return Metres",
    API_endpoint: 78,
  },
  {
    statLabel: "Errors",
    API_endpoint: 37,
  },
  {
    statLabel: "Penalties",
    API_endpoint: 1000026,
  },
  {
    statLabel: "Handling Errors",
    API_endpoint: 1000079,
  },
  {
    statLabel: "Ineffective Tackles",
    API_endpoint: 1000003,
  },
  {
    statLabel: "Player in Support",
    API_endpoint: 1000015,
  },
  {
    statLabel: "Decoy Runs",
    API_endpoint: 1000002,
  },
];

function createDatabase() {
  const data = {};
  const season = new Date().getFullYear();
  data[season] = {};
  for (stat of scrappingDetails) {
    data[season][stat.statLabel] = [];
  }

  return data;
}

let browser;
async function main() {
  browser = await puppeteer.launch();
  const data = createDatabase();

  for (stat of scrappingDetails) {
    data[2023][stat.statLabel] = await ExtractingData(stat.API_endpoint);
    console.log(await data[2023]);
  }

  browser.close();

  fs.writeFile(
    "/Users/yannihaddad/Desktop/nrl/data/2023playersPerformanceData.json",
    JSON.stringify(data),
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("2023 player data successfully transferred");
      }
    }
  );
}

async function ExtractingData(API_endpoint) {
  const page = await browser.newPage();
  await page.goto(
    `https://www.nrl.com/stats/players/?competition=111&season=2023&stat=${API_endpoint}`
  );

  const avgToggleXpath =
    "//div[@class='toggle-group o-shadowed-ui-control u-display-inline-flex']/button[2]";
  await page.waitForXPath(avgToggleXpath);
  const avgToggleBtn = await page.$x(avgToggleXpath);
  await avgToggleBtn[0].click();

  const data = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".table-tbody__tr"), (e) => ({
      player_name: `${
        e.querySelectorAll("td")[2].querySelector("a div").innerText
      } ${e.querySelectorAll("td")[2].querySelector("a div + div").innerText}`,
      player_team: e.querySelectorAll("td")[2].querySelector("a + div")
        .innerText,
      stat: e.lastChild.innerText,
    }))
  );

  await page.close();

  return data.slice(0, data.length / 2);
}

main();
