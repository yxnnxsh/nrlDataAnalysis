const { default: puppeteer } = require("puppeteer");
const fs = require("fs");

const data = {};
for (let season = 2018; season < 2023; season++) {
  data[season] = {};
  let round;
  for (round = 1; season === 2020 ? round <= 24 : round <= 29; round++) {
    data[season][round] = [];
  }
}

let browser;

async function main() {
  browser = await puppeteer.launch();
  for (let season = 2018; season < 2023; season++) {
    for (let round = 1; round <= 29; round++) {
      let numOfGames;

      if (season === 2020) {
        if (round === 21) numOfGames = 4;
        if (round === 22 || round === 23) numOfGames = 2;
        if (round === 24) numOfGames = 1;
        if (round < 21) numOfGames = 8;
      } else if (
        (season === 2019 && (round === 12 || round === 16)) ||
        (season !== 2019 &&
          season !== 2020 &&
          (round === 13 || round === 17)) ||
        (season !== 2020 && round === 26)
      ) {
        numOfGames = 4;
      } else {
        if (round <= 25) numOfGames = 8;
        if (round > 26 && round < 29) numOfGames = 2;
        if (round === 29) numOfGames = 1;
      }

      data[season][round] = await getTeams(season, round, numOfGames, browser);
    }
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
      console.error(
        `Error on season ${season}, round ${round}, game ${i}:`,
        error
      );
    }
  }

  await page.close();

  console.log(roundMatchups);

  return roundMatchups;
}

main();

function parseTeams(matchupStr) {
  const regEx = /^Match:\s(?<homeTeam>[\w\s]+)\svs\s(?<awayTeam>[\w\s]+)$/;
  const match = matchupStr.match(regEx);
  if (match === null) return undefined;
  const { homeTeam, awayTeam } = match.groups;
  return [homeTeam, awayTeam];
}

module.exports = {
  main: main,
  getTeams: getTeams,
  parseTeams: parseTeams,
};
