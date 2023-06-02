// Retrieves data directly from the NRL website

const puppeteer = require("puppeteer");
const fs = require("fs");
const databaseJson = require("./teamsPerformance_dataStructure.js");

async function getData() {
  const database = JSON.parse(databaseJson.dataJSON);
  for (const season of database) {
    for (const stat of season.dataset) {
      stat.data = [...(await ExtractingData(season.year, stat.API_endpoint))];
    }
  }

  fs.writeFile("./historicalTeamData.json", JSON.stringify(figures), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Historical team data successfully transferred");
    }
  });
}

async function ExtractingData(year, API_endpoint) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    `https://www.nrl.com/stats/teams/?competition=111&season=${year}&stat=${API_endpoint}`
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
  await browser.close();

  return data.slice(0, data.length / 2);
}

getData();
