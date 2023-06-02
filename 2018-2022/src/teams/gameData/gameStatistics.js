const { default: puppeteer } = require("puppeteer");
const jsonData = require("./drawTeamMatchupData.json");
const { Dataset } = require("/Users/yannihaddad/Desktop/nrl/dataset");
const fs = require("fs");

let browser;

async function main() {
  const data = [];
  browser = await puppeteer.launch();
  for (let season = 2018; season < new Date().getFullYear(); season++) {
    for (let round = 1; season !== 2020 ? round < 30 : round < 25; round++) {
      const gameData = await getGameData(
        season,
        round,
        jsonData[season][round],
        browser
      );

      console.log(gameData);

      data.push({
        season,
        round,
        gameData,
      });
    }
  }
  await browser.close();

  fs.writeFile("2018-2023gameStatistics.json", JSON.stringify(data), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Data successfully converted to json");
    }
  });
}

async function getGameData(season, round, roundMatchups, browser) {
  const page = await browser.newPage();
  const results = [];

  for (let i = 0; i < roundMatchups.length; i++) {
    let homeTeam = roundMatchups[i][0].replace(/\s/g, "-");
    let awayTeam = roundMatchups[i][1].replace(/\s/g, "-");

    let url;

    (season === 2020 && round > 20) || (season !== 2020 && round > 25)
      ? (url = regVfinals(season, round, homeTeam, awayTeam))
      : (url = `https://www.nrl.com/draw/nrl-premiership/${season}/round-${round}/${homeTeam}-v-${awayTeam}/`);

    await page.goto(url);

    const gameInfo = new Dataset();

    gameInfo.homeTeam = homeTeam;
    gameInfo.awayTeam = awayTeam;

    [
      gameInfo.homeTeam_FT_score,
      gameInfo.awayTeam_FT_score,
      gameInfo.conditions,
    ] = await page.evaluate(() => {
      const HFTS = parseInt(
        document
          .querySelector(".match-team__score--home")
          ?.innerText.split("\n")[1]
      );
      const AFTS = parseInt(
        document
          .querySelector(".match-team__score--away")
          ?.innerText.split("\n")[1]
      );
      const COND_Html = document.querySelectorAll(".match-weather__text span");
      const COND = COND_Html[1]?.innerText;
      return [HFTS, AFTS, COND];
    });

    const tryScorers = await page.evaluate(() => {
      const HTS_Html = document.querySelector(".match-centre-summary-group");
      const tryScorers = HTS_Html.querySelectorAll("ul");
      return [
        tryScorers[0]?.innerText.split("\n"),
        tryScorers[1]?.innerText.split("\n"),
      ];
    });

    !tryScorers[0][0]
      ? (gameInfo.homeTeam_tryscorers = null)
      : (gameInfo.homeTeam_tryscorers = tryScorers[0]);

    !tryScorers[1][0]
      ? (gameInfo.awayTeam_tryscorers = null)
      : (gameInfo.awayTeam_tryscorers = tryScorers[1]);

    [gameInfo.homeTeam_HT_score, gameInfo.awayTeam_HT_score] =
      await page.evaluate(() => {
        const match = document.querySelectorAll(".match-centre-summary-group");
        return [
          parseInt(
            match[match.length - 1].querySelectorAll(
              ".match-centre-summary-group__value"
            )[0]?.innerText
          ),
          parseInt(
            match[match.length - 1].querySelectorAll(
              ".match-centre-summary-group__value"
            )[1]?.innerText
          ),
        ];
      });

    const dataOptionsXpath =
      "//div[@class='tabs__trigger-scroller tabs__list-container u-hide-scrollbar u-momentum-scrolling u-scroll-behaviour-smooth o-rounded-box o-rounded-box--sharp-until-600 o-shadowed-ui-control']/ul/li[4]/a";
    await page.waitForXPath(dataOptionsXpath);
    const dataOptionsBtn = await page.$x(dataOptionsXpath);
    await dataOptionsBtn[0].click();

    gameInfo.homeTeam_possession = await page.evaluate(() => {
      return parseFloat(
        document
          .querySelector(".match-centre-card-donut__value--home")
          ?.innerText.split("%")[0]
      );
    });

    gameInfo.awayTeam_possession = await page.evaluate(() => {
      return parseFloat(
        document
          .querySelector(".match-centre-card-donut__value--away")
          ?.innerText.split("%")[0]
      );
    });

    const offensiveData = await page.evaluate(() => {
      const offsenseHtml = document.querySelectorAll(".u-spacing-mb-24")[1];
      const offsensiveHtmlData = offsenseHtml.querySelectorAll(
        ".u-spacing-pb-24.u-spacing-pt-16.u-width-100 dd"
      );

      const data = [];

      for (const stat of offsensiveHtmlData) {
        data.push(parseFloat(stat?.innerText));
      }

      return data;
    });

    if (offensiveData.length === 14) {
      [
        gameInfo.homeTeam_allRuns,
        gameInfo.awayTeam_allRuns,
        gameInfo.homeTeam_allRunMetres,
        gameInfo.awayTeam_allRunMetres,
        gameInfo.homeTeam_postContactMetres,
        gameInfo.awayTeam_postContactMetres,
        gameInfo.homeTeam_linebreaks,
        gameInfo.awayTeam_linebreaks,
        gameInfo.homeTeam_tacklebreaks,
        gameInfo.awayTeam_tacklebreaks,
        gameInfo.homeTeam_avgSetDist,
        gameInfo.awayTeam_avgSetDist,
        gameInfo.homeTeam_kickReturnMetres,
        gameInfo.awayTeam_kickReturnMetres,
      ] = offensiveData;
    } else {
      [
        gameInfo.homeTeam_allRuns,
        gameInfo.awayTeam_allRuns,
        gameInfo.homeTeam_allRunMetres,
        gameInfo.awayTeam_allRunMetres,
        gameInfo.homeTeam_postContactMetres,
        gameInfo.awayTeam_postContactMetres,
        gameInfo.homeTeam_linebreaks,
        gameInfo.awayTeam_linebreaks,
        gameInfo.homeTeam_tacklebreaks,
        gameInfo.awayTeam_tacklebreaks,
        gameInfo.homeTeam_kickReturnMetres,
        gameInfo.awayTeam_kickReturnMetres,
      ] = offensiveData;

      gameInfo.homeTeam_avgSetDist = gameInfo.awayTeam_avgSetDist = null;
    }

    const defensiveData = await page.evaluate(() => {
      const defHtml = document.querySelectorAll(".u-spacing-mb-24")[4];
      const defHtmlData = defHtml.querySelectorAll("dd");

      const data = [];
      for (let i = 0; i < defHtmlData.length; i++) {
        data.push(parseFloat(defHtmlData[i]?.innerText));
      }
      return data;
    });

    if (defensiveData.length === 8) {
      [
        gameInfo.homeTeam_tacklesMade,
        gameInfo.awayTeam_tacklesMade,
        gameInfo.homeTeam_missedTackles,
        gameInfo.awayTeam_missedTackles,
        gameInfo.homeTeam_intercepts,
        gameInfo.awayTeam_intercepts,
        gameInfo.homeTeam_ineffectiveTackles,
        gameInfo.awayTeam_ineffectiveTackles,
      ] = defensiveData;
    } else {
      [
        gameInfo.homeTeam_tacklesMade,
        gameInfo.awayTeam_tacklesMade,
        gameInfo.homeTeam_missedTackles,
        gameInfo.awayTeam_missedTackles,
        gameInfo.homeTeam_ineffectiveTackles,
        gameInfo.awayTeam_ineffectiveTackles,
      ] = defensiveData;

      gameInfo.homeTeam_intercepts = gameInfo.awayTeam_intercepts = null;
    }

    const passingStats = [];
    for (let i = 1; i <= 4; i++) {
      passingStats.push([
        parseInt(
          await page
            .$x(
              `//div[@id='tabs-match-centre-']/div[6]/section/div/div/div[3]/div/div[${i}]/figure/dl/div/dd`
            )
            .then((temp) => temp[0].evaluate((e) => e?.innerText))
        ),
        parseInt(
          await page
            .$x(
              `//div[@id='tabs-match-centre-']/div[6]/section/div/div/div[3]/div/div[${i}]/figure/dl/div[3]/dd`
            )
            .then((temp) => temp[0].evaluate((e) => e?.innerText))
        ),
      ]);
    }

    [
      [gameInfo.homeTeam_offloads, gameInfo.awayTeam_offloads],
      [gameInfo.homeTeam_receipts, gameInfo.awayTeam_receipts],
      [gameInfo.homeTeam_totalPasses, gameInfo.awayTeam_totalPasses],
      [gameInfo.homeTeam_dummyPasses, gameInfo.awayTeam_dummyPasses],
    ] = passingStats;

    const kickingData = await page.evaluate(() => {
      const kickingHtml = document.querySelectorAll(".u-spacing-mb-24")[3];
      const kickingHtmlData = kickingHtml.querySelectorAll("dd");

      const data = [];

      for (const stat of kickingHtmlData) {
        data.push(parseInt(stat?.innerText));
      }
      return data;
    });

    if (kickingData.length === 12) {
      [
        gameInfo.homeTeam_kicks,
        gameInfo.awayTeam_kicks,
        gameInfo.homeTeam_kickingMetres,
        gameInfo.awayTeam_kickingMetres,
        gameInfo.homeTeam_forcedDropouts,
        gameInfo.awayTeam_forcedDropouts,
        gameInfo.homeTeam_bombs,
        gameInfo.awayTeam_bombs,
        gameInfo.homeTeam_grubbers,
        gameInfo.awayTeam_grubbers,
        gameInfo.homeTeam_420,
        gameInfo.awayTeam_420,
      ] = kickingData;
    } else if (kickingData.length == 10) {
      [
        gameInfo.homeTeam_kicks,
        gameInfo.awayTeam_kicks,
        gameInfo.homeTeam_kickingMetres,
        gameInfo.awayTeam_kickingMetres,
        gameInfo.homeTeam_forcedDropouts,
        gameInfo.awayTeam_forcedDropouts,
        gameInfo.homeTeam_bombs,
        gameInfo.awayTeam_bombs,
        gameInfo.homeTeam_grubbers,
        gameInfo.awayTeam_grubbers,
      ] = kickingData;

      gameInfo.homeTeam_420 = gameInfo.awayTeam_420 = null;
    } else {
      [
        gameInfo.homeTeam_kicks,
        gameInfo.awayTeam_kicks,
        gameInfo.homeTeam_kickingMetres,
        gameInfo.awayTeam_kickingMetres,
        gameInfo.homeTeam_bombs,
        gameInfo.awayTeam_bombs,
        gameInfo.homeTeam_grubbers,
        gameInfo.awayTeam_grubbers,
      ] = kickingData;

      gameInfo.homeTeam_forcedDropouts =
        gameInfo.awayTeam_forcedDropouts =
        gameInfo.homeTeam_420 =
        gameInfo.awayTeam_420 =
          null;
    }

    const miscellaneousStats = await page.evaluate(() => {
      const stats_html = document.querySelectorAll(
        ".u-spacing-pb-24.u-spacing-pt-16.u-width-100 figcaption p span + span > span"
      );

      const data = [];
      for (const stat of stats_html) {
        data.push(parseFloat(stat?.innerText));
      }

      return data;
    });

    if (miscellaneousStats.length === 11) {
      gameInfo.homeTeam_completionRate = miscellaneousStats[1];
      gameInfo.awayTeam_completionRate = miscellaneousStats[2];
      gameInfo.homeTeam_avgPTBSpeed = miscellaneousStats[3];
      gameInfo.awayTeam_avgPTBSpeed = miscellaneousStats[5];
      gameInfo.homeTeam_kickDefusals = miscellaneousStats[7];
      gameInfo.awayTeam_kickDefusals = miscellaneousStats[8];
      gameInfo.homeTeam_tackleEfficieny = miscellaneousStats[9];
      gameInfo.awayTeam_tackleEfficieny = miscellaneousStats[10];
    } else {
      gameInfo.homeTeam_avgPTBSpeed = miscellaneousStats[1];
      gameInfo.awayTeam_avgPTBSpeed = miscellaneousStats[3];
      gameInfo.homeTeam_kickDefusals = miscellaneousStats[5];
      gameInfo.awayTeam_kickDefusals = miscellaneousStats[6];
      gameInfo.homeTeam_tackleEfficieny = miscellaneousStats[7];
      gameInfo.awayTeam_tackleEfficieny = miscellaneousStats[8];
    }

    const NegativePlayStats = [];
    for (let i = 1; i <= 2; i++) {
      NegativePlayStats.push([
        parseInt(
          await page
            .$x(
              `//div[@id='tabs-match-centre-']/div[6]/section/div/div/div[6]/div/div[${i}]/figure/dl/div/dd`
            )
            .then((temp) => temp[0].evaluate((e) => e?.innerText))
        ),
        parseInt(
          await page
            .$x(
              `//div[@id='tabs-match-centre-']/div[6]/section/div/div/div[6]/div/div[${i}]/figure/dl/div[3]/dd`
            )
            .then((temp) => temp[0].evaluate((e) => e?.innerText))
        ),
      ]);
    }

    [
      [gameInfo.homeTeam_errors, gameInfo.awayTeam_errors],
      [
        gameInfo.homeTeam_penaltiesConceded,
        gameInfo.awayTeam_penaltiesConceded,
      ],
    ] = NegativePlayStats;

    results.push(gameInfo);
  }

  await page.close();

  return results;
}

