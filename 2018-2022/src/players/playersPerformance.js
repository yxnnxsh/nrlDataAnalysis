// Retrieves data directly from the NRL website

const puppeteer = require("puppeteer");
const fs = require("fs");
const {
  scrappingDetails,
  createDatabase,
} = require("/Users/yannihaddad/Desktop/nrl/dataStructures/playersPerformanceDataset");

let browser;
async function main() {
  browser = await puppeteer.launch();
  const data = createDatabase();

  for (let season = 2018; season < new Date().getFullYear(); season++) {
    for (stat of scrappingDetails) {
      data[season][stat.statLabel] = await ExtractingData(
        season,
        stat.API_endpoint
      );

      console.log(data[season]);
    }
  }

  browser.close();

  fs.writeFile(
    "/Users/yannihaddad/Desktop/nrl/data/playersPerformanceData.json",
    JSON.stringify(data),
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("2018-2022 player data successfully transferred");
      }
    }
  );
}

async function ExtractingData(season, API_endpoint) {
  const page = await browser.newPage();
  await page.goto(
    `https://www.nrl.com/stats/players/?competition=111&season=${season}&stat=${API_endpoint}`
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
