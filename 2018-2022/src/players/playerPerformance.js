// Retrieves data directly from the NRL website

const puppeteer = require("puppeteer");
const fs = require("fs");
const database = require("./playersPerformance_dataStructure.js");

async function getData() {
  const figures = JSON.parse(database.dataJSON);
  for (const yearBlock of figures) {
    for (const statBlock of yearBlock.dataset) {
      statBlock.data = [
        ...(await ExtractingData(yearBlock.year, statBlock.API_endpoint)),
      ];
    }
  }

  fs.writeFile(
    "./historicalPlayerData.json",
    JSON.stringify(figures),
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Historical player data successfully transferred");
      }
    }
  );
}

async function ExtractingData(year, API_endpoint) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    `https://www.nrl.com/stats/players/?competition=111&season=${year}&stat=${API_endpoint}`
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

  // closes the browser
  await browser.close();

  return data.slice(0, data.length / 2);
}
getData();
