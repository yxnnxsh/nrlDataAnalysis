// Retrieves data directly from the NRL website
const puppeteer = require("puppeteer");
const fs = require("fs");

const dataset = [
  {
    stat: "Points",
    API_endpoint: 76,
    data: [],
  },
  {
    stat: "Goals",
    API_endpoint: 1000034,
    data: [],
  },
  {
    stat: "Possession",
    API_endpoint: 9,
    data: [],
  },
  {
    stat: "Supports",
    API_endpoint: 1000015,
    data: [],
  },
  {
    stat: "Linebreaks",
    API_endpoint: 30,
    data: [],
  },
  {
    stat: "Tackle Breaks",
    API_endpoint: 29,
    data: [],
  },
  {
    stat: "All Run Metres",
    API_endpoint: 1000037,
    data: [],
  },
  {
    stat: "Kick Return Metres",
    API_endpoint: 78,
    data: [],
  },
  {
    stat: "Offloads",
    API_endpoint: 28,
    data: [],
  },
  {
    stat: "Line Break Assists",
    API_endpoint: 31,
    data: [],
  },
  {
    stat: "Charge Downs",
    API_endpoint: 1000000,
    data: [],
  },
  {
    stat: "Tackles",
    API_endpoint: 3,
    data: [],
  },
  {
    stat: "Total Kicks",
    API_endpoint: 33,
    data: [],
  },
  {
    stat: "Conversion",
    API_endpoint: 1000209,
    data: [],
  },
  {
    stat: "Errors",
    API_endpoint: 37,
    data: [],
  },
  {
    stat: "Penalties Conceded",
    API_endpoint: 1000026,
    data: [],
  },
  {
    stat: "Tries",
    API_endpoint: 38,
    data: [],
  },
  {
    stat: "Field Goals",
    API_endpoint: 69,
    data: [],
  },
  {
    stat: "Set Completion",
    API_endpoint: 1000210,
    data: [],
  },
  {
    stat: "Line Engaged",
    API_endpoint: 1000025,
    data: [],
  },
  {
    stat: "Post Contact Metres",
    API_endpoint: 1000112,
    data: [],
  },
  {
    stat: "Decoy Runs",
    API_endpoint: 1000002,
    data: [],
  },
  {
    stat: "All Runs",
    API_endpoint: 1000038,
    data: [],
  },
  {
    stat: "Dummy Half Runs",
    API_endpoint: 81,
    data: [],
  },
  {
    stat: "Try Assists",
    API_endpoint: 35,
    data: [],
  },
  {
    stat: "All Receipts",
    API_endpoint: 1000028,
    data: [],
  },
  {
    stat: "Missed Tackles",
    API_endpoint: 4,
    data: [],
  },

  {
    stat: "Total Kick Metres",
    API_endpoint: 32,
    data: [],
  },

  {
    stat: "Ineffective Tackles",
    API_endpoint: 1000003,
    data: [],
  },
  {
    stat: "Handling Errors",
    API_endpoint: 1000079,
    data: [],
  },
];

let browser;
async function main() {
  browser = await puppeteer.launch();
  for (const statBlock of dataset) {
    statBlock.data = [...(await ExtractingData(statBlock.API_endpoint))];
  }
  await browser.close();

  fs.writeFile("./2023TeamData.json", JSON.stringify(data), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("2023 team data successfully transferred");
    }
  });
}

async function ExtractingData(API_endpoint) {
  // initialises page variable (opens up new page)
  const page = await browser.newPage();
  // to go to specific page
  await page.goto(
    `https://www.nrl.com/stats/teams/?competition=111&season=2023&stat=${API_endpoint}`
  );

  const avgToggleXpath =
    "//div[@class='toggle-group o-shadowed-ui-control u-display-inline-flex']/button[2]";
  await page.waitForXPath(avgToggleXpath);
  const avgToggleBtn = await page.$x(avgToggleXpath);
  await avgToggleBtn[0].click();

  const data = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".table-tbody__tr"), (e) => ({
      team_name: e.querySelector("td a span").innerText,
      stat: e.querySelectorAll("td")[4].innerText,
    }))
  );

  // closes the browser
  await page.close();

  return data.slice(0, 17);
}

getData();
