const { default: puppeteer } = require("puppeteer");
const fs = require("fs");
const { mainModule } = require("process");

const data = createDataStructure();
let browser;

async function main() {
  browser = await puppeteer.launch();

  for (let round = 1; round < 14; round++) {
    let numOfGames;
    round !== 13 ? (numOfGames = 8) : (numOfGames = 5);
    data[2023][round] = await getTeams(
      new Date().getFullYear(),
      round,
      numOfGames,
      browser
    );
  }
  await browser.close();

  fs.writeFile("./drawTeamMatchupData.json", JSON.stringify(data), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Team match up data successfully converted to json");
    }
  });
}

async function getTeams(season, round, numOfGames, browser) {
  const roundMatchups = [];

  const page = await browser.newPage();

  for (let i = 1; i <= numOfGames; i++) {
    try {
      await page.goto(
        `https://www.nrl.com/draw/?competition=111&round=${round}&season=${season}`
      );

      await page.waitForXPath(
        `//div[@id='draw-content']/section[${i}]/ul/li/div/div/h3`
      );
      const teams = parseTeams(
        await page
          .$x(`//div[@id='draw-content']/section[${i}]/ul/li/div/div/h3`)
          .then((temp) => temp[0].evaluate((e) => e.innerText))
      );

      roundMatchups.push(teams);
    } catch (error) {
      console.error(`Error on season 2023, round ${round}, game ${i}:`, error);
    }
  }

  await page.close();

  console.log(roundMatchups);

  return roundMatchups;
}

main();

function createDataStructure() {
  const data = {};
  data[2023] = {};
  for (let round = 1; round < 14; round++) {
    data[2023][round] = [];
  }

  return data;
}

function parseTeams(matchupStr) {
  const regEx = /^Match:\s(?<homeTeam>[\w\s]+)\svs\s(?<awayTeam>[\w\s]+)$/;
  const match = matchupStr.match(regEx);
  if (match === null) return undefined;
  const { homeTeam, awayTeam } = match.groups;
  return [homeTeam, awayTeam];
}
