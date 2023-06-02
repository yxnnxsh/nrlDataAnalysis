// Retrieves data directly from the NRL website

const puppeteer = require("puppeteer");
const fs = require("fs");

const data = [
  {
    year: 2018,
    dataset: [
      {
        stat: "Points",
        API_endpoint: 76,
        data: [],
      },
      {
        stat: "Tries",
        API_endpoint: 38,
        data: [],
      },
      {
        stat: "Goals",
        API_endpoint: 1000034,
        data: [],
      },
      {
        stat: "Linebreaks",
        API_endpoint: 30,
        data: [],
      },
      {
        stat: "Post Contact Metres",
        API_endpoint: 1000112,
        data: [],
      },
      {
        stat: "Line Engaged",
        API_endpoint: 1000025,
        data: [],
      },
      {
        stat: "Tackle Breaks",
        API_endpoint: 29,
        data: [],
      },
      {
        stat: "Try Assists",
        API_endpoint: 35,
        data: [],
      },
      {
        stat: "Offloads",
        API_endpoint: 28,
        data: [],
      },
      {
        stat: "Linebreak Assists",
        API_endpoint: 31,
        data: [],
      },
      {
        stat: "All Receipts",
        API_endpoint: 1000028,
        data: [],
      },
      {
        stat: "Conversions",
        API_endpoint: 1000209,
        data: [],
      },
      {
        stat: "Kick Metres",
        API_endpoint: 32,
        data: [],
      },
      {
        stat: "All Kicks",
        API_endpoint: 33,
        data: [],
      },
      {
        stat: "40/20",
        API_endpoint: 82,
        data: [],
      },
      {
        stat: "Tackles",
        API_endpoint: 3,
        data: [],
      },
      {
        stat: "Missed Tackles",
        API_endpoint: 4,
        data: [],
      },
      {
        stat: "Charge Downs",
        API_endpoint: 1000000,
        data: [],
      },
      {
        stat: "All Runs",
        API_endpoint: 1000038,
        data: [],
      },
      {
        stat: "Run Metres",
        API_endpoint: 1000037,
        data: [],
      },
      {
        stat: "Dummy Half Runs",
        API_endpoint: 81,
        data: [],
      },
      {
        stat: "Kick Return Metres",
        API_endpoint: 78,
        data: [],
      },
      {
        stat: "Errors",
        API_endpoint: 37,
        data: [],
      },
      {
        stat: "Penalties",
        API_endpoint: 1000026,
        data: [],
      },
      {
        stat: "Handling Errors",
        API_endpoint: 1000079,
        data: [],
      },
      {
        stat: "Ineffective Tackles",
        API_endpoint: 1000003,
        data: [],
      },
      {
        stat: "Player in Support",
        API_endpoint: 1000015,
        data: [],
      },
      {
        stat: "Decoy Runs",
        API_endpoint: 1000002,
        data: [],
      },
    ],
  },
];

async function getData() {
  const figures = JSON.parse(database.dataJSON);
  for (const yearBlock of figures) {
    for (const statBlock of yearBlock.dataset) {
      statBlock.data = [
        ...(await ExtractingData(yearBlock.year, statBlock.API_endpoint)),
      ];
    }
  }

  fs.writeFile("./2023PlayerData.json", JSON.stringify(figures), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("2023 player data successfully transferred");
    }
  });
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
