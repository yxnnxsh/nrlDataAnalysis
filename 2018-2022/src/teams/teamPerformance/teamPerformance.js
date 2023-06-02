// Retrieves data directly from the NRL website

const puppeteer = require("puppeteer");
const fs = require("fs");
const {
  scrappingDetails,
  createDatabase,
} = require("/Users/yannihaddad/Desktop/nrl/dataStructures/teamPerformanceDataset");

let browser;
async function main() {
  browser = await puppeteer.launch();
  const data = createDatabase();

  for (let season = 2018; season < new Date().getFullYear(); season++) {
    for (stat of scrappingDetails) {
      data[season][stat.statLabel] = [
        ...(await ExtractingData(season, stat.API_endpoint)),
      ];
    }
  }

  browser.close();

  fs.writeFile(
    "/Users/yannihaddad/Desktop/nrl/data/2018-2022teamPerformanceData.json",
    JSON.stringify(figures),
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Historical team data successfully transferred");
      }
    }
  );
}

async function ExtractingData(season, API_endpoint) {
  const page = await browser.newPage();
  await page.goto(
    `https://www.nrl.com/stats/teams/?competition=111&season=${season}&stat=${API_endpoint}`
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

  await page.close();

  return data.slice(0, data.length / 2);
}

main();