function regVfinals(season, round, homeTeam, awayTeam) {
  let url;
  if (season === 2020) {
    switch (round) {
      case 21:
        url = `https://www.nrl.com/draw/nrl-premiership/${season}/finals-week-1/${homeTeam}-v-${awayTeam}/`;
        break;
      case 22:
        url = `https://www.nrl.com/draw/nrl-premiership/${season}/finals-week-2/${homeTeam}-v-${awayTeam}/`;
        break;
      case 23:
        url = `https://www.nrl.com/draw/nrl-premiership/${season}/finals-week-3/${homeTeam}-v-${awayTeam}/`;
        break;
      case 24:
        url = `https://www.nrl.com/draw/nrl-premiership/${season}/grand-final/${homeTeam}-v-${awayTeam}/`;
        break;
    }
  } else if (season !== 2020) {
    switch (round) {
      case 26:
        url = `https://www.nrl.com/draw/nrl-premiership/${season}/finals-week-1/${homeTeam}-v-${awayTeam}/`;
        break;
      case 27:
        url = `https://www.nrl.com/draw/nrl-premiership/${season}/finals-week-2/${homeTeam}-v-${awayTeam}/`;
        break;
      case 28:
        url = `https://www.nrl.com/draw/nrl-premiership/${season}/finals-week-3/${homeTeam}-v-${awayTeam}/`;
        break;
      case 29:
        url = `https://www.nrl.com/draw/nrl-premiership/${season}/grand-final/${homeTeam}-v-${awayTeam}/`;
        break;
    }
  }

  return url;
}

main();
